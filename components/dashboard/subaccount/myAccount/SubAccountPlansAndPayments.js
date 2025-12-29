import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import SmartRefillCard from '@/components/agency/agencyExtras.js/SmartRefillCard'
import { formatDecimalValue } from '@/components/agency/agencyServices/CheckAgencyData'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import ViewSubAccountPlans from '@/components/agency/subaccount/ViewSubAccountPlans'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import CancelConfirmation from '@/components/myAccount/cancelationFlow/CancelConfirmation'
import CancelPlanAnimation from '@/components/myAccount/cancelationFlow/CancelPlanAdnimation'
import DowngradePlanPopup from '@/components/myAccount/cancelationFlow/DowngradePlanPopup'
import ProgressBar from '@/components/onboarding/ProgressBar'
import {
  RemoveSmartRefillApi,
  SmartRefillApi,
} from '@/components/onboarding/extras/SmartRefillapi'
import AgencyPlans from '@/components/plan/AgencyPlans'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import UpgradePlanForUserFromAdminAgency from '@/components/userPlans/UpgradePlanForUserFromAdminAgency'
import UserPlans from '@/components/userPlans/UserPlans'
import { useUser } from '@/hooks/redux-hooks'
import { GetFormattedDateString } from '@/utilities/utility'
import AppLogo from '@/components/common/AppLogo'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../../leads/AgentSelectSnackMessage'

const stripePromise = getStripe()

function SubAccountPlansAndPayments({ hideBtns, selectedUser }) {
  console.log('Selected user passed is', selectedUser)
  //stroes user cards list
  const [cards, setCards] = useState([])

  //stores redux user data
  const { user: reduxUser, setUser: setReduxUser } = useUser()

  //userlocal data
  const [userLocalData, setUserLocalData] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [currentPlanSequenceId, setCurrentPlanSequenceId] = useState(null)
  const [currentPlanDetails, setCurrentPlanDetails] = useState(null)
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
  const [showSnack, setShowSnack] = useState({
    message: null,
    type: null,
  })

  //variables for cancel plan
  const [giftPopup, setGiftPopup] = useState(false)
  const [ScreenWidth, setScreenWidth] = useState(null)
  const [showConfirmCancelPlanPopup, setShowConfirmCancelPlanPopup] =
    useState(false)
  const [showConfirmCancelPlanPopup2, setShowConfirmCancelPlanPopup2] =
    useState(false)
  const [showDowngradePlanPopup, setShowDowngradePlanPopup] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [showCancelPopup, setShowCancelPopup] = useState(false)
  const [cancelInitiateLoader, setCancelInitiateLoader] = useState(false)

  const [plans, setPlans] = useState([])
  const [initialLoader, setInitialLoader] = useState(false)

  //variables
  const textFieldRef = useRef(null)
  const [selectReason, setSelectReason] = useState('')
  const [showOtherReasonInput, setShowOtherReasonInput] = useState(false)
  const [otherReasonInput, setOtherReasonInput] = useState('')

  //separate plans list variables
  const [monthlyPlans, setMonthlyPlans] = useState([])
  const [quaterlyPlans, setQuaterlyPlans] = useState([])
  const [yearlyPlans, setYearlyPlans] = useState([])
  const [duration, setDuration] = useState([
    {
      id: 1,
      title: 'Monthly',
    },
    {
      id: 2,
      title: 'Quarterly',
    },
    {
      id: 3,
      title: 'Yearly',
    },
  ])
  const [selectedDuration, setSelectedDuration] = useState([])

  //delreason extra variables
  const [cancelReasonLoader, setCancelReasonLoader] = useState(false)

  //variables for upgrade plan popup
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  //plans details
  const [showPlanDetailsPopup, setShowPlanDetailsPopup] = useState(false)

  const [confirmChecked, setConfirmChecked] = useState(false)

  useEffect(() => {
    console.log(
      'current full plan in subaccount plans and payments',
      currentPlanDetails,
    )
  }, [currentPlanDetails])

  useEffect(() => {
    let screenWidth = 1000
    if (typeof window !== 'undefined') {
      screenWidth = window.innerWidth
    }
    // //console.log;
    setScreenWidth(screenWidth)
  }, [])

  //check current plan and set the selected duration data
  // useEffect(() => {
  //     console.log("Selected plan is", selectedPlan)
  //     if (currentPlan) {
  //         if (selectedPlan?.id === "monthly") {
  //             setSelectedDuration(duration[0])
  //         }
  //         else if (selectedPlan?.id === "quarterly") {
  //             setSelectedDuration(duration[1])
  //         }
  //         else if (selectedPlan?.id === "yearly") {
  //             setSelectedDuration(duration[2])
  //         }
  //     }
  // }, [currentPlan, plans])

  useEffect(() => {
    // If there's a current plan, set the duration based on the plan
    if (currentPlan) {
      //current plan id is
      console.log('Current plan id is', selectedPlan)

      // Check inside monthly plans
      if (monthlyPlans.some((p) => p.id === currentPlan)) {
        console.log('Should select the 0 index')
        setSelectedDuration({ id: 1, title: 'Monthly' })
        getCurrentPlans({ id: 1, title: 'Monthly' })
      }
      // Check inside quarterly plans
      else if (quaterlyPlans.some((p) => p.id === currentPlan)) {
        console.log('Should select the 2 index')
        setSelectedDuration({ id: 2, title: 'Quarterly' })
        getCurrentPlans({ id: 2, title: 'Quarterly' })
      }
      // Check inside yearly plans
      else if (yearlyPlans.some((p) => p.id === currentPlan)) {
        console.log('Should select the 3 index')
        setSelectedDuration({ id: 3, title: 'Yearly' })
        getCurrentPlans({ id: 3, title: 'Yearly' })
      }

      sequenceIdDetecter()
    } else {
      // If no current plan, set Monthly as default if monthly plans are available
      if (monthlyPlans.length > 0 && (Array.isArray(selectedDuration) || !selectedDuration?.id || selectedDuration.id !== 1)) {
        console.log('No current plan, setting Monthly as default')
        setSelectedDuration({ id: 1, title: 'Monthly' })
      }
    }
  }, [currentPlan, plans, monthlyPlans, quaterlyPlans, yearlyPlans])

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
    getPlans()
    getProfile()
    getPaymentHistory()
    getCardsList()
  }, [])

  //some code for squence id detecter
  const sequenceIdDetecter = () => {
    console.log('Sequence id detecter triggered')
    // console.log("Detecter Current plan is", currentPlan)
    // console.log("Detecter monthly plans are", monthlyPlans)
    // Search inside monthly plans
    const monthlyMatch = monthlyPlans.find((p) => p.id === currentPlan)
    if (monthlyMatch) {
      // console.log("Matching monthly plan is", monthlyMatch)
      setCurrentPlanDetails(monthlyMatch)
      setCurrentPlanSequenceId(monthlyMatch.sequenceId) // or monthlyMatch.planId if that's your field
      return
    }

    // Search inside quarterly plans
    const quarterlyMatch = quaterlyPlans.find((p) => p.id === currentPlan)
    if (quarterlyMatch) {
      // console.log("Matching quarterlyMatch plan is", quarterlyMatch)
      setCurrentPlanDetails(quarterlyMatch)
      setCurrentPlanSequenceId(quarterlyMatch.sequenceId)
      return
    }

    // Search inside yearly plans
    const yearlyMatch = yearlyPlans.find((p) => p.id === currentPlan)
    if (yearlyMatch) {
      console.log('Matching yearlyMatch plan is', yearlyMatch)
      setCurrentPlanDetails(yearlyMatch)
      setCurrentPlanSequenceId(yearlyMatch.sequenceId)
      return
    }
  }

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

        //separate plans
        const apiPlansListMonthly = response.data.data.monthlyPlans

        const monthly = []
        const quarterly = []
        const yearly = []
        const availableDurations = [] // summary array

        apiPlansListMonthly.forEach((plan) => {
          switch (plan.duration) {
            case 'monthly':
              monthly.push(plan)
              break
            case 'quarterly':
              quarterly.push(plan)
              break
            case 'yearly':
              yearly.push(plan)
              break
            default:
              break
          }
        })

        //add plan id's
        let planCounter = 1

        ;[monthly, quarterly, yearly].forEach((group) => {
          group.forEach((plan) => {
            plan.sequenceId = planCounter++ //create new subacc and then test
          })
        })

        const emptyDurations = [monthly, quarterly, yearly].filter(
          (arr) => arr.length === 0,
        ).length
        console.log('Empty durations are', emptyDurations)
        if (emptyDurations >= 2) {
          setDuration([])
        } else {
          if (monthly.length === 0) {
            console.log('Remove monthly')
            setDuration((prev) => prev.filter((item) => item.id !== 1))
          }
          if (quarterly.length === 0) {
            console.log('Remove quarterly')
            setDuration((prev) => prev.filter((item) => item.id !== 2))
          }
          if (yearly.length === 0) {
            console.log('Remove yearly')
            setDuration((prev) => prev.filter((item) => item.id !== 3))
          }
        }

        console.log('Monthly Plans:', monthly)
        console.log('Quarterly Plans:', quarterly)
        console.log('Yearly Plans:', yearly)
        console.log('Available Durations:', availableDurations)
        setMonthlyPlans(monthly)
        setQuaterlyPlans(quarterly)
        setYearlyPlans(yearly)
        
        // Set Monthly as default if no current plan exists and monthly plans are available
        if (!currentPlan && monthly.length > 0 && (Array.isArray(selectedDuration) || !selectedDuration?.id)) {
          setSelectedDuration({ id: 1, title: 'Monthly' })
        }
        
        setInitialLoader(false)
        setInitialLoader(false)
      }
    } catch (error) {
      setInitialLoader(false)
      console.error('Error occured in getting subaccount plans', error)
    }
  }

  //get current plans
  const getCurrentPlans = (item) => {
    console.log('Item passed in bartender is', item)
    if (item?.title === 'Monthly') {
      console.log('Returning monthly plans are', monthlyPlans)
      return monthlyPlans
    }
    if (item?.title === 'Quarterly') {
      console.log('Returning quarterly plans are', quaterlyPlans)
      return quaterlyPlans
    }
    if (item?.title === 'Yearly') {
      console.log('Returning yearly plans are', yearlyPlans)
      return yearlyPlans
    }
    return []
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
        console.log(
          'response?.data?.data?.plan?.sequenceId',
          response?.data?.data?.plan?.sequenceId,
        ) //i am not getting any suequence id update in the useeffect where we add duration in select duration

        let togglePlan = plan?.planId

        setUserLocalData(response?.data?.data)
        // //console.log;
        setTogglePlan(togglePlan)
        setCurrentPlan(togglePlan)
        // setCurrentPlanDetails(response?.data?.data?.plan);
        setSelectedPlan(plan)
        // sequenceIdDetecter(plan)
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
    setSelectedPlan(item)
    planTitleTag()
    // setSelectedPlan((prevId) => (prevId === item ? null : item));
    // setTogglePlan(prevId => (prevId === id ? null : id));
  }

  //handle cancel plan click
  const handleCancelPlanClick = async () => {
    setCancelInitiateLoader(true)
    try {
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      // Use initiateCancellation from UserPlanServices, but we need to call API directly for subaccounts
      let ApiPath = Apis.initiateCancelation
      if (selectedUser) {
        ApiPath = `${ApiPath}?userId=${selectedUser.id}`
      }

      await axios.post(
        ApiPath,
        {},
        {
          headers: {
            Authorization: 'Bearer ' + AuthToken,
            'Content-Type': 'application/json',
          },
        },
      )

      setShowCancelPopup(true)
    } catch (error) {
      console.error('Error initiating cancellation:', error)
      setErrorSnack('Failed to initiate cancellation')
    } finally {
      setCancelInitiateLoader(false)
    }
  }

  const handleCloseCancelation = async () => {
    setShowCancelPopup(false)
    await getProfile()
    // Refresh payment history and cards after cancellation
    await getPaymentHistory()
    await getCardsList()
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

      let ApiPath = Apis.subAgencyAndSubAccountPlans
      const formData = new FormData()
      formData.append('planId', togglePlan)
      if (selectedUser) {
        formData.append('userId', selectedUser.id)
      }
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
            setSelectedPlan(response2?.data?.data?.plan)
            setCurrentPlan(togglePlan)
            // setCurrentPlanDetails(response2?.data?.data?.plan);
            setCurrentPlanSequenceId(response2?.data?.data?.plan?.sequenceId)
            planTitleTag()
            setShowDowngradePlanPopup(false)
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

      let ApiPath = Apis.cancelPlan

      if (selectedUser) {
        ApiPath = `${ApiPath}?userId=${selectedUser.id}`
      }
      // return
      const response = await axios.post(
        ApiPath,
        {},
        {
          headers: {
            Authorization: 'Bearer ' + AuthToken,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response) {
        //console.log;
        if (response.data.status === true) {
          console.log('Plan cancellation ', response.data)
          // window.location.reload();
          await getProfileDetails()
          setShowConfirmCancelPlanPopup(false)
          setGiftPopup(false)
          setTogglePlan(null)
          setCurrentPlan(null)
          // setCurrentPlanDetails(null);
          setSelectedPlan(null)
          setCurrentPlanSequenceId(null)
          setShowConfirmCancelPlanPopup2(true)
          let user = userLocalData
          user.plan.status = 'cancelled'
          setUserLocalData(user)
          await getProfile()
          //console.log
          setSuccessSnack('Account canceled')
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
          // setCurrentPlanDetails(response2?.data?.data?.plan);
          setCurrentPlanSequenceId(response2?.data?.data?.plan?.sequenceId)
          setSelectedPlan(response2?.data?.data?.plan)
          if (response2.data.status === true) {
            setSuccessSnack("You've claimed 30 AI Credits")
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
            setSuccessSnack('Reason submitted')
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

  //get the plan title for the button to upgrade and own grade also cancel plan subscription
  const planTitleTag = () => {
    console.log('Current plan id is', currentPlan)
    console.log('Toggle plan id is', selectedPlan)
    console.log('Current plan sequence id is', currentPlanSequenceId)

    // If no plan is selected, don't show button
    if (!selectedPlan || !togglePlan) {
      return ''
    }

    // If there's no current plan (new subscription), show Subscribe
    if (!currentPlan || !userLocalData?.plan) {
      // Don't show if the selected plan is already the current plan (shouldn't happen, but safety check)
      if (selectedPlan?.id === currentPlan) {
        return ''
      }
      return 'Subscribe'
    }

    // If plan is cancelled
    if (
      userLocalData?.plan?.status === 'cancelled' ||
      currentPlanDetails?.status === 'cancelled'
    ) {
      // If the selected plan is the same as current plan, hide the button
      if (selectedPlan?.id === currentPlan) {
        return ''
      }
      // If a plan is selected while current plan is cancelled, show Upgrade
      return 'Upgrade'
    }

    // If selected plan is the same as current plan, show Cancel Subscription
    if (selectedPlan?.id === currentPlan) {
      return 'Cancel Subscription'
    }

    // check if selected togglePlan is higher id than currentPlan → Upgrade
    if (selectedPlan?.sequenceId > currentPlanSequenceId) {
      console.log('Plan status is Upgrade')
      return 'Upgrade'
    }

    // check if selected togglePlan is lower id than currentPlan → Downgrade
    if (selectedPlan?.sequenceId < currentPlanSequenceId) {
      console.log('Plan status is Downgrade')
      return 'Downgrade'
    }

    // fallback
    return 'Cancel Subscription'
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
      <AgentSelectSnackMessage
        isVisible={showSnack.message != null}
        hide={() => {
          setShowSnack({ message: null, type: null })
        }}
        message={showSnack.message}
        type={showSnack.type}
      />
      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
            Plans & Payment
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#00000090',
            }}
          >
            {'Account > Plans & Payment'}
          </div>
        </div>

        {/*hideBtns &&
          (
          )*/}
        <button
          className=""
          onClick={() => {
            setAddPaymentPopup(true)
          }}
        >
          <div
            className="text-brand-primary hover:text-brand-primary/80 underline transition-colors"
            style={{
              fontSize: 15,
              fontWeight: '500',
            }}
          >
            Add New Card
          </div>
        </button>
      </div>

      <div className="w-full">
        {getCardLoader ? (
          <div
            className="h-full w-full flex flex-row items-center justify-center"
            style={{
              marginTop: 20,
            }}
          >
            <CircularProgress size={35} sx={{ color: 'hsl(var(--brand-primary))' }} />
          </div>
        ) : (
          <div className="w-full">
            {cards.length > 0 ? (
              <div
                className="w-full flex flex-row gap-4"
                style={{
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  display: 'flex',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                  height: '',
                  marginTop: 20,
                  // border:'2px solid red'
                  scrollbarWidth: 'none',
                  overflowY: 'hidden',
                  height: '', // Ensures the height is always fixed
                  flexShrink: 0,
                }}
              >
                {cards.map((item) => (
                  <div className="flex-shrink-0 w-5/12" key={item.id}>
                    <button
                      className="w-full outline-none"
                      onClick={() => makeDefaultCard(item)}
                    >
                      <div
                        className={`flex items-start justify-between w-full p-4 border rounded-lg `}
                        style={{
                          backgroundColor:
                            item.isDefault || selectedCard?.id === item.id
                              ? '#4011FA05'
                              : 'transparent',
                          borderColor:
                            item.isDefault || selectedCard?.id === item.id
                              ? 'hsl(var(--brand-primary, 270 75% 50%))'
                              : '#15151510',
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border border-brand-primary flex items-center justify-center`} //border-[#2548FD]
                            style={{
                              borderWidth:
                                item.isDefault || selectedCard?.id === item.id
                                  ? 3
                                  : 1,
                            }}
                          ></div>
                          {/* Card Details */}
                          <div className="flex flex-col items-start">
                            <div className="flex flex-row items-center gap-3">
                              <div
                                style={{
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: '#000',
                                }}
                              >
                                ****{item.last4}
                              </div>
                              {
                                // makeDefaultCardLoader ? (
                                //   <CircularProgress size={20} />
                                // ) :

                                item.isDefault && (
                                  <div
                                    className="flex px-2 py-1 rounded-full bg-brand-primary text-white text-[10]"
                                    style={{ fontSize: 11, fontWeight: '500' }}
                                  >
                                    Default
                                  </div>
                                )
                              }
                            </div>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#909090',
                              }}
                            >
                              {item.brand} Card
                            </div>
                          </div>
                        </div>

                        {/* Card Logo */}
                        <div>
                          <Image
                            src={getCardImage(item) || '/svgIcons/Visa.svg'}
                            alt="Card Logo"
                            width={50}
                            height={50}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-start mt-12"
                style={{ fontSize: 18, fontWeight: '600' }}
              >
                No payment method added
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code for Smart Refill */}

      <SmartRefillCard selectedUser={selectedUser} />

      {/* code for current plans available */}

      {// count how many have length > 0
      [
        monthlyPlans?.length > 0,
        quaterlyPlans?.length > 0,
        yearlyPlans?.length > 0,
      ].filter(Boolean).length >= 2 && (
        <div className="w-full flex flex-row justify-end mt-4">
          <div className="border bg-neutral-100 px-2 flex flex-row items-center gap-[8px] rounded-full py-1.5">
            {duration?.map((item) => (
              <button
                key={item.id}
                className={`px-4 py-1 ${selectedDuration?.id === item.id ? 'text-white bg-brand-primary shadow-md shadow-brand-primary rounded-full' : 'text-black'}`}
                onClick={() => {
                  setSelectedDuration(item)
                  getCurrentPlans(item)
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <RadioGroup
        value={togglePlan?.toString() || ''}
        onValueChange={(value) => {
          const plan = getCurrentPlans(selectedDuration)?.find(p => p.id?.toString() === value)
          if (plan) handleTogglePlanClick(plan)
        }}
        className="w-full flex flex-row gap-4"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          marginTop: 20,
          flexShrink: 0,
          alignItems: 'stretch', // This makes all cards the same height
        }}
      >
        {getCurrentPlans(selectedDuration)?.map((item, index) => (
          <div
            key={item.id}
            className="mt-4 outline-none flex-shrink-0 cursor-pointer"
            style={{ width: '300px' }} // Fixed width for consistent card sizes
            onClick={(e) => {
              if (!e.target.closest('.view-details-btn')) {
                handleTogglePlanClick(item)
              }
            }}
          >
            <div
              className="px-4 py-4 pb-4 flex flex-col gap-3 h-full rounded-xl"
              style={{
                ...styles.pricingBox,
                border:
                  item.id === togglePlan
                    ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                    : '1px solid #15151520',
                backgroundColor: item.id === togglePlan ? 'hsl(var(--brand-primary) / 0.05)' : '',
                minHeight: '320px', // Further increased height for better feature accommodation
              }}
            >
              <div className="flex flex-col items-start h-full justify-between">
                <div className="w-full">
                  <div className="flex flex-row items-center w-full justify-between mb-3">
                    <RadioGroupItem
                      value={item.id?.toString() || ''}
                      className="h-6 w-6 border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    />

                    {/*
                                            isPaused && item.id === currentPlan ? (
                                                <div
                                                    className="flex px-2 py-1 bg-[#EAB308] rounded-full text-white"
                                                    style={{
                                                        fontSize: 11.6,
                                                        fontWeight: "500",
                                                        width: "fit-content",
                                                    }}
                                                >
                                                    Paused
                                                </div>
                                            ) : (
                                                
                                            )
                                        */}
                    <div>
                      {item.id === currentPlan &&
                        (userLocalData?.plan?.status === 'cancelled' ? (
                          <div
                            className="flex px-2 py-1 bg-red-500 rounded-full text-white"
                            style={{
                              fontSize: 11.6,
                              fontWeight: '500',
                              width: 'fit-content',
                            }}
                          >
                            Cancelled
                          </div>
                        ) : userLocalData?.nextChargeDate ? (
                          <div
                            style={{
                              fontSize: 11.6,
                              fontWeight: '500',
                              width: 'fit-content',
                            }}
                          >
                            Renews on:{' '}
                            {moment(userLocalData.nextChargeDate).format(
                              'MM/DD/YYYY',
                            )}
                          </div>
                        ) : null)}
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between w-full mb-4">
                    <div className="text-[16px] font-semibold">
                      {item.title.length > 13
                        ? item.title.slice(0, 13) + '...'
                        : item.title}
                    </div>
                    {/*
                                            <div className="text-[16px] font-semibold">
                                                {item.minutes} AI credits
                                            </div>
                                        */}
                  </div>

                  <div className="text-xl font-bold text-left mb-2">
                    ${`${formatFractional2(item.discountedPrice) || '0'}/mo`}
                  </div>

                  {/*
                                        <div className="text-sm font-normal text-[#8a8a8a] text-left mb-3">
                                            {item.calls} calls* per month
                                        </div>
                                    */}

                  {/*
                                        <div className="text-sm font-normal text-[#8a8a8a] text-left mb-4">
                                            {item.details}
                                        </div>
                                    */}

                  {/* Features section - only show features with thumb = true */}
                  <div
                    className="w-full max-h-[40vh] overflow-auto"
                    style={{
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE/Edge
                    }}
                  >
                    {Array.isArray(item.features) &&
                      item.features.length > 0 && (
                        <div className="mt-6 flex-1">
                          <div className="flex flex-col gap-3">
                            {item.features
                              .slice(0, 6)
                              .map((feature, featureIndex) => (
                                <div
                                  key={featureIndex}
                                  className="flex flex-row items-start gap-1"
                                >
                                  <Checkbox
                                    checked={true}
                                    className="h-4 w-4 mt-0.5 flex-shrink-0 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                  />
                                  <div className="text-sm font-normal text-gray-700 leading-relaxed flex flex-row items-center gap-2 text-start">
                                    <span>{feature.text}</span>
                                    {feature.subtext && (
                                      <Tooltip
                                        title={feature.subtext}
                                        arrow
                                        placement="top"
                                        componentsProps={{
                                          tooltip: {
                                            sx: {
                                              backgroundColor: '#ffffff', // Ensure white background
                                              color: '#333', // Dark text color
                                              fontSize: '10px',
                                              padding: '10px 15px',
                                              borderRadius: '8px',
                                              boxShadow:
                                                '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                                            },
                                          },
                                          arrow: {
                                            sx: {
                                              color: '#ffffff', // Match tooltip background
                                            },
                                          },
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: 10,
                                            fontWeight: '600',
                                            color: '#000000',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Image
                                            src="/agencyIcons/InfoIcon.jpg"
                                            alt="info"
                                            width={12}
                                            height={12}
                                            className="cursor-pointer rounded-full"
                                          />
                                        </div>
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between w-full">
                  <div>
                    {item.id === currentPlan &&
                      userLocalData?.plan?.status !== 'cancelled' && (
                        <div
                          className="mt-4 flex px-2 py-1 bg-brand-primary rounded-full text-white"
                          style={{
                            fontSize: 9,
                            fontWeight: '600',
                            width: 'fit-content',
                          }}
                        >
                          Current Plan
                        </div>
                      )}
                  </div>
                  <div>
                    <button
                      className="view-details-btn mt-4 flex px-3 py-1.5 font-semibold rounded-full cursor-pointer whitespace-nowrap hover:underline outline-none border-none text-brand-primary"
                      style={{
                        width: 'fit-content',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        fontSize: 12,
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Trigering open details view')
                        setShowPlanDetailsPopup(true)
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>

      {planTitleTag() && (
        <div className="w-full flex flex-row items-center justify-center">
          {subscribePlanLoader ? (
            <div className="w-9/12 mt-8 flex flex-row items-center justify-center h-[50px]">
              <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
            </div>
          ) : (
            <button
              className="rounded-xl w-9/12 mt-8"
              // disabled={togglePlan === currentPlan}
              style={{
                height: '50px',
                fontSize: 16,
                fontWeight: '700',
                flexShrink: 0,
                backgroundColor:
                  togglePlan === currentPlan ? 'transparent' : 'hsl(var(--brand-primary, 270 75% 50%))',
                color: togglePlan === currentPlan ? '#000000' : '#ffffff',
                border:
                  togglePlan === currentPlan ? '1px solid #00000080' : 'none',
              }}
              onClick={() => {
                const title = planTitleTag()
                if (title === 'Select a Plan' || !title) {
                  return
                }
                if (title === 'Cancel Subscription') {
                  handleCancelPlanClick()
                } else if (title === 'Downgrade') {
                  setShowDowngradePlanPopup(true)
                } else {
                  setShowUpgradeModal(true)
                  // handleSubscribePlan();
                }
              }}
              disabled={cancelInitiateLoader}
            >
              {planTitleTag()}
            </button>
          )}

          {/*
                     <div className="w-9/12 flex flex-row items-center justify-center">
                         {userLocalData.plan?.status != "cancelled" && (
                             <button
                                 className="text-black  outline-none rounded-xl w-fit-content mt-3"
                                 style={{
                                     fontSize: 16,
                                     fontWeight: "700",
                                     height: "50px",
                                     textDecorationLine: "underline",
                                     flexShrink: 0,
                                 }}
                                 onClick={() => {
                                     if (
                                         userLocalData?.isTrial === false &&
                                         userLocalData?.cancelPlanRedemptions === 0
                                     ) {
                                         // //console.log;
                                         setGiftPopup(true);
                                     } // if (userLocalData?.isTrial === true && userLocalData?.cancelPlanRedemptions !== 0)
                                     else {
                                         // //console.log;
                                         setShowConfirmCancelPlanPopup(true);
                                     }
                                     //// //console.log
                                     //// //console.log
                                 }}
                             >
                                 Cancel Subscription
                             </button>
                         )}
                     </div>
                   */}
        </div>
      )}

      {/* Upgrade plans modal */}
      {selectedUser ? (
        // Use new component when agency is viewing subaccount
        <UpgradePlanForUserFromAdminAgency
          from={'SubAccount'}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          open={showUpgradeModal}
          selectedUser={selectedUser}
          allPlans={plans}
          handleClose={async (upgradeResult) => {
            console.log('selectedPlan in subaccount', selectedPlan)
            setShowUpgradeModal(false)

            // If upgrade was successful, refresh profile and state
            if (upgradeResult) {
              // setSuccessSnack("Upgraded to " + selectedPlan.title + " Plan");
              console.log(
                '🔄 [NEW-BILLING] Upgrade successful, refreshing profile...',
                upgradeResult,
              )
              getProfile()
            }
          }}
          plan={selectedPlan}
          currentFullPlan={currentPlanDetails}
        />
      ) : (
        // Use original component when subaccount views their own plans
        <Elements stripe={stripePromise}>
          <UpgradePlan
            from={'SubAccount'}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            open={showUpgradeModal}
            selectedUser={selectedUser}
            allPlans={plans}
            handleClose={async (upgradeResult) => {
              console.log('selectedPlan in subaccount', selectedPlan)
              setShowUpgradeModal(false)

              // If upgrade was successful, refresh profile and state
              if (upgradeResult) {
                // setSuccessSnack("Upgraded to " + selectedPlan.title + " Plan");
                console.log(
                  '🔄 [NEW-BILLING] Upgrade successful, refreshing profile...',
                  upgradeResult,
                )
                getProfile()
              }
            }}
            plan={selectedPlan}
            currentFullPlan={currentPlanDetails}
          />
        </Elements>
      )}

      {/* Plans details */}
      <Modal
        open={showPlanDetailsPopup}
        onClose={() => {
          setShowPlanDetailsPopup(false)
        }}
      >
        <Box className="bg-white rounded-xl w-[90%] h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-full flex flex-row items-center justify-between px-6 pt-6 h-[8%]">
            <div
              className="flex w-full flex-row items-center gap-2"
              style={{ backgroundColor: '' }}
            >
              <AppLogo
                height={30}
                width={130}
                alt="logo"
              />

              <div className={`w-[80%]`}>
                <ProgressBar value={100} />
              </div>
            </div>
            <CloseBtn
              onClick={() => {
                setShowPlanDetailsPopup(false)
              }}
            />
          </div>
          <div
            className={`w-full h-[88%] overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin`}
            style={{
              scrollbarColor: 'hsl(var(--brand-primary, 270 75% 50%)) transparent',
            }}
          >
            <UserPlans
              handleContinue={() => {
                setShowPlanDetailsPopup(false)
                // refreshProfileAndState();
              }}
              selectedUser={selectedUser}
              handleBack={() => setShowPlanDetailsPopup(false)}
              isFrom="SubAccount"
              from="billing-modal"
              onPlanSelected={(plan) => {
                console.log('Plan selected from modal:', plan)
                // Close UserPlans modal
                setShowPlanDetailsPopup(false)
                // Set the selected plan
                setSelectedPlan(plan)
                setTogglePlan(plan.id)
                setCurrentPlanDetails(plan)
                // Open Upgrade modal
                setShowUpgradeModal(true)
              }}
              disAblePlans={true}
              hideProgressBar={true}
            />
          </div>
        </Box>
      </Modal>

      {/* Downgrade plan confirmation popup */}
      {showDowngradePlanPopup && (
        <DowngradePlanPopup
          open={showDowngradePlanPopup}
          handleClose={() => {
            setShowDowngradePlanPopup(false)
          }}
          onConfirm={() => {
            handleSubscribePlan()
          }}
          downgradeTitle={selectedPlan?.title}
          features={currentPlanDetails?.features}
          subscribePlanLoader={subscribePlanLoader}
          isFrom={true}
          selectedUser={selectedUser}
        />
      )}

      {/* Features to lose window (Cancel Confirmation) */}
      <Modal
        open={showCancelConfirmation}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000030',
          },
        }}
      >
        <Box
          className="md:w-8/12 lg:w-7/12 sm:w-11/12 w-full"
          sx={styles.paymentModal}
        >
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-[90%] relative shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex flex-row justify-between items-center w-full mb-4">
              <div style={{ fontWeight: '600', fontSize: 22 }}>
                {`What You'll Lose`}
              </div>
              <CloseBtn onClick={() => setShowCancelConfirmation(false)} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <CancelConfirmation
                handleContinue={(nextAction) => {
                  if (nextAction === 'finalStep') {
                    setShowCancelConfirmation(false)
                    setShowConfirmCancelPlanPopup(true)
                  }
                }}
              />
            </div>
          </div>
        </Box>
      </Modal>

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
                  selectedUser={selectedUser}
                  fromAdmin={false}
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
                    <CircularProgress size={30} sx={{ color: 'hsl(var(--brand-primary))' }} />
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
                    setGiftPopup(false)
                    setShowCancelConfirmation(true)
                  }}
                >
                  {`No thank you, I'd like to cancel my AssignX`}
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
                  Canceling your AssignX means you lose access to your agents,
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
                onClick={() => setShowConfirmCancelPlanPopup(false)}
              >
                Never mind, keep my AssignX
              </button>

              {cancelPlanLoader ? (
                <div className="w-full flex flex-row items-center justify-center mt-8">
                  <CircularProgress size={30} sx={{ color: 'hsl(var(--brand-primary))' }} />
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
                ></div>
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
                Account Successfully Cancelled
              </div>

              <div
                style={{
                  fontWeight: '500',
                  fontSize: 16,
                  textAlign: 'center',
                  marginTop: 30,
                }}
              >
                {`Tell us why you're cancelling so we can improve.`}
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
                      <CircularProgress size={35} sx={{ color: 'hsl(var(--brand-primary))' }} />
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

      {/* Cancel Plan Animation Modal */}
      <CancelPlanAnimation
        showModal={showCancelPopup}
        handleClose={handleCloseCancelation}
        userLocalData={userLocalData}
        setShowSnak={setShowSnack}
        isPaused={false}
        isSubaccount={true}
        selectedUser={selectedUser}
      />
    </div>
  )
}

export default SubAccountPlansAndPayments
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
