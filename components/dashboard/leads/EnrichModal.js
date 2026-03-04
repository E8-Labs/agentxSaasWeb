import CloseIcon from '@mui/icons-material/Close'
import { Box, CircularProgress, Modal, Tooltip } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
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
      if (stage !== 'entered') {
        setStage('entering')
        onEnter?.()
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = requestAnimationFrame(() => setStage('entered'))
        })
      }
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
  }, [inProp, onEnter, onExited, stage, timeout])

  let style = {
    transition: `opacity ${timeout}ms ease-out, transform ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
    opacity: 0,
    transform: 'scale(0.95)',
  }

  if (stage === 'entering' || stage === 'entered') {
    style = { ...style, opacity: 1, transform: 'scale(1)' }
  } else if (stage === 'exiting') {
    style = { ...style, opacity: 0, transform: 'scale(0.95)' }
  }

  if (stage === 'exited' && !inProp) {
    return null
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={style}>{children}</div>
    </div>
  )
}

export default function EnrichModal({
  showenrichModal,
  setShowenrichModal,
  setShowenrichConfirmModal,
  handleAddLead,
  Loader,
  setIsEnrichToggle,
  processedData,
  setCreditCost,
  creditCost,
  targetUserId,
  targetUserDetails,
}) {
  const stripePromise = getStripe()

  const [userData, setUserData] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [isMinimumEnforced, setIsMinimumEnforced] = useState(false)
  const [minimumCost, setMinimumCost] = useState(null)
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
      console.warn('⚠️ [EnrichModal] Could not fetch agency owner settings:', error)
    }
  }

  useEffect(() => {
    const getCreditCost = async () => {
      // Check if processedData exists and has data
      if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
        console.warn('processedData is empty or undefined in EnrichModal')
        return
      }

      const leadCount = processedData.length

      // Determine which user's role to check for minimum enforcement
      // If targetUserId is provided, check the target user's role from targetUserDetails
      // Otherwise, check the logged-in user's role
      const loggedInUserIsAgencySubAccount = userData?.user?.userRole === 'AgencySubAccount'
      const targetUserIsAgencySubAccount = targetUserId && targetUserDetails 
        ? targetUserDetails.userRole === 'AgencySubAccount'
        : false

      // Check if minimum should be enforced (either logged-in user or target user is AgencySubAccount)
      const shouldEnforceMinimum = (loggedInUserIsAgencySubAccount && !targetUserId) || targetUserIsAgencySubAccount

      // Prepare data object for API call
      let data = {
        leadCount: leadCount,
        type: 'enrichment',
      }
      // Include userId if targetUserId is provided (for admin/agency adding leads for subaccount/user)
      if (targetUserId) {
        data.userId = targetUserId
      }

      // Check if we need to enforce minimum for agency subaccount
      if (shouldEnforceMinimum && leadCount < 100) {
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
        setOriginalLeadCount(leadCount)

        // Also get the cost for the actual lead count to show comparison
        const calculatedCreditCost = await calculateCreditCost(data)
        setCreditCost(calculatedCreditCost)
      } else {
        // Normal flow - calculate for actual lead count
        // When targetUserId is provided, the API will handle minimum enforcement based on target user's role
        const calculatedCreditCost = await calculateCreditCost(data)

        // Check if the API response indicates minimum enforcement
        // The API returns isMinimumEnforced flag and minimumRequired field
        if (calculatedCreditCost && typeof calculatedCreditCost === 'object' && !calculatedCreditCost.message) {
          setCreditCost(calculatedCreditCost)
          
          // Check if API enforced minimum (for target users who are AgencySubAccount)
          if (calculatedCreditCost.isMinimumEnforced && calculatedCreditCost.minimumRequired === 100) {
            // API enforced minimum - set minimum cost
            setMinimumCost(calculatedCreditCost)
            setIsMinimumEnforced(true)
            setOriginalLeadCount(calculatedCreditCost.originalLeadCount || leadCount)
          } else {
            setIsMinimumEnforced(false)
            setMinimumCost(null)
            setOriginalLeadCount(leadCount)
          }
        } else {
          // Fallback if API returns error or unexpected format
          console.error('Error calculating credit cost:', calculatedCreditCost)
          setCreditCost(null)
          setIsMinimumEnforced(false)
          setMinimumCost(null)
          setOriginalLeadCount(leadCount)
        }
      }
    }
    if (showenrichModal && userData && processedData && processedData.length > 0) {
      getCreditCost()
    }
  }, [showenrichModal, userData, processedData, targetUserId, targetUserDetails])

  const handleEnrichFalse = () => {
    setIsEnrichToggle(false)
    setShowenrichModal(false)
  }

  const handleClose = (data) => {
    if (data) {
      setShowAddCard(false)
      setShowenrichConfirmModal(true)
      // setCards([newCard, ...cards]);
    }
  }

  return (
    <div>
      <Modal
        open={showenrichModal}
        // onClose={() => setShowAddLeadModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
          },
        }}
      >
        <Box
          className="lg:w-6/12 sm:w-9/12 w-10/12 "
          sx={{
            height: 'auto',
            bgcolor: 'transparent',
            borderRadius: 2,
            border: 'none',
            outline: 'none',
            mx: 'auto',
            my: '50vh',
            transform: 'translateY(-50%)',
          }}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full flex flex-col gap-3 overflow-hidden rounded-[12px] bg-white border border-[#eaeaea]"
              style={{
                boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                padding: 2,
                margin: 0,
                width: 400,
                maxWidth: '100%',
              }}
            >
              <div
                className="flex flex-row justify-between w-full"
                style={{
                  padding: '12px 16px',
                  height: 'auto',
                  borderBottom: '1px solid #eaeaea',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: '700' }}>
                  Lead Insight
                </div>
                <CloseBtn
                  onClick={() => {
                    handleEnrichFalse()
                  }}
                />
              </div>

              <div
                className="w-full flex flex-col items-center justify-center gap-4"
                style={{ margin: 0, paddingLeft: 16, paddingRight: 16 }}
              >
                <Image
                  src={'/svgIcons/sparkles.svg'}
                  height={33}
                  width={33}
                  alt="*"
                />

                <div style={{ fontSize: 18, fontWeight: '700' }}>
                  Enrich Lead
                </div>

                {isMinimumEnforced && minimumCost && (() => {
                  // Get the correct enrichment price from userSettings (prioritize target user's price)
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
                    if (minimumCost?.pricePerLead) {
                      return minimumCost.pricePerLead
                    }
                    if (minimumCost?.pricing?.agencyPrice) {
                      return minimumCost.pricing.agencyPrice
                    }
                    
                    // Fallback to default
                    return 0.05
                  }
                  
                  const enrichmentPrice = getEnrichmentPrice()
                  const totalChargeFor100Leads = enrichmentPrice * 100
                  
                  return (
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: 'hsl(var(--brand-primary))',
                        textAlign: 'center',
                        width: '30vw',
                        padding: '8px 12px',
                        backgroundColor: '#F4F0F5',
                        borderRadius: '8px',
                      }}
                    >
                      {`${originalLeadCount} leads selected. Minimum payment is for 100 leads. You will be charged $${totalChargeFor100Leads.toFixed(2)} for 100 leads.`}
                    </div>
                  )
                })()}

                <div className="flex flex-row gap-2 items-center">
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: '#00000060',
                    }}
                  >
                    credit cost ($
                    {(() => {
                      // Priority 1: If targetUserId is provided (admin/agency adding for subaccount), use target user's enrichment price
                      if (targetUserId && targetUserDetails?.userSettings) {
                        const enrichmentPrice = targetUserDetails.userSettings.enrichmentPrice
                        const isUpselling = targetUserDetails.userSettings.upsellEnrichment
                        if (isUpselling && enrichmentPrice != null) {
                          return enrichmentPrice.toFixed(2)
                        }
                      }
                      
                      // Priority 2: For Invitee users, use agency owner's enrichment price
                      const userRole = userData?.user?.userRole || userData?.userRole
                      if (userRole === 'Invitee' && agencyOwnerSettings) {
                        const enrichmentPrice = agencyOwnerSettings.enrichmentPrice
                        const isUpselling = agencyOwnerSettings.upsellEnrichment
                        if (isUpselling && enrichmentPrice != null) {
                          return enrichmentPrice.toFixed(2)
                        }
                      }
                      
                      // Priority 3: Use logged-in user's enrichment price if available
                      if (userData?.user?.userSettings) {
                        const enrichmentPrice = userData.user.userSettings.enrichmentPrice
                        const isUpselling = userData.user.userSettings.upsellEnrichment
                        if (isUpselling && enrichmentPrice != null) {
                          return enrichmentPrice.toFixed(2)
                        }
                      }
                      
                      // Priority 4: Use the calculated price from API response
                      if (isMinimumEnforced && minimumCost) {
                        return minimumCost?.pricePerLead?.toFixed(2) ||
                          minimumCost?.pricing?.agencyPrice?.toFixed(2) ||
                          '0.05'
                      }
                      if (creditCost) {
                        return creditCost?.pricePerLead?.toFixed(2) ||
                          creditCost?.pricing?.agencyPrice?.toFixed(2) ||
                          '0.05'
                      }
                      
                      // Fallback to default
                      return '0.05'
                    })()}
                    /lead)
                  </div>

                  <Tooltip
                    title="This is the cost for us to run the api call with perplexity"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: '#ffffff', // Ensure white background
                          color: '#333', // Dark text color
                          fontSize: '16px',
                          fontWeight: '500',
                          padding: '10px 15px',
                          borderRadius: '8px',
                          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                        },
                      },
                      arrow: {
                        sx: {
                          color: '#ffffff', // Match tooltip background
                        },
                      },
                    }}
                  >
                    <Image
                      src={'/svgIcons/infoIcon.svg'}
                      height={16}
                      width={16}
                      alt="*"
                      style={{ filter: 'brightness(0)' }}
                    />
                  </Tooltip>
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  {`By enriching this lead, you're giving your AI valuable context — pulling in public data to better understand who this person is and how to engage with them.`}
                </div>
              </div>

              <div
                className="flex flex-row items-center justify-between w-full"
                style={{ padding: '12px 16px' }}
              >
                {Loader ? (
                  <CircularProgress size={27} sx={{ color: 'hsl(var(--brand-primary))' }} />
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-1 h-[40px] rounded-lg bg-muted px-3 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98]"
                    onClick={() => {
                      handleEnrichFalse()
                    }}
                  >
                    Not Interested
                  </button>
                )}

                <button
                  type="button"
                  className="flex items-center justify-center h-[40px] rounded-lg bg-brand-primary px-4 text-sm font-medium text-white hover:opacity-90 transition-colors duration-150 active:scale-[0.98]"
                  onClick={() => {
                    if (userData?.user?.cards?.length === 0) {
                      setShowAddCard(true)
                    } else {
                      setShowenrichConfirmModal(true)
                    }
                  }}
                >
                  Enrich Lead
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

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
