import { Box, CircularProgress, Modal } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { getUserLocalData } from '@/components/constants/constants'
import PurchaseNumberSuccess from '@/components/createagent/PurchaseNumberSuccess'
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

  useEffect(() => {

    const checkIsFromAdminOrAgency = async () => {
    const localData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    if (localData) {
      const data = JSON.parse(localData)
      // setIsFromAgencyOrAdmin(data);
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

      // //console.log;

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
        formData.append('userId', selectedUSer?.id || isFromAdminOrAgency?.subAccountData?.id)
      }

      for (let [key, value] of formData.entries()) { }

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
          timeout: 1000,
          sx: {
            // zIndex: 1400,
            backgroundColor: '#00000020',
            zIndex: 1500, // Match Modal z-index
            // //backdropFilter: "blur(20px)",
          },
        }}
       
      >
        <Box
          className="lg:w-8/12 sm:w-full w-8/12"
          sx={{
            ...styles.claimPopup,
            zIndex: 1501, // Higher than backdrop (1500) to appear on top
            position: 'relative',
          }}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-8/12 w-full min-h-[50vh] max-h-[84vh] flex flex-col justify-between"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
                overflow: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              <div className=" h-[88%] overflow-hidden">
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
                <div className="flex flex-row justify-end">
                  <button onClick={handleCloseClaimPopup}>
                    <Image
                      src={'/assets/crossIcon.png'}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  {`Let's claim your phone number`}
                </div>
                <div
                  className="mt-2"
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Enter the 3 digit area code you would like to use
                </div>
                <div
                  className="mt-4"
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: '#15151550',
                  }}
                >
                  Number
                </div>
                <div className="mt-2">
                  <input
                    className="border border-[#00000010] outline-none p-3 rounded-lg w-full mx-2 focus:outline-none focus:ring-0"
                    type=""
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
                      // setFindNumber(e.target.value.replace(/[^0-9]/g, ""));
                      // handleFindeNumbers(value)
                      if (value) {
                        timerRef.current = setTimeout(() => {
                          handleFindeNumbers(value)
                        }, 500)
                      } else {
                        // //console.log;
                        return
                      }
                    }}
                  />
                </div>

                {findNumber ? (
                  <div>
                    {findeNumberLoader ? (
                      <div className="flex flex-row justify-center mt-6">
                        <CircularProgress size={35} />
                      </div>
                    ) : (
                      <div
                        className="mt-6 max-h-[40vh] overflow-auto"
                        style={{ scrollbarWidth: 'none' }}
                      >
                        {foundeNumbers.length > 0 ? (
                          <div className="w-full pb-12 ">
                            {foundeNumbers.map((item, index) => (
                              <div
                                key={index}
                                className="h-[10vh] rounded-2xl flex flex-col justify-center p-4 mb-4 "
                                style={{
                                  border:
                                    index === selectedPurchasedIndex
                                      ? '2px solid hsl(var(--brand-primary))'
                                      : '1px solid #00000020',
                                  backgroundColor:
                                    index === selectedPurchasedIndex
                                      ? 'hsl(var(--brand-primary) / 0.05)'
                                      : '',
                                }}
                              >
                                <button
                                  className="flex flex-row items-start justify-between outline-none"
                                  onClick={(e) => {
                                    handlePurchaseNumberClick(item, index)
                                  }}
                                >
                                  <div>
                                    <div style={styles.findNumberTitle}>
                                      {item.phoneNumber}
                                    </div>
                                    <div
                                      className="text-start mt-2"
                                      style={styles.findNumberDescription}
                                    >
                                      {item.locality} {item.region}
                                    </div>
                                  </div>
                                  <div className="flex flex-row items-start gap-4">
                                    <div style={styles.findNumberTitle}>
                                      ${item.price}/mo
                                    </div>
                                    <div>
                                      <Checkbox
                                        checked={index === selectedPurchasedIndex}
                                        className="h-5 w-5"
                                      />
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xl font-[600] text-center mt-4">
                            Those numbers seem to be taken. Try a new search
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xl font-[600] text-center mt-4">
                    Enter number to search
                  </div>
                )}
              </div>
              {!openPurchaseSuccessModal && (
                <div className="h-[50px] ">
                  <div>
                    {purchaseLoader ? (
                      <div className="w-full flex flex-row justify-center mt-4">
                        <CircularProgress size={32} />
                      </div>
                    ) : (
                      <div>
                        {selectedPurchasedNumber && (
                          <button
                            className="text-white bg-brand-primary w-full h-[50px] rounded-lg"
                            onClick={() => {
                              let userData = getUserLocalData()
                              if (userData) {
                                if (userData.user?.cards?.length === 0) {
                                  setShowAddCard(true)
                                } else handlePurchaseNumber()
                              }
                            }}
                          >
                            Proceed to Buy
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Box>
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
