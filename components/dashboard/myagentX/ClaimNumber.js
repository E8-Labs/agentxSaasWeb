import { Box, CircularProgress, Fade, Modal } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { getUserLocalData } from '@/components/constants/constants'
import PurchaseNumberSuccess from '@/components/createagent/PurchaseNumberSuccess'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import { Checkbox } from '@/components/ui/checkbox'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import { PersistanceKeys } from '@/constants/Constants'
import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails'

const ClaimNumber = ({
  showClaimPopup,
  handleCloseClaimPopup,
  setOpenCalimNumDropDown,
  setSelectNumber,
  setPreviousNumber,
  previousNumber,
  AssignNumber,
  selectedUSer,
}) => {
  const stripePromise = getStripe()
  const timerRef = useRef(null)

  const [findNumber, setFindNumber] = useState('')
  const [findeNumberLoader, setFindeNumberLoader] = useState(false)
  const [foundeNumbers, setFoundeNumbers] = useState([])
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null)
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null)
  const [purchaseLoader, setPurchaseLoader] = useState(false)
  const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] =
    useState(false)
  const [openPurchaseErrSnack, setOpenPurchaseErrSnack] = useState('')
  const [isSnackVisible, setIsSnackVisible] = useState(false)
  const [errorType, setErrorType] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardData, getcardData] = useState('')

  const [isFromAdminOrAgency, setIsFromAdminOrAgency] = useState(null)
  const { isFreePlan: currentUserIsFreePlan } = usePlanCapabilities()

  useEffect(() => {

    const checkIsFromAdminOrAgency = async () => {
      const localData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      if (localData) {
        const data = JSON.parse(localData)
        // setIsFromAgencyOrAdmin(data);
        // console.log("Data of isFromAdminOrAgency is", data);
        // console.log("Data of selected user from dialer modal is", selectedUSer);
        const id = data?.subAccountData?.id ? data.subAccountData.id : selectedUSer?.id;
        const subUserProfile = await AdminGetProfileDetails(
          id,
        )
        setIsFromAdminOrAgency(subUserProfile)
      }
    }
    checkIsFromAdminOrAgency()
  }, [showClaimPopup])

  //code to select Purchase number
  const handlePurchaseNumberClick = (item, index) => {
    // //console.log;
    localStorage.setItem('numberPurchased', JSON.stringify(item))
    setSelectedPurchasedNumber((prevId) => (prevId === item ? null : item))
    setSelectedPurchasedIndex((prevId) => (prevId === index ? null : index))
  }

  const handleClose = (data) => {
    if (data) {
      setShowAddCard(false)
      handlePurchaseNumber()
      // setCards([newCard, ...cards]);
    }
  }

  // function for purchasing number api
  const handlePurchaseNumber = async () => {
    // return
    try {
      setPurchaseLoader(true)
      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      const agentDetails = localStorage.getItem('agentDetails')
      let MyAgentData = null
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      if (agentDetails) {
        // //console.log;
        const agentData = JSON.parse(agentDetails)
        // //console.log;
        MyAgentData = agentData
      }

      const ApiPath = Apis.purchaseNumber
      // //console.log;
      //// //console.log;
      const formData = new FormData()
      formData.append('phoneNumber', selectedPurchasedNumber.phoneNumber)
      if (MyAgentData?.id) {
        formData.append('mainAgentId', MyAgentData?.id)
      }

      if (selectedUSer || isFromAdminOrAgency) {
        formData.append('userId', selectedUSer?.id || isFromAdminOrAgency?.subAccountData?.id || isFromAdminOrAgency?.id)
      }

      for (let [key, value] of formData.entries()) {
        console.log("key in formData is", key,  value);
      }

      //for testing
      // localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
      // setOpenPurchaseSuccessModal(true);
      // if (setSelectNumber) {
      //     setSelectNumber(selectedPurchasedNumber.phoneNumber);
      // }
      // setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
      // if (setOpenCalimNumDropDown) {
      //     setOpenCalimNumDropDown(false);
      // }

      // return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'multipart/form-data',
          // "Content-Type": "application/json"
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setOpenPurchaseSuccessModal(true)
          setPreviousNumber([...previousNumber, selectedPurchasedNumber])
          if (setSelectNumber) {
            setSelectNumber(selectedPurchasedNumber.phoneNumber)
          }

          UserDetails.user.checkList.checkList.numberClaimed = true
          localStorage.setItem('User', JSON.stringify(D))

          window.dispatchEvent(
            new CustomEvent('UpdateCheckList', { detail: { update: true } }),
          )
          localStorage.setItem(
            'purchasedNumberDetails',
            JSON.stringify(response.data.data),
          )
        } else if (response.data.status === false) {
          setOpenPurchaseErrSnack(response.data.message)
          setIsSnackVisible(true)
          setErrorType(SnackbarTypes.Error)
        }
      }
    } catch (error) {
      // console.error("Error occured in purchase number api is: --", error);
    } finally {
      setPurchaseLoader(false)
    }
  }

  //test code for checking update check list
  const handleTestClose = () => {
    const localData = localStorage.getItem('User')
    if (localData) {
      let D = JSON.parse(localData)
      D.user.checkList.checkList.numberClaimed = true
      localStorage.setItem('User', JSON.stringify(D))
    }
    window.dispatchEvent(
      new CustomEvent('UpdateCheckList', { detail: { update: true } }),
    )
    handleCloseClaimPopup()
  }

  //function to fine numbers api
  const requestCounter = useRef(0)
  const handleFindeNumbers = async (number) => {
    const currentRequest = ++requestCounter.current
    try {
      setFindeNumberLoader(true)
      let ApiPath = `${Apis.findPhoneNumber}?areaCode=${number}`

      // Add userId parameter if selectedUSer is provided (for agency/admin searching on behalf of subaccounts)
      if (selectedUSer?.id) {
        ApiPath += `&userId=${selectedUSer.id}`
      }

      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      // //console.log;
      // return

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        // Only update state if this request is still the latest one
        if (currentRequest === requestCounter.current) {
          if (response?.data?.status) {
            setFoundeNumbers(response.data.data)
          } else {
            setFoundeNumbers([])
          }
        }
      }
    } catch (error) {
      // console.error("Error occured in finde number api is :---", error);
    } finally {
      if (requestCounter.current === currentRequest) {
        setFindeNumberLoader(false)
      }
    }
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
      zIndex: 1600,
    },
  }

  const fcInputClassName =
    'h-[40px] w-full rounded-[8px] border-[0.5px] border-black/10 bg-white px-[10px] text-[14px] font-normal text-black placeholder:text-black/50 outline-none transition-all duration-150 focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20'

  return (
    <div>
      <Modal
        open={showClaimPopup}
        closeAfterTransition
        disablePortal={false}
        slotProps={{
          root: {
            style: {
              zIndex: 1500,
            },
          },
        }}
        sx={{
          zIndex: 1500, // Higher than LeadDetails drawer (1400) to appear on top
        }}
        BackdropProps={{
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
            zIndex: 1500,
          },
        }}

      >
        <Fade in={showClaimPopup} timeout={250}>
          <Box
            sx={{
              ...styles.claimPopup,
              zIndex: 1501,
              position: 'relative',
              outline: 'none',
            }}
          >
            <div className="mx-auto w-[400px] max-w-[90vw] overflow-hidden rounded-[12px] bg-white shadow-[0_4px_36px_rgba(0,0,0,0.25)] border border-[#eaeaea]">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-[#eaeaea]">
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold text-black">
                    {`Let's claim your phone number`}
                  </div>
                  <div className="hidden" aria-hidden="true">
                    Enter the 3 digit area code you would like to use
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseClaimPopup}
                  className="shrink-0 h-9 w-9 rounded-full bg-black/[0.04] hover:bg-black/[0.06] transition-colors duration-150 flex items-center justify-center"
                  aria-label="Close"
                >
                  <span className="text-[18px] leading-none text-black/70">
                    ×
                  </span>
                </button>
              </div>

              {/* Body */}
              <div className="px-4 py-4">
                {isSnackVisible && (
                  <AgentSelectSnackMessage
                    message={openPurchaseErrSnack}
                    type={errorType}
                    isVisible={isSnackVisible}
                    hide={() => {
                      setIsSnackVisible(false)
                      setOpenPurchaseErrSnack('')
                      setErrorType(null)
                    }}
                  />
                )}

                <div className="text-[13px] font-medium text-black/40">
                  Enter the 3 digit area code you would like to use
                </div>
                <div className="mt-2">
                  <input
                    className={fcInputClassName}
                    type="text"
                    placeholder="Ex: 619, 213, 313"
                    value={findNumber}
                    maxLength={3}
                    onChange={(e) => {
                      setFindeNumberLoader(true)
                      if (timerRef.current) {
                        clearTimeout(timerRef.current)
                      }

                      const value = e.target.value
                      setFindNumber(value.replace(/[^0-9]/g, ''))
                      if (value) {
                        timerRef.current = setTimeout(() => {
                          handleFindeNumbers(value)
                        }, 500)
                      } else {
                        return
                      }
                    }}
                  />
                </div>

                <div className="mt-4 max-h-[46vh] overflow-auto pr-1">
                  {findNumber ? (
                    <>
                      {findeNumberLoader ? (
                        <div className="flex flex-row justify-center py-6">
                          <CircularProgress size={28} />
                        </div>
                      ) : foundeNumbers.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {foundeNumbers.map((item, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handlePurchaseNumberClick(item, index)}
                              className="w-full text-left rounded-[12px] border bg-white p-3 transition-all duration-150 hover:border-brand-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                              style={{
                                borderColor:
                                  index === selectedPurchasedIndex
                                    ? 'hsl(var(--brand-primary))'
                                    : 'rgba(0,0,0,0.10)',
                                backgroundColor:
                                  index === selectedPurchasedIndex
                                    ? 'rgba(0,0,0,0.02)'
                                    : '#ffffff',
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-[14px] font-medium text-black">
                                    {item.phoneNumber}
                                  </div>
                                  <div className="mt-1 text-[13px] font-normal text-black/60">
                                    {item.locality} {item.region}
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 shrink-0">
                                  <div className="text-[14px] font-medium text-black">
                                    ${item.price}/mo
                                  </div>
                                  <Checkbox
                                    checked={index === selectedPurchasedIndex}
                                    className="h-5 w-5"
                                  />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-[14px] font-semibold text-center text-black/70">
                          Those numbers seem to be taken. Try a new search
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-6 text-[14px] font-semibold text-center text-black/70">
                      Enter number to search
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {!openPurchaseSuccessModal && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#eaeaea]">
                  <button
                    type="button"
                    onClick={handleCloseClaimPopup}
                    className="h-[40px] rounded-lg px-4 text-sm font-medium bg-black/[0.04] text-black hover:bg-black/[0.06] transition-colors duration-150 active:scale-[0.98]"
                  >
                    Cancel
                  </button>

                  {purchaseLoader ? (
                    <div className="h-[40px] w-[132px] flex items-center justify-center">
                      <CircularProgress size={22} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!selectedPurchasedNumber}
                      className="h-[40px] rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98] disabled:bg-black/10 disabled:text-black/60 disabled:hover:opacity-100 disabled:active:scale-100"
                      onClick={() => {
                        const userData = getUserLocalData()
                        if (userData) {
                          if (userData.user?.cards?.length === 0) {
                            setShowAddCard(true)
                          } else {
                            handlePurchaseNumber()
                          }
                        }
                      }}
                    >
                      Proceed to Buy
                    </button>
                  )}
                </div>
              )}
            </div>
          </Box>
        </Fade>
      </Modal>
      {/* Code for Purchase number success popup */}
      <Modal
        open={openPurchaseSuccessModal}
        // onClose={() => setAddKYCQuestion(false)}
        closeAfterTransition
        disablePortal={false}
        slotProps={{
          root: {
            style: {
              zIndex: 1600,
            },
          },
        }}
        sx={{
          zIndex: 1600, // Higher than claim modal (1500) to appear on top
        }}
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
            zIndex: 1600, // Match Modal z-index
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="lg:w-6/12 sm:w-full w-6/12"
          sx={{
            ...styles.claimPopup,
            zIndex: 1601, // Higher than backdrop (1600) to appear on top
            position: 'relative',
          }}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-8/12 w-full min-h-[50vh] max-h-[80vh] flex flex-col justify-between"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div>
                <div className="flex flex-row justify-end">
                  {/* <button onClick={() => { setOpenPurchaseSuccessModal(false) }}>
                                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                                    </button> */}
                </div>
                <PurchaseNumberSuccess
                  selectedNumber={selectedPurchasedNumber}
                  handleContinue={() => {
                    setOpenPurchaseSuccessModal(false)
                    handleCloseClaimPopup()
                    if (AssignNumber) {
                      AssignNumber(selectedPurchasedNumber.phoneNumber)
                    }
                  }}
                  isFreePlan={
                    selectedUSer || isFromAdminOrAgency
                      ? (() => {
                        const plan = isFromAdminOrAgency?.plan
                        if (!plan) return false
                        const type = plan?.type?.toLowerCase?.() || plan?.planType?.toLowerCase?.() || ''
                        const title = plan?.title?.toLowerCase?.() || ''
                        return type.includes('free') || title.includes('free') || plan?.price === 0
                      })()
                      : currentUserIsFreePlan
                  }
                />
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
        disablePortal={false}
        slotProps={{
          root: {
            style: {
              zIndex: 1700,
            },
          },
        }}
        sx={{
          zIndex: 1700, // Higher than purchase success modal (1600) to appear on top
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            zIndex: 1700, // Match Modal z-index
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="lg:w-8/12 sm:w-full w-full"
          sx={{
            ...styles.paymentModal,
            zIndex: 1701, // Higher than backdrop (1700) to appear on top
            position: 'relative',
          }}
        >
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
                  getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleClose}
                  togglePlan={''}
                  // fromAdmin={true}
                  selectedUser={selectedUSer}
                // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default ClaimNumber
