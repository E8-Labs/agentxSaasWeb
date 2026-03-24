import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import { getUserLocalData } from '@/components/constants/constants'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'

export default function EnrichConfirmModal({
  showenrichConfirmModal,
  setShowenrichConfirmModal,
  handleAddLead,
  processedData,
  Loader,
  creditCost,
  targetUserId,
  targetUserDetails,
}) {
  const [userData, setUserData] = useState(null)
  const [minimumCost, setMinimumCost] = useState(null)
  const [isMinimumEnforced, setIsMinimumEnforced] = useState(false)
  const [agencyOwnerSettings, setAgencyOwnerSettings] = useState(null)

  useEffect(() => {
    let data = getUserLocalData()
    if (data) {
      setUserData(data)
      
      // For Invitee users, fetch agency owner's settings
      const userRole = data?.user?.userRole || data?.userRole
      if (userRole === 'Invitee') {
        fetchAgencyOwnerSettings()
      }
    }
  }, [])
  
  // Fetch agency owner's userSettings for Invitee users
  const fetchAgencyOwnerSettings = async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return
      
      const u = JSON.parse(localData)
      const userRole = u?.user?.userRole || u?.userRole
      
      if (userRole === 'Invitee') {
        // Get agency owner from team relationship
        const teamResponse = await axios.get(Apis.getTeam, {
          headers: {
            Authorization: `Bearer ${u.token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (teamResponse?.data?.status && teamResponse.data.admin) {
          const admin = teamResponse.data.admin
          if (admin?.id && admin?.userRole === 'Agency') {
            // Fetch agency owner's userSettings
            const settingsResponse = await axios.get(`${Apis.userSettings}?userId=${admin.id}`, {
              headers: {
                Authorization: `Bearer ${u.token}`,
                'Content-Type': 'application/json',
              },
            })
            
            if (settingsResponse?.data?.status) {
              setAgencyOwnerSettings(settingsResponse.data.data)
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ [EnrichConfirmModal] Could not fetch agency owner settings:', error)
    }
  }

  useEffect(() => {
    const checkMinimumRequirement = async () => {
      if (!showenrichConfirmModal || !userData || !processedData || !Array.isArray(processedData) || processedData.length === 0) return

      const leadCount = processedData.length
      
      // Check if creditCost prop indicates minimum enforcement (from API response)
      if (creditCost && typeof creditCost === 'object' && !creditCost.message) {
        if (creditCost.isMinimumEnforced && creditCost.minimumRequired === 100) {
          // API enforced minimum - set minimum cost
          setMinimumCost(creditCost)
          setIsMinimumEnforced(true)
        } else {
          setIsMinimumEnforced(false)
          setMinimumCost(null)
        }
      } else {
        // Fallback: Check if we need to enforce minimum for agency subaccount
        // Determine which user's role to check:
        // - If targetUserId is provided (agency/admin adding for subaccount), check target user's role
        // - Otherwise, check logged-in user's role
        const userToCheck = targetUserId && targetUserDetails 
          ? targetUserDetails 
          : userData?.user
        const isAgencySubAccount = userToCheck?.userRole === 'AgencySubAccount'

        if (isAgencySubAccount && leadCount < 100) {
          // Calculate cost for 100 leads (minimum requirement)
          let minimumData = {
            leadCount: 100,
            type: 'enrichment',
          }
          // Include userId if targetUserId is provided (for admin/agency adding leads for subaccount/user)
          if (targetUserId) {
            minimumData.userId = targetUserId
          }
          const minimumCostData = await calculateCreditCost(minimumData)
          setMinimumCost(minimumCostData)
          setIsMinimumEnforced(true)
        } else {
          setIsMinimumEnforced(false)
          setMinimumCost(null)
        }
      }
    }

    checkMinimumRequirement()
  }, [showenrichConfirmModal, userData, processedData, targetUserId, targetUserDetails, creditCost])

  // Helper function to get enrichment price
  const getEnrichmentPrice = () => {
    // Priority 1: If targetUserId is provided (admin/agency adding for subaccount), use target user's enrichment price
    if (targetUserId && targetUserDetails?.userSettings) {
      const enrichmentPrice = targetUserDetails.userSettings.enrichmentPrice
      const isUpselling = targetUserDetails.userSettings.upsellEnrichment
      if (isUpselling && enrichmentPrice != null) {
        return enrichmentPrice
      }
    }
    
    // Priority 2: For Invitee users, use agency owner's enrichment price
    const userRole = userData?.user?.userRole || userData?.userRole
    if (userRole === 'Invitee' && agencyOwnerSettings) {
      const enrichmentPrice = agencyOwnerSettings.enrichmentPrice
      const isUpselling = agencyOwnerSettings.upsellEnrichment
      if (isUpselling && enrichmentPrice != null) {
        return enrichmentPrice
      }
    }
    
    // Priority 3: Use logged-in user's enrichment price if available
    if (userData?.user?.userSettings) {
      const enrichmentPrice = userData.user.userSettings.enrichmentPrice
      const isUpselling = userData.user.userSettings.upsellEnrichment
      if (isUpselling && enrichmentPrice != null) {
        return enrichmentPrice
      }
    }
    
    // Priority 4: Use the calculated price from API response
    if (isMinimumEnforced && minimumCost) {
      return minimumCost?.pricePerLead || minimumCost?.pricing?.agencyPrice || 0.05
    }
    if (creditCost && typeof creditCost === 'object') {
      return creditCost?.pricePerLead || creditCost?.pricing?.agencyPrice || 0.05
    }
    
    // Fallback to default
    return 0.05
  }

  // Get the enrichment price as a number
  const enrichmentPrice = getEnrichmentPrice()

  // Use minimum cost if enforced, otherwise use creditCost
  const displayLeadCount =
    isMinimumEnforced && minimumCost
      ? minimumCost?.creditsToReceive || 100
      : creditCost?.leadCount || processedData?.length || 0
  const displayPricePerLead = enrichmentPrice.toFixed(2)

  // Calculate total cost using the correct price per lead from userSettings
  // We recalculate here because the API's totalCharge might have been calculated with default price
  const displayTotalCost = (() => {
    const actualPricePerLead = enrichmentPrice
    const actualLeadCount = displayLeadCount
    
    // Calculate base total using the correct price per lead
    let total = actualPricePerLead * actualLeadCount
    
    // Apply minimum charge logic: if less than 10 leads, minimum is $1
    if (actualLeadCount <= 10 && total < 1.0) {
      return '1.00'
    }
    
    // Apply minimum charge of $1.00 for small amounts
    if (total < 1.0) {
      return '1.00'
    }
    
    return total.toFixed(2)
  })()

  return (
    <Dialog
      open={showenrichConfirmModal}
      onClose={() => setShowenrichConfirmModal(true)}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: '1px solid #eaeaea',
          boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
          width: '400px',
          maxWidth: '90%',
          margin: 0,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid #eaeaea',
          px: 2,
          py: 1.5,
          m: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>
          Confirm Lead Enrichment
        </Typography>
        <IconButton
          onClick={() => setShowenrichConfirmModal(false)}
          sx={{ color: '#000', p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Info Box */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          // gap: 1.5,
          backgroundColor: '#F6F0FF',
          padding: '8px 12px',
          borderRadius: '8px',
          mb: 2,
          mx: 2,
          mt: 2,
        }}
      >
        {isMinimumEnforced && minimumCost && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
              borderRadius: '8px',
              mb: 0,
              width: '100%',
            }}
          >
            <InfoOutlinedIcon sx={{ color: '#7902DF', fontSize: 20 }} />
            <Typography
              sx={{ fontSize: '14px', color: '#000', fontWeight: '600' }}
            >
              {`${processedData?.length} leads selected. Minimum payment is for 100 leads.`}
            </Typography>
          </Box>
        )}
        {!isMinimumEnforced && (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
                // backgroundColor: "#F6F0FF",
                // padding: "12px 16px",
                borderRadius: '8px',
                mb: 0,
              }}
            >
              <InfoOutlinedIcon sx={{ color: '#000000', fontSize: 20 }} />
              <Typography sx={{ fontSize: '14px', color: '#000' }}>
                {`Enrichment is $${displayPricePerLead} / lead `}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
                // backgroundColor: "#F6F0FF",
                // padding: "12px 16px",
                borderRadius: '8px',
                mb: 0,
              }}
            >
              <InfoOutlinedIcon sx={{ color: 'transparent', fontSize: 20 }} />
              <Typography sx={{ fontSize: '14px', color: '#000' }}>
                {`If less than 10 leads, it's $1.`}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Modal Content */}
      <DialogContent sx={{ px: 2, py: 0, color: 'rgba(0,0,0,0.8)' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '14px' }}>
            Total Leads
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
            {displayLeadCount}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '14px' }}>
            Cost Per Lead
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
            ${displayPricePerLead}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 1.5,
            pt: 1,
            borderTop: '1px solid #ddd',
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '14px' }}>
            Total Cost
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
            ${displayTotalCost}
          </Typography>
        </Box>
      </DialogContent>

      {/* Buttons */}
      <DialogActions
        sx={{
          justifyContent: 'space-between',
          borderTop: '1px solid #eaeaea',
          px: 2,
          py: 1.5,
          mt: 2,
        }}
      >
        <div
          onClick={() => setShowenrichConfirmModal(false)}
          className="flex h-[40px] rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] items-center justify-center"
          style={{ textTransform: 'none', cursor: 'pointer' }}
        >
          Cancel
        </div>
        {Loader ? (
          <CircularProgress size={27} />
        ) : (
          <div
            className="cursor-pointer h-[40px] rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98] flex justify-center items-center"
            onClick={() => {
              handleAddLead(true)
            }}
            style={{
              textTransform: 'none',
            }}
          >
            Confirm & Pay
          </div>
        )}
        {/* <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-brand-primary font-bold rounded-lg text-white text-center py-3"
            onClick={onConfirm}
            style={{
              borderColor: "#ddd",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "none",
              padding: "0.8rem",
              borderRadius: "10px",
              width: "45%",
            }}
          >
            Confirm
          </div> */}
      </DialogActions>
    </Dialog>
  )
}
