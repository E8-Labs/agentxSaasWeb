import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Snackbar,
  Switch,
  TextField,
} from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import SmartRefillCard from '@/components/agency/agencyExtras.js/SmartRefillCard'
import { formatDecimalValue } from '@/components/agency/agencyServices/CheckAgencyData'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import TransactionDetailsModal from '@/components/modals/TransactionDetailsModal'
import {
  RemoveSmartRefillApi,
  SmartRefillApi,
} from '@/components/onboarding/extras/SmartRefillapi'
import { GetFormattedDateString } from '@/utilities/utility'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../../leads/AgentSelectSnackMessage'

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(stripePublickKey)

function SubAccountBilling({ hideBtns, selectedUser }) {
  console.log('Selected user passed is', selectedUser)
  //stroes user cards list
  const [cards, setCards] = useState([])

  //userlocal data
  const [userLocalData, setUserLocalData] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [cancelPlanLoader, setCancelPlanLoader] = useState(false)
  const [redeemLoader, setRedeemLoader] = useState(false)

  //stoores payment history
  const [PaymentHistoryData, setPaymentHistoryData] = useState([])
  const [historyLoader, setHistoryLoader] = useState(false)

  const [selectedCard, setSelectedCard] = useState(cards[0])
  const [getCardLoader, setGetCardLoader] = useState(false)
  const [makeDefaultCardLoader, setMakeDefaultCardLoader] = useState(false)

  //add card variables
  const [addPaymentPopUp, setAddPaymentPopup] = useState(false)
  const [cardData, getcardData] = useState('')

  //variables for selecting plans
  const [togglePlan, setTogglePlan] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false)

  //snack messages variables
  const [successSnack, setSuccessSnack] = useState(null)
  const [errorSnack, setErrorSnack] = useState(null)

  //variables for cancel plan
  const [giftPopup, setGiftPopup] = useState(false)
  const [ScreenWidth, setScreenWidth] = useState(null)
  const [showConfirmCancelPlanPopup, setShowConfirmCancelPlanPopup] =
    useState(false)
  const [showConfirmCancelPlanPopup2, setShowConfirmCancelPlanPopup2] =
    useState(false)

  const [plans, setPlans] = useState([])
  const [initialLoader, setInitialLoader] = useState(false)

  //transaction details modal variables
  const [transactionDetailsModal, setTransactionDetailsModal] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState(null)
  const [transactionDetailsLoader, setTransactionDetailsLoader] =
    useState(false)
  const [clickedTransactionId, setClickedTransactionId] = useState(null)

  useEffect(() => {
    let screenWidth = 1000
    if (typeof window !== 'undefined') {
      screenWidth = window.innerWidth
    }
    // //console.log;
    setScreenWidth(screenWidth)
  }, [])

  //cancel plan reasons
  const cancelPlanReasons = [
    {
      id: 1,
      reason: 'It’s too expensive',
    },
    {
      id: 2,
      reason: 'I’m using something else',
    },
    {
      id: 3,
      reason: 'I’m not getting the results I expected',
    },
    {
      id: 4,
      reason: 'It’s too complicated to use',
    },
    {
      id: 5,
      reason: 'Others',
    },
  ]

  useEffect(() => {
    getProfile()
    getPlans()
    getPaymentHistory()
    getCardsList()
  }, [])

  //get plans apis
  const getPlans = async () => {
    try {
      setInitialLoader(true)
      const Token = AuthToken()
      console.log('user id is', selectedUser?.id)
      let ApiPath = null
      if (selectedUser) {
        ApiPath = `${Apis.getSubAccountPlans}?userId=${selectedUser?.id}`
      } else {
        ApiPath = Apis.getSubAccountPlans
      }
      console.log('Api path of get plan is', ApiPath)
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('Response of get plans api is', response.data.data)
        setPlans(response.data.data.monthlyPlans)
        setInitialLoader(false)
      }
    } catch (error) {
      setInitialLoader(false)
      console.error('Error occured in getting subaccount plans', error)
    }
  }

  const getProfile = async () => {
    try {
      const localData = localStorage.getItem('User')
      // let response = await getProfileDetails();
      //console.log;

      const Token = AuthToken()
      let ApiPath = null
      if (selectedUser) {
        ApiPath = `${Apis.getProfileFromId}?id=${selectedUser.id}`
      } else {
        ApiPath = Apis.getProfileData
      }

      console.log('Api path for get profile is', ApiPath)

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('Response of get profile api is', response)
        let plan = response?.data?.data?.plan
        console.log('response?.data?.data?.plan', response?.data?.data?.plan)

        let togglePlan = plan?.planId

        setUserLocalData(response?.data?.data)
        // //console.log;
        setTogglePlan(togglePlan)
        setCurrentPlan(togglePlan)
      }
    } catch (error) {
      // console.error("Error in getprofile api is", error);
    }
  }

  //function to close the add card popup
  const handleClose = (data) => {
    // //console.log;
    if (data) {
      setAddPaymentPopup(false)
      getCardsList()
    }
  }

  //functiion to get cards list
  const getCardsList = async () => {
    try {
      setGetCardLoader(true)

      const localData = localStorage.getItem('User')

      let AuthToken = null

      if (localData) {
        const Data = JSON.parse(localData)
        AuthToken = Data.token
      }

      // //console.log;

      //Talabat road
      let ApiPath = null
      if (selectedUser) {
        ApiPath = `${Apis.getCardsList}?userId=${selectedUser.id}`
      } else {
        ApiPath = Apis.getCardsList
      }

      console.log('Api path of get cards api is', ApiPath)

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setCards(response.data.data)
        }
      }
    } catch (error) {
      // //console.log;
    } finally {
      // //console.log;
      setGetCardLoader(false)
    }
  }

  //function to make default cards api
  const makeDefaultCard = async (item) => {
    setSelectedCard(item)
    // //console.log
    // return
    try {
      setMakeDefaultCardLoader(true)

      const localData = localStorage.getItem('User')

      let AuthToken = null

      if (localData) {
        const Data = JSON.parse(localData)
        AuthToken = Data.token
      }
      // //console.log

      const ApiPath = Apis.makeDefaultCard

      const ApiData = {
        paymentMethodId: item.id,
      }

      // //console.log

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          let crds = cards.forEach((card, index) => {
            if (card.isDefault) {
              //console.log;
              cards[index].isDefault = false
            }
          })
          item.isDefault = true
        }
      }
    } catch (error) {
      // console.error("Error occured in make default card api is", error);
    } finally {
      setMakeDefaultCardLoader(false)
    }
  }

  //functions for selecting plans
  const handleTogglePlanClick = (item) => {
    console.log('Selected id', item.id)
    // if (togglePlan) {
    //     setTogglePlan(prevId => (prevId === item.id ? null : item.id));
    //     setSelectedPlan(prevId => (prevId === item ? null : item));
    // } else {
    //     setSelectedPlan(prevId => (prevId === item ? null : item));
    //     setAddPaymentPopUp(true);
    // }
    // setTogglePlan(prevId => (prevId === item.id ? null : item.id));
    setTogglePlan(item.id)
    setSelectedPlan((prevId) => (prevId === item ? null : item))
    // setTogglePlan(prevId => (prevId === id ? null : id));
  }

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {
      console.log('ssubscribe')

      setSubscribePlanLoader(true)
      let AuthToken = null
      let localDetails = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        localDetails = LocalDetails
        AuthToken = LocalDetails.token
        if (localDetails?.user?.cards?.length > 0) {
          // //console.log;
        } else {
          setErrorSnack('No payment method added')
          return
        }
      }

      // //console.log;

      const ApiPath = Apis.subAgencyAndSubAccountPlans
      const formData = new FormData()
      formData.append('planId', togglePlan)
      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`)
      }
      // //console.log;
      // //console.log;

      // return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          localDetails.user.plan = response.data.data
          console.log('response.data.data', response.data)
          // let user = userLocalData
          // user.plan = response.data.data
          // setUserLocalData(user)
          let response2 = await getProfileDetails()
          if (response2) {
            let togglePlan = response2?.data?.data?.plan?.planId
            // let planType = null;
            // if (togglePlan === "Plan30") {
            //   planType = 1;
            // } else if (togglePlan === "Plan120") {
            //   planType = 2;
            // } else if (togglePlan === "Plan360") {
            //   planType = 3;
            // } else if (togglePlan === "Plan720") {
            //   planType = 4;
            // }
            setTogglePlan(togglePlan)
            setCurrentPlan(togglePlan)
          }
          // localStorage.setItem("User", JSON.stringify(localDetails));
          setSuccessSnack('Your plan successfully updated')
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error('Error occured in api is:', error)
    } finally {
      setSubscribePlanLoader(false)
    }
  }

  //function to get payment history
  const getPaymentHistory = async () => {
    try {
      console.log('Payment history trigered for subaccount')
      setHistoryLoader(true)

      let AuthToken = null
      let localDetails = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        localDetails = LocalDetails
        AuthToken = LocalDetails.token
      }

      const ApiPath = `${Apis.getPaymentHistory}?userId=${selectedUser.id}`
      console.log('Api path for payment history of subaccount is', ApiPath)

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setPaymentHistoryData(response.data.data)
        }
      }
    } catch (error) {
      // console.error("Error occured in get history api is", error);
    } finally {
      setHistoryLoader(false)
    }
  }

  //function to cancel current plan
  const handleCancelPlan = async () => {
    try {
      setCancelPlanLoader(true)

      let AuthToken = null

      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      const ApiPath = `${Apis.cancelPlan}?userId=${selectedUser.id}`

      // //console.log;

      //// //console.log;
      // //console.log;

      const ApiData = {
        // patanai: "Sari dunya",
      }

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //console.log;
        if (response.data.status === true) {
          // //console.log;
          // window.location.reload();
          await getProfileDetails()
          setShowConfirmCancelPlanPopup(false)
          setGiftPopup(false)
          setTogglePlan(null)
          setCurrentPlan(null)
          setShowConfirmCancelPlanPopup2(true)
          let user = userLocalData
          user.plan.status = 'cancelled'
          setUserLocalData(user)
          //console.log
          setSuccessSnack('Your plan was successfully cancelled')
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error('Eror occured in cancel plan api is', error)
    } finally {
      setCancelPlanLoader(false)
    }
  }

  //function to call redeem api
  const handleRedeemPlan = async () => {
    //console.log;
    try {
      setRedeemLoader(true)

      let AuthToken = null

      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      const ApiPath = Apis.redeemPlan

      const ApiData = {
        sub_Type: '0', //send 1 for already redeemed plan
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        let response2 = await getProfileDetails()
        console.log(
          'response2?.data?.data?.plan?.id',
          response2?.data?.data?.plan?.id,
        )
        if (response2) {
          let togglePlan = response2?.data?.data?.plan?.planId
          // let planType = null;
          // if (togglePlan === "Plan30") {
          //   planType = 1;
          // } else if (togglePlan === "Plan120") {
          //   planType = 2;
          // } else if (togglePlan === "Plan360") {
          //   planType = 3;
          // } else if (togglePlan === "Plan720") {
          //   planType = 4;
          // }
          setUserLocalData(response2?.data?.data)
          setGiftPopup(false)
          setTogglePlan(togglePlan)
          setCurrentPlan(togglePlan)
          if (response2.data.status === true) {
            setSuccessSnack("You've claimed an extra 30 AI Credits")
          } else if (response2.data.status === false) {
            setErrorSnack(response2.data.message)
          }
        }
      }
    } catch (error) {
      // console.error("Error occurd in api is", error);
    } finally {
      setRedeemLoader(false)
    }
  }

  //function to get card brand image
  const getCardImage = (item) => {
    if (item.brand === 'visa') {
      return '/svgIcons/Visa.svg'
    } else if (item.brand === 'Mastercard') {
      return '/svgIcons/mastercard.svg'
    } else if (item.brand === 'amex') {
      return '/svgIcons/Amex.svg'
    } else if (item.brand === 'discover') {
      return '/svgIcons/Discover.svg'
    } else if (item.brand === 'dinersClub') {
      return '/svgIcons/DinersClub.svg'
    }
  }

  //variables
  const textFieldRef = useRef(null)
  const [selectReason, setSelectReason] = useState('')
  const [showOtherReasonInput, setShowOtherReasonInput] = useState(false)
  const [otherReasonInput, setOtherReasonInput] = useState('')

  //delreason extra variables
  const [cancelReasonLoader, setCancelReasonLoader] = useState(false)
  //function to select the cancel plan reason
  const handleSelectReason = async (item) => {
    // //console.log;
    setSelectReason(item.reason)
    if (item.reason === 'Others') {
      setShowOtherReasonInput(true)
      const timer = setTimeout(() => {
        textFieldRef.current.focus()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowOtherReasonInput(false)
      setOtherReasonInput('')
    }
  }

  //function to get transaction details
  const getTransactionDetails = async (transactionId) => {
    try {
      setTransactionDetailsLoader(true)
      const Token = AuthToken()

      const ApiPath = `${Apis.getTransactionDetails}?transactionId=${transactionId}`
      console.log('Api path for transaction details is', ApiPath)

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('Transaction details response:', response.data)
        if (response.data.status === true) {
          setTransactionDetails(response.data.data)
          setTransactionDetailsModal(true)
        } else {
          setErrorSnack(
            response.data.message || 'Failed to fetch transaction details',
          )
        }
      }
    } catch (error) {
      console.error('Error occurred in get transaction details api:', error)
      setErrorSnack('Failed to fetch transaction details')
    } finally {
      setTransactionDetailsLoader(false)
      setClickedTransactionId(null)
    }
  }

  //function to handle transaction click
  const handleTransactionClick = (item) => {
    if (item.transactionId) {
      setClickedTransactionId(item.transactionId)
      getTransactionDetails(item.transactionId)
    } else {
      setErrorSnack('Transaction ID not available')
    }
  }

  //del reason api
  const handleDelReason = async () => {
    if (!otherReasonInput || selectReason)
      try {
        setCancelReasonLoader(true)
        const localdata = localStorage.getItem('User')
        let AuthToken = null
        if (localdata) {
          const D = JSON.parse(localdata)
          AuthToken = D.token
        }

        const ApiData = {
          reason: otherReasonInput || selectReason,
        }

        // //console.log;

        const ApiPath = Apis.calcelPlanReason
        // //console.log;

        const response = await axios.post(ApiPath, ApiData, {
          headers: {
            Authorization: 'Bearer ' + AuthToken,
            'Content-Type': 'application/json',
          },
        })

        if (response) {
          //console.log;
          if (response.data.status === true) {
            setShowConfirmCancelPlanPopup2(false)
            setSuccessSnack(response.data.message)
          } else if (response.data.status === true) {
            setErrorSnack(response.data.message)
          }
        }
      } catch (error) {
        setErrorSnack(error)
        setCancelReasonLoader(false)
        console.error('Error occured in api is ', error)
      } finally {
        setCancelReasonLoader(false)
        // //console.log;
      }
  }

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto"
      style={{
        paddingBottom: '50px',
        scrollbarWidth: 'none', // For Firefox
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <AgentSelectSnackMessage
        isVisible={errorSnack == null ? false : true}
        hide={() => {
          setErrorSnack(null)
        }}
        message={errorSnack}
        type={SnackbarTypes.Error}
      />
      <AgentSelectSnackMessage
        isVisible={successSnack == null ? false : true}
        hide={() => {
          setSuccessSnack(null)
        }}
        message={successSnack}
        type={SnackbarTypes.Success}
      />
      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
            Billing
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#00000090',
            }}
          >
            {'Account > Billing'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: '700', marginTop: 40 }}>
        My Billing History
      </div>

      <div className="w-full flex flex-row justify-between mt-10 px-10">
        <div className="w-5/12">
          <div style={styles.text}>Name</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Amount</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Status</div>
        </div>
        <div className="w-3/12">
          <div style={styles.text}>Date</div>
        </div>
      </div>

      <div className="w-full">
        {historyLoader ? (
          <div className="w-full flex flex-row items-center justify-center mt-8 pb-12">
            <CircularProgress size={35} thickness={2} />
          </div>
        ) : (
          <div className="w-full">
            {PaymentHistoryData.map((item) => (
              <div
                key={item.id}
                className={`w-full flex flex-row items-center justify-between mt-10 px-10 rounded-lg py-2 transition-colors ${
                  transactionDetailsLoader
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-gray-50'
                }`}
                onClick={() =>
                  !transactionDetailsLoader && handleTransactionClick(item)
                }
              >
                <div className="w-5/12 flex flex-row gap-2">
                  <div className="truncate" style={styles.text2}>
                    {item.title}
                  </div>
                </div>
                <div className="w-2/12">
                  <div style={styles.text2}>
                    ${formatFractional2(item.price)}
                  </div>
                </div>
                <div className="w-2/12 items-start">
                  {clickedTransactionId === item.transactionId &&
                  transactionDetailsLoader ? (
                    <div className="flex items-center justify-center">
                      <CircularProgress size={20} thickness={2} />
                    </div>
                  ) : (
                    <div
                      className="p-2 flex flex-row gap-2 items-center"
                      style={{
                        backgroundColor: '#01CB7610',
                        borderRadius: 20,
                        width: '5vw',
                      }}
                    >
                      <div
                        style={{
                          height: 8,
                          width: 8,
                          borderRadius: 5,
                          background: '#01CB76',
                        }}
                      ></div>
                      <div
                        style={{
                          fontSize: 15,
                          color: '#01CB76',
                          fontWeight: 500,
                        }}
                      >
                        Paid
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-3/12">
                  <div style={styles.text2}>
                    {GetFormattedDateString(item?.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      <Modal
        open={addPaymentPopUp} //addPaymentPopUp
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
                <button onClick={() => setAddPaymentPopup(false)}>
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
                  stop={stop}
                  getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleClose}
                  togglePlan={''}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal for Gift popup */}
      <Modal
        open={giftPopup}
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
          <div className="flex flex-row justify-center w-full h-[100%]">
            <div
              className="sm:w-7/12 w-full h-[70%]"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
                paddingBottom: '20px',
              }}
            >
              <div className="flex flex-row justify-end">
                <button
                  className="outline-none"
                  onClick={() => setGiftPopup(false)}
                >
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>

              <div
                className="text-center text-brand-primary"
                style={{
                  fontWeight: '600',
                  fontSize: 16.8,
                }}
              >
                {`Here's a Gift`}
              </div>

              <div className="flex flex-row items-center justify-center w-full mt-6">
                <div
                  className="text-center  w-full"
                  style={{
                    fontWeight: '600',
                    fontSize:
                      ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 24,
                    width: ScreenWidth > 1200 ? '70%' : '100%',
                    alignSelf: 'center',
                  }}
                >
                  {`Don’t Hang Up Yet! Get 30 AI Credits of Free Talk Time and Stay Connected!`}
                </div>
              </div>

              <div className="flex flex-col items-center px-4 w-full">
                <div
                  className={`flex flex-row items-center gap-2 text-brand-primary ${
                    ScreenWidth < 1200 ? 'mt-4' : 'mt-6'
                  }bg-brand-primary/10 py-2 px-4 rounded-full`}
                  style={styles.gitTextStyle}
                >
                  <Image
                    src={'/svgIcons/gift.svg'}
                    height={
                      ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 22
                    }
                    width={
                      ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 22
                    }
                    alt="*"
                  />
                  Enjoy your next calls on us
                </div>
                <div className="w-full flex flex-row justify-center items-center mt-8">
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={'/svgIcons/giftIcon.svg'}
                      height={81}
                      width={81}
                      alt="*"
                      className="-mb-28 ms-4"
                      style={{
                        zIndex: 9999,
                        position: 'relative',
                      }}
                    />
                    <div
                      className="text-brand-primary"
                      style={{
                        fontSize: 200,
                        fontWeight: '400',
                        zIndex: 0,
                        position: 'relative',
                      }}
                    >
                      30
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: '700',
                    }}
                  >
                    AI Credits
                  </div>
                </div>
                {redeemLoader ? (
                  <div className="h-[50px] w-full flex flex-row items-center justify-center">
                    <CircularProgress size={30} />
                  </div>
                ) : (
                  <button
                    className="rounded-lg text-white bg-brand-primary outline-none"
                    style={{
                      fontWeight: '700',
                      fontSize: '16',
                      height: '50px',
                      width: '340px',
                    }}
                    onClick={handleRedeemPlan}
                  >
                    Claim my 30 AI Credits
                  </button>
                )}
                <button
                  className="outline-none mt-6"
                  style={{
                    fontWeight: '600',
                    fontSize: 16.8,
                  }}
                  onClick={() => {
                    setShowConfirmCancelPlanPopup(true)
                  }}
                >
                  {`No thank you, I’d like to cancel my Agentx`}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal for cancel plan confirmation */}
      <Modal
        open={showConfirmCancelPlanPopup} //addPaymentPopUp
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000030',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="md:8/12 lg:w-6/12 sm:w-11/12 w-full"
          sx={styles.paymentModal}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
                height: '394px',
              }}
            >
              <div className="flex flex-row justify-end">
                <button onClick={() => setShowConfirmCancelPlanPopup(false)}>
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <div
                className="text-center mt-8"
                style={{
                  fontWeight: '600',
                  fontSize: 22,
                }}
              >
                Are you sure ?
              </div>

              <div className="flex flex-row items-center justify-center w-full mt-6">
                <div
                  className="text-center"
                  style={{
                    fontWeight: '500',
                    fontSize: 15,
                    width: '70%',
                    alignSelf: 'center',
                  }}
                >
                  Canceling your account means you lose access to your agents,
                  leads, pipeline, staff and more.
                </div>
              </div>

              <button
                className="w-full flex flex-row items-center h-[50px] rounded-lg bg-brand-primary text-white justify-center mt-10"
                style={{
                  fontWeight: '600',
                  fontSize: 16.8,
                  outline: 'none',
                }}
              >
                Never mind, keep my account
              </button>

              {cancelPlanLoader ? (
                <div className="w-full flex flex-row items-center justify-center mt-8">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <button
                  className="w-full flex flex-row items-center rounded-lg justify-center mt-8"
                  style={{
                    fontWeight: '600',
                    fontSize: 16.8,
                    outline: 'none',
                  }}
                  onClick={handleCancelPlan}
                  // onClick={() => { setShowConfirmCancelPlanPopup2(true) }}
                >
                  Yes. Cancel
                </button>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* del pln last step */}
      <Modal
        open={showConfirmCancelPlanPopup2} //showConfirmCancelPlanPopup2
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000030',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="md:9/12 lg:w-7/12 sm:w-10/12 w-full"
          sx={styles.paymentModal}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
                // height: "394px"
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div
                  style={{
                    fontSize: 16.8,
                    fontWeight: '500',
                    paddingLeft: '12px',
                  }}
                >
                  Cancel Plan
                </div>
                <button onClick={() => setShowConfirmCancelPlanPopup2(false)}>
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>

              <div className="flex flex-row items-center justify-center">
                <Image
                  src={'/svgIcons/warning2.svg'}
                  height={49}
                  width={49}
                  alt="*"
                />
              </div>

              <div
                style={{
                  fontWeight: '600',
                  fontSize: 22,
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                AssignX Successfully Canceled
              </div>

              <div
                style={{
                  fontWeight: '500',
                  fontSize: 16,
                  textAlign: 'center',
                  marginTop: 30,
                }}
              >
                {`Tell us why you're cancelling so we can improve`}
              </div>

              <div className="w-full flex flex-row items-center justify-center">
                <div className="mt-9 w-10/12">
                  {cancelPlanReasons.map((item, index) => (
                    <button
                      onClick={() => {
                        handleSelectReason(item)
                      }}
                      key={index}
                      style={{
                        fontWeight: '500',
                        fontSize: 15,
                        textAlign: 'start',
                        marginTop: 6,
                      }}
                      className="flex flex-row items-center gap-2"
                    >
                      <div
                        className="rounded-full flex flex-row items-center justify-center"
                        style={{
                          border:
                            item.reason === selectReason
                              ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                              : '2px solid #15151510',
                          // backgroundColor: item.reason === selectReason ? "hsl(var(--brand-primary))" : "",
                          // margin: item.reason === selectReason && "5px",
                          height: '20px',
                          width: '20px',
                        }}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            backgroundColor:
                              item.reason === selectReason && 'hsl(var(--brand-primary, 270 75% 50%))',
                            height: '12px',
                            width: '12px',
                          }}
                        />
                      </div>
                      <div>{item.reason}</div>
                    </button>
                  ))}
                  {showOtherReasonInput && (
                    <div className="w-full mt-4">
                      <TextField
                        inputRef={textFieldRef}
                        placeholder="Type here"
                        className="focus:ring-0 outline-none"
                        variant="outlined"
                        fullWidth
                        multiline
                        minRows={4}
                        maxRows={5}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: '1px solid #00000010', // Normal border
                            },
                            '&:hover fieldset': {
                              border: '1px solid #00000010', // Hover border
                            },
                            '&.Mui-focused fieldset': {
                              border: 'none', // Remove border on focus
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none', // Additional safety to remove outline
                          },
                          '& .Mui-focused': {
                            outline: 'none', // Remove focus outline
                          },
                        }}
                        value={otherReasonInput}
                        onChange={(e) => {
                          setOtherReasonInput(e.target.value)
                        }}
                      />
                    </div>
                  )}
                  {cancelReasonLoader ? (
                    <div className="flex flex-row items-center justify-center mt-10">
                      <CircularProgress size={35} />
                    </div>
                  ) : (
                    <button
                      className="w-full flex flex-row items-center h-[50px] rounded-lg text-white justify-center mt-10"
                      style={{
                        fontWeight: '600',
                        fontSize: 16.8,
                        outline: 'none',
                        backgroundColor:
                          selectReason &&
                          (selectReason !== 'Others' || otherReasonInput)
                            ? 'hsl(var(--brand-primary, 270 75% 50%))'
                            : '#00000050',
                        color:
                          selectReason &&
                          (selectReason !== 'Others' || otherReasonInput)
                            ? '#ffffff'
                            : '#000000',
                      }}
                      onClick={() => {
                        handleDelReason()
                      }}
                      disabled={
                        !selectReason &&
                        (selectReason !== 'Others' || otherReasonInput)
                      }
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        open={transactionDetailsModal}
        onClose={() => setTransactionDetailsModal(false)}
        transactionDetails={transactionDetails}
        isLoading={transactionDetailsLoader}
      />
    </div>
  )
}

export default SubAccountBilling
const styles = {
  text: {
    fontSize: 12,
    color: '#00000090',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: 500,
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
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
  headingStyle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gitTextStyle: {
    fontSize: 15,
    fontWeight: '700',
  },

  //style for plans
  cardStyles: {
    fontSize: '14',
    fontWeight: '500',
    border: '1px solid #00000020',
  },
  pricingBox: {
    position: 'relative',
    // padding: '10px',
    // borderRadius: "10px",
    // backgroundColor: '#f9f9ff',
    display: 'inline-block',
    width: '100%',
  },
  triangleLabel: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    borderTop: '50px solid hsl(var(--brand-primary, 270 75% 50%))', // Increased height again for more padding
    borderLeft: '50px solid transparent',
  },
  labelText: {
    position: 'absolute',
    top: '10px', // Adjusted to keep the text centered within the larger triangle
    right: '5px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    transform: 'rotate(45deg)',
  },
  content: {
    textAlign: 'left',
    paddingTop: '10px',
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: 'hsl(var(--brand-primary, 270 75% 50%) / 0.4)',
    fontSize: 18,
    fontWeight: '600',
  },
  discountedPrice: {
    color: 'hsl(var(--brand-primary, 270 75% 50%) / 0.4)',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: '10px',
  },
}
