import CloseIcon from '@mui/icons-material/Close'
import { Box, CircularProgress, Modal, Tooltip } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { getUserLocalData } from '@/components/constants/constants'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'

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
}) {
  let stripePublickKey =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
      ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
      : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY
  const stripePromise = loadStripe(stripePublickKey)

  const [userData, setUserData] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [isMinimumEnforced, setIsMinimumEnforced] = useState(false)
  const [minimumCost, setMinimumCost] = useState(null)
  const [originalLeadCount, setOriginalLeadCount] = useState(0)

  useEffect(() => {
    let data = getUserLocalData()
    if (data) {
      setUserData(data)
    }
  }, [])

  useEffect(() => {
    const getCreditCost = async () => {
      console.log('processedData', processedData)

      const leadCount = processedData.length
      const isAgencySubAccount = userData?.user?.userRole === 'AgencySubAccount'

      // Check if we need to enforce minimum for agency subaccount
      if (isAgencySubAccount && leadCount < 100) {
        // Calculate cost for 100 leads (minimum requirement)
        let minimumData = {
          leadCount: 100,
          type: 'enrichment',
        }
        const minimumCostData = await calculateCreditCost(minimumData)
        console.log('minimumCostData for 100 leads', minimumCostData)
        console.log(
          'minimumCostData pricePerLead:',
          minimumCostData?.pricePerLead,
        )
        console.log('minimumCostData pricing:', minimumCostData?.pricing)
        setMinimumCost(minimumCostData)
        setIsMinimumEnforced(true)
        setOriginalLeadCount(leadCount)

        // Also get the cost for the actual lead count to show comparison
        let data = {
          leadCount: leadCount,
          type: 'enrichment',
        }
        const creditCost = await calculateCreditCost(data)
        console.log('creditCost', creditCost)
        console.log('creditCost pricePerLead:', creditCost?.pricePerLead)
        console.log('creditCost pricing:', creditCost?.pricing)
        setCreditCost(creditCost)
      } else {
        // Normal flow - calculate for actual lead count
        let data = {
          leadCount: leadCount,
          type: 'enrichment',
        }
        const creditCost = await calculateCreditCost(data)
        console.log('creditCost', creditCost)
        setCreditCost(creditCost)
        setIsMinimumEnforced(false)
        setMinimumCost(null)
        setOriginalLeadCount(leadCount)
      }
    }
    if (showenrichModal && userData) {
      getCreditCost()
    }
  }, [showenrichModal, userData])

  const handleEnrichFalse = () => {
    setIsEnrichToggle(false)
    setShowenrichModal(false)
  }

  const handleClose = (data) => {
    console.log('data of add card', data)
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
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
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
          <div className="flex flex-row justify-center w-full ">
            <div
              className="w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
                height: 'auto',
              }}
            >
              <div className="flex flex-row justify-between w-full">
                <div style={{ fontSize: 18, fontWeight: '700' }}>
                  Lead Insight
                </div>
                <CloseBtn
                  onClick={() => {
                    handleEnrichFalse()
                  }}
                />
              </div>

              <div className="w-full flex flex-col items-center justify-center mt-[90px] gap-4">
                <Image
                  src={'/svgIcons/sparkles.svg'}
                  height={37}
                  width={37}
                  alt="*"
                />

                <div style={{ fontSize: 18, fontWeight: '700' }}>
                  Enrich Lead
                </div>

                {isMinimumEnforced && minimumCost && (
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
                    {`${originalLeadCount} leads selected. Minimum payment is for 100 leads. You will be charged $${(minimumCost?.totalCharge || 0).toFixed(2)} for 100 leads.`}
                  </div>
                )}

                <div className="flex flex-row gap-2 items-center">
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: '#00000060',
                    }}
                  >
                    credit cost ($
                    {isMinimumEnforced && minimumCost
                      ? minimumCost?.pricePerLead ||
                        minimumCost?.pricing?.agencyPrice ||
                        '0.05'
                      : creditCost?.pricePerLead ||
                        creditCost?.pricing?.agencyPrice ||
                        '0.05'}
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
                    fontSize: 15,
                    fontWeight: '500',
                    width: '30vw',
                    textAlign: 'center',
                  }}
                >
                  {`By enriching this lead, you're giving your AI valuable context — pulling in public data to better understand who this person is and how to engage with them.`}
                </div>

                <div className="flex flex-row items-center justify-between w-[60%]">
                  {Loader ? (
                    <CircularProgress size={27} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      className="h-[53px] flex w-[45%] text-[#000000]  text-[16px] hover:text-brand-primary py-3 rounded-lg
                     items-center justify-center border rounded-lg"
                      style={{}}
                      onClick={() => {
                        // handleAddLead(false)
                        handleEnrichFalse()
                      }}
                    >
                      Not Interested
                    </button>
                  )}

                  <button
                    className="h-[53px] text-[16px] w-[143px] rounded-lg bg-brand-primary items-center justify-center text-white"
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
