import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Modal,
  Typography,
} from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { getUserLocalData } from '@/components/constants/constants'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'

/** Modal content transition: scale 0.95→1 and opacity 0→1 on enter; reverse on exit. */
function ScaleFadeTransition({ in: inProp, children, onEnter, onExited, timeout = 250 }) {
  const [stage, setStage] = useState(inProp ? 'entering' : 'exited')
  const rafRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (inProp) {
      setStage('entering')
      onEnter?.()
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setStage('entered'))
      })
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    } else {
      if (stage === 'exited') return
      setStage('exiting')
      timerRef.current = setTimeout(() => {
        onExited?.()
        setStage('exited')
      }, timeout)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [inProp, timeout, onExited, onEnter])

  const isEntering = stage === 'entering'
  const style = {
    opacity: isEntering || stage === 'exiting' ? 0 : 1,
    transform: isEntering || stage === 'exiting' ? 'scale(0.95)' : 'scale(1)',
    transition: `opacity ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  }

  return <div style={style}>{children}</div>
}

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
  const [addCardClosing, setAddCardClosing] = useState(false)
  const pendingConfirmRef = useRef(null)
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

  useEffect(() => {
    if (showAddCard) setAddCardClosing(false)
  }, [showAddCard])

  const handleCloseAddCard = () => setAddCardClosing(true)

  const handleAddCardExited = () => {
    setShowAddCard(false)
    setAddCardClosing(false)
    if (pendingConfirmRef.current) {
      onConfirm(pendingConfirmRef.current)
      pendingConfirmRef.current = null
    }
  }

  const handleClose = (data) => {
    if (data) {
      pendingConfirmRef.current = data
      setAddCardClosing(true)
    }
  }
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: 0,
            width: '500px',
            maxWidth: '90%',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {/* Header */}
        <div
          className="flex flex-row items-center justify-between w-full"
          style={{ padding: 16, borderBottom: '1px solid #eaeaea', minHeight: 66 }}
        >
          <div className="start-campaign-label" style={{ fontSize: 18, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>
            Confirm <span style={{ color: 'hsl(var(--brand-primary))' }}>DNC</span> Charges
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Info Box */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            backgroundColor: 'hsl(var(--brand-primary) / 0.06)',
            padding: '10px 12px',
            borderRadius: '8px',
            margin: '0 16px 16px',
            border: '1px solid hsl(var(--brand-primary) / 0.15)',
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
              <InfoOutlinedIcon sx={{ color: 'hsl(var(--brand-primary))', fontSize: 20 }} />
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
                <InfoOutlinedIcon sx={{ color: 'hsl(var(--brand-primary))', fontSize: 20 }} />
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
        <DialogContent sx={{ padding: '0 16px 16px', fontSize: '14px', '& .MuiTypography-root': { fontSize: '14px' } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5,
            }}
          >
            <Typography className="start-campaign-label" sx={{ fontSize: '14px' }}>
              Total Leads
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
              {displayLeadCount}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5,
            }}
          >
            <Typography className="start-campaign-label" sx={{ fontSize: '14px' }}>
              Cost Per Lead
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
              ${formatFractional2(displayPricePerLead)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2.5,
              pt: 2,
              borderTop: '1px solid #eaeaea',
            }}
          >
            <Typography className="start-campaign-label" sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Total Cost
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
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
        <DialogActions sx={{ padding: '12px', gap: 20, justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-lg px-4 text-base font-semibold bg-muted hover:bg-muted/80 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 active:scale-[0.98]"
            style={{ textTransform: 'none', color: '#111827' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 h-12 rounded-lg px-6 text-base font-semibold bg-brand-primary hover:bg-brand-primary/90 hover:shadow-[0_2px_8px_hsl(var(--brand-primary)/0.3)] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 active:scale-[0.98]"
            style={{ textTransform: 'none', color: '#ffffff' }}
            onClick={() => {
              if (userData?.user?.cards?.length === 0) {
                setShowAddCard(true)
              } else {
                onConfirm()
              }
            }}
          >
            Confirm & Pay
          </button>
        </DialogActions>
      </Dialog>

      {/* Add Payment Modal */}
      <Modal
        open={showAddCard}
        onClose={handleCloseAddCard}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
          },
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ScaleFadeTransition
          in={!addCardClosing}
          onExited={handleAddCardExited}
          timeout={250}
        >
          <Box
            className="lg:w-8/12 sm:w-full w-full max-w-[90vw]"
            sx={{
              ...styles.paymentModal,
              maxWidth: 560,
            }}
          >
            <div
              className="w-full flex flex-col bg-white rounded-[12px] overflow-hidden"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div
                className="flex flex-row items-center justify-between w-full"
                style={{ padding: 16, borderBottom: '1px solid #eaeaea', minHeight: 66 }}
              >
                <div className="start-campaign-label" style={{ fontSize: 18, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>
                  Payment <span style={{ color: 'hsl(var(--brand-primary))' }}>Details</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseAddCard}
                  className="outline-none rounded-lg p-1 hover:bg-black/5 transition-colors duration-150"
                  aria-label="Close"
                >
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={24}
                    width={24}
                    alt=""
                  />
                </button>
              </div>
              <div style={{ padding: 16 }}>
              <Elements stripe={stripePromise}>
                <AddCardDetails
                  handleClose={handleClose}
                  togglePlan={''}
                />
              </Elements>
            </div>
          </div>
        </Box>
        </ScaleFadeTransition>
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
