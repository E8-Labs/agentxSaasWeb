import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  Typography,
} from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { getUserLocalData } from '@/components/constants/constants'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'

export default function DncConfirmationPopup({
  open,
  onClose,
  onCancel,
  onConfirm,
  leadsCount,
  targetUserId,
  targetUserDetails,
}) {
  //console.log;
  const stripePromise = getStripe()

  const [userData, setUserData] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [creditCost, setCreditCost] = useState(null)
  const [minimumCost, setMinimumCost] = useState(null)
  const [isMinimumEnforced, setIsMinimumEnforced] = useState(false)
  const [originalLeadCount, setOriginalLeadCount] = useState(0)
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
  
  // Fetch target user's settings if targetUserDetails is provided but doesn't have userSettings
  useEffect(() => {
    const fetchTargetUserSettings = async () => {
      if (targetUserId && targetUserDetails && !targetUserDetails.userSettings) {
        try {
          const localData = localStorage.getItem('User')
          if (!localData) return
          
          const u = JSON.parse(localData)
          const settingsResponse = await axios.get(`${Apis.userSettings}?userId=${targetUserId}`, {
            headers: {
              Authorization: `Bearer ${u.token}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (settingsResponse?.data?.status) {
            // Update targetUserDetails with userSettings (we can't mutate props, but this is for display only)
            // The API response should already have the correct price, so this is just a fallback
          }
        } catch (error) {
          console.warn('⚠️ [DncConfirmationPopup] Could not fetch target user settings:', error)
        }
      }
    }
    
    fetchTargetUserSettings()
  }, [targetUserId, targetUserDetails])
  
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
      console.warn('⚠️ [DncConfirmationPopup] Could not fetch agency owner settings:', error)
    }
  }

  const getCreditCost = async () => {
    if (!userData || !leadsCount) return

    // Determine which user's role to check for minimum enforcement and pricing
    // If targetUserId is provided (agency/admin viewing subaccount), use that user
    // Otherwise, use the logged-in user
    const userToCheck = targetUserId && targetUserDetails 
      ? targetUserDetails 
      : userData?.user
    const isAgencySubAccount = userToCheck?.userRole === 'AgencySubAccount'

    // Prepare data object for API call
    const data = {
      leadCount: leadsCount,
      type: 'dnc',
    }
    
    // ALWAYS pass userId to ensure API correctly identifies user role and applies pricing
    // This is critical for subaccounts to get agency upsell pricing
    if (targetUserId) {
      data.userId = targetUserId
      console.log(`[DncConfirmationPopup] Using targetUserId: ${targetUserId} (role: ${targetUserDetails?.userRole})`)
    } else if (userData?.user?.id) {
      // Always pass the logged-in user's ID to ensure API uses correct context
      data.userId = userData.user.id
      console.log(`[DncConfirmationPopup] Using logged-in userId: ${userData.user.id} (role: ${userData.user.userRole})`)
    }
    
    console.log(`[DncConfirmationPopup] Calling API with:`, data)
    const calculatedCreditCost = await calculateCreditCost(data)
    console.log(`[DncConfirmationPopup] API Response:`, calculatedCreditCost)

    // Check if API response indicates minimum enforcement
    if (calculatedCreditCost && typeof calculatedCreditCost === 'object' && !calculatedCreditCost.message) {
      setCreditCost(calculatedCreditCost)
      
      // Check if API enforced minimum (for AgencySubAccount users)
      if (calculatedCreditCost.isMinimumEnforced && calculatedCreditCost.minimumRequired === 100) {
        // API enforced minimum - set minimum cost
        setMinimumCost(calculatedCreditCost)
        setIsMinimumEnforced(true)
        setOriginalLeadCount(calculatedCreditCost.originalLeadCount || leadsCount)
      } else {
        setIsMinimumEnforced(false)
        setMinimumCost(null)
        setOriginalLeadCount(leadsCount)
      }
    } else {
      // Fallback if API returns error or unexpected format
      console.error('Error calculating credit cost:', calculatedCreditCost)
      setCreditCost(null)
      setIsMinimumEnforced(false)
      setMinimumCost(null)
      setOriginalLeadCount(leadsCount)
    }
  }

  useEffect(() => {
    if (open && userData) {
      getCreditCost()
    }
  }, [open, userData, leadsCount, targetUserId, targetUserDetails])

  // Helper function to get DNC price - API response is the source of truth
  const getDncPrice = () => {
    // Priority 1: Use the calculated price from API response (this should be correct)
    // Check minimumCost first (when minimum is enforced)
    if (isMinimumEnforced && minimumCost) {
      const apiPrice = minimumCost?.pricePerLead || minimumCost?.pricing?.agencyPrice
      console.log(`[DncConfirmationPopup] getDncPrice: Using minimumCost price: $${apiPrice}`)
      if (apiPrice != null && apiPrice > 0) {
        return apiPrice
      }
    }
    // Then check creditCost (normal flow)
    if (creditCost) {
      const apiPrice = creditCost?.pricePerLead || creditCost?.pricing?.agencyPrice
      console.log(`[DncConfirmationPopup] getDncPrice: Using creditCost price: $${apiPrice}`)
      if (apiPrice != null && apiPrice > 0) {
        return apiPrice
      }
    }
    
    console.warn(`[DncConfirmationPopup] getDncPrice: API response missing price, using fallbacks`)
    
    // Priority 2: If targetUserId is provided (admin/agency adding for subaccount), use target user's DNC price
    if (targetUserId && targetUserDetails?.userSettings) {
      const dncPrice = targetUserDetails.userSettings.dncPrice
      const isUpselling = targetUserDetails.userSettings.upsellDnc
      if (isUpselling && dncPrice != null) {
        return dncPrice
      }
    }
    
    // Priority 3: For Invitee users, use agency owner's DNC price
    const userRole = userData?.user?.userRole || userData?.userRole
    if (userRole === 'Invitee' && agencyOwnerSettings) {
      const dncPrice = agencyOwnerSettings.dncPrice
      const isUpselling = agencyOwnerSettings.upsellDnc
      if (isUpselling && dncPrice != null) {
        return dncPrice
      }
    }
    
    // Priority 4: Use logged-in user's DNC price if available
    if (userData?.user?.userSettings) {
      const dncPrice = userData.user.userSettings.dncPrice
      const isUpselling = userData.user.userSettings.upsellDnc
      if (isUpselling && dncPrice != null) {
        return dncPrice
      }
    }
    
    // Fallback to default
    console.warn(`[DncConfirmationPopup] getDncPrice: Using default price: $0.03`)
    return 0.03
  }

  // Use minimum cost if enforced, otherwise use creditCost
  const displayLeadCount =
    isMinimumEnforced && minimumCost
      ? minimumCost?.creditsToReceive || 100
      : leadsCount
  const displayPricePerLead = getDncPrice()
  const displayTotalCost =
    isMinimumEnforced && minimumCost
      ? minimumCost?.totalCharge || 0
      : creditCost?.totalCharge ||
        (leadsCount < 34 ? 1 : leadsCount * displayPricePerLead)

  const handleClose = (data) => {
    if (data) {
      setShowAddCard(false)
      onConfirm()
      // setCards([newCard, ...cards]);
    }
  }
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
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
        <div className="flex w-full justify-end">
          <CloseBtn onClick={onClose} />
        </div>
        {/* Modal Title */}
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '20px', mt: 1 }}>
          Confirm DNC Charges
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
                {`${originalLeadCount || leadsCount} leads selected. Minimum payment is for 100 leads.`}
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
                <InfoOutlinedIcon sx={{ color: '#7902DF', fontSize: 20 }} />
                <Typography sx={{ fontSize: '14px', color: '#000' }}>
                  {`DNC Checklist is $${formatFractional2(displayPricePerLead)}/number.`}
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
                  {`If less than 20 leads, it's $1.`}
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
              ${formatFractional2(displayPricePerLead)}
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
              $
              {typeof displayTotalCost === 'number'
                ? displayTotalCost.toFixed(2)
                : displayLeadCount < 34
                  ? '1.00'
                  : (displayPricePerLead * displayLeadCount).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>

        {/* Buttons */}
        <DialogActions sx={{ justifyContent: 'space-between', mt: 3 }}>
          <div
            onClick={onClose}
            className=" flex w-[45%] text-[#6b7280] font-bold text-[16px]  py-3
                     items-center justify-center"
            style={{ textTransform: 'none', cursor: 'pointer' }}
          >
            Cancel
          </div>

          {/* <Button
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "16px",
            backgroundColor: "#7902DF",
            color: "white",
            borderRadius: "8px",
            padding: "10px 20px",
            "&:hover": { backgroundColor: "#6901C3" },
          }}
        >
          Confirm & Pay
        </Button> */}
          <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-brand-primary font-bold rounded-lg text-white text-center py-3"
            onClick={() => {
              if (userData?.user?.cards?.length === 0) {
                setShowAddCard(true)
              } else {
                onConfirm()
              }
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
        </DialogActions>
      </Dialog>

      {/* Add Payment Modal */}
      <Modal
        open={showAddCard} //addPaymentPopUp
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: '600',
                  }}
                >
                  Payment Details
                </div>
                <button onClick={() => setShowAddCard(false)}>
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <Elements stripe={stripePromise}>
                <AddCardDetails
                  //selectedPlan={selectedPlan}
                  // stop={stop}
                  // getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleClose}
                  togglePlan={''}
                  // fromAdmin={true}
                  // selectedUser={selectedUSer}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

const styles = {
  paymentModal: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  claimPopup: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}
