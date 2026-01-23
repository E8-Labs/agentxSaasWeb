import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Button,
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
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '24px',
          width: '500px',
          maxWidth: '90%',
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={() => setShowenrichConfirmModal(false)}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: '#000',
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Modal Title */}
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '20px', mt: 1 }}>
        Confirm Lead Enrichment
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
          mb: 1,
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
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '16px' }}>
            Total Leads
          </Typography>
          <Typography sx={{ fontWeight: 'medium', fontSize: '16px' }}>
            {displayLeadCount}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '16px' }}>
            Cost Per Lead
          </Typography>
          <Typography sx={{ fontWeight: 'medium', fontSize: '16px' }}>
            ${displayPricePerLead}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            pt: 1,
            borderTop: '1px solid #ddd',
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '16px' }}>
            Total Cost
          </Typography>
          <Typography sx={{ fontWeight: 'medium', fontSize: '16px' }}>
            ${displayTotalCost}
          </Typography>
        </Box>
      </DialogContent>

      {/* Buttons */}
      <DialogActions sx={{ justifyContent: 'space-between', mt: 3 }}>
        <div
          onClick={() => setShowenrichConfirmModal(false)}
          className=" flex w-[45%] text-[#6b7280]font-bold text-[16px]  py-3 rounded-lg
                     items-center justify-center"
          style={{ textTransform: 'none', cursor: 'pointer' }}
        >
          Cancel
        </div>
        {Loader ? (
          <CircularProgress size={27} />
        ) : (
          <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-brand-primary font-bold rounded-lg text-white text-center py-3"
            onClick={() => {
              handleAddLead(true)
            }}
            style={{
              borderColor: '#ddd',
              color: '#fff',
              fontWeight: 'bold',
              textTransform: 'none',
              padding: '0.8rem',
              borderRadius: '10px',
              width: '45%',
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
