import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Snackbar,
  TextField,
} from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import UnlockPremiunFeatures from '@/components/globalExtras/UnlockPremiunFeatures'
import DowngradePlanPopup from '@/components/myAccount/cancelationFlow/DowngradePlanPopup'
import ProgressBar from '@/components/onboarding/ProgressBar'
import AgencyPlans from '@/components/plan/AgencyPlans'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { ScrollBarCss } from '@/constants/Constants'
import AppLogo from '@/components/common/AppLogo'
import { useUser } from '@/hooks/redux-hooks'
import { GetFormattedDateString } from '@/utilities/utility'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import SmartRefillCard from '../agencyExtras.js/SmartRefillCard'
import { formatDecimalValue } from '../agencyServices/CheckAgencyData'
import AgencyCancelConfirmation from './AgencyCancelConfirmation'

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(stripePublickKey)

function AgencyPlansPayments({ selectedAgency }) {
  //stores redux user data
  const { user: reduxUser, setUser: setReduxUser } = useUser()

  //stroes user cards list
  const [cards, setCards] = useState([])

  //current subaccounts list
  const [currentSubAccounts, setCurrentSubAccounts] = useState('')

  //userlocal data
  const [userLocalData, setUserLocalData] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
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

  //variables for cancel plan
  const [giftPopup, setGiftPopup] = useState(false)
  const [ScreenWidth, setScreenWidth] = useState(null)
  const [showCancelFeaturesModal, setShowCancelFeaturesModal] = useState(false)
  const [showConfirmCancelPlanPopup, setShowConfirmCancelPlanPopup] =
    useState(false)
  const [showConfirmCancelPlanPopup2, setShowConfirmCancelPlanPopup2] =
    useState(false)

  const [plans, setPlans] = useState([])
  const [initialLoader, setInitialLoader] = useState(false)

  const [showDowngradePlanPopup, setShowDowngradePlanPopup] = useState(false)
  const [showDowngradePlanWarning, setShowDowngradePlanWarning] =
    useState(false)

  //plans details
  const [showPlanDetailsPopup, setShowPlanDetailsPopup] = useState(false)

  //variables for update plan
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const [confirmChecked, setConfirmChecked] = useState(false)

  let duration = [
    {
      id: 1,
      title: 'Monthly',
      value: 'monthly',
    },
    {
      id: 2,
      title: 'Quarterly',
      value: 'quarterly',
    },
    {
      id: 3,
      title: 'Yearly',
      value: 'yearly',
    },
  ]

  let durationSaving = [
    {
      id: 2,
      title: 'save 20%',
    },
    {
      id: 3,
      title: 'save 30%',
    },
  ]

  const [monthlyPlans, setMonthlyPlans] = useState([])
  const [quaterlyPlans, setQuaterlyPlans] = useState([])
  const [yearlyPlans, setYearlyPlans] = useState([])
  const [selectedDuration, setSelectedDuration] = useState(duration[0])

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
    getCurrentSubAccounts()
    getPlans()
    getPaymentHistory()
    getCardsList()
  }, [])

  useEffect(() => {
    if (plans.length > 0) {
      getProfile()
    }
  }, [plans])

  useEffect(() => {
    if (
      currentPlan &&
      (monthlyPlans.length > 0 ||
        quaterlyPlans.length > 0 ||
        yearlyPlans.length > 0)
    ) {
      sequenceIdDetecter()
    }
  }, [currentPlan, monthlyPlans, quaterlyPlans, yearlyPlans])

  //for updating the plan duration tab use the loginc to useeffect on currentplans change compare the title of available plans with the duration of current plan and selet that plan
  //get plans apis
  const getPlans = async () => {
    try {
      setInitialLoader(true)
      const Token = AuthToken()
      let ApiPath = Apis.getPlansForAgency
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      }
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('Response of get plans api is', response.data.data)
        const monthly = []
        const quarterly = []
        const yearly = []
        let plansList = response.data.data
        plansList.forEach((plan) => {
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
        setPlans(response.data.data)
        setMonthlyPlans(monthly)
        setQuaterlyPlans(quarterly)
        setYearlyPlans(yearly)
        setInitialLoader(false)
      }
    } catch (error) {
      setInitialLoader(false)
      console.error('Error occured in getting plans', error)
    }
  }

  const getProfile = async () => {
    try {
      const localData = localStorage.getItem('User')
      let response = null
      if (selectedAgency) {
        const Token = AuthToken()
        let ApiPath = Apis.getProfileFromId
        ApiPath = ApiPath + '?id=' + selectedAgency.id

        //console.log

        response = await axios.get(ApiPath, {
          headers: {
            Authorization: 'Bearer ' + Token,
          },
        })
      } else {
        response = await getProfileDetails()
      }
      //console.log;
      if (response) {
        let plan = response?.data?.data?.plan
        let togglePlan = plan?.planId
        let planType = null
        // if (plan.status == "active") {
        //   if (togglePlan === "Plan30") {
        //     planType = 1;
        //   } else if (togglePlan === "Plan120") {
        //     planType = 2;
        //   } else if (togglePlan === "Plan360") {
        //     planType = 3;
        //   } else if (togglePlan === "Plan720") {
        //     planType = 4;
        //   }
        // }
        setUserLocalData(response?.data?.data)
        // //console.log;
        setTogglePlan(togglePlan)
        setCurrentPlan(togglePlan)
        // setCurrentPlanDetails(response?.data?.data?.plan)
        let userPlanDuration = response?.data?.data?.plan?.duration
        console.log('response?.data?.data?.plan', plans)

        const matchedDuration = plans.find((d) => d.id === togglePlan)

        console.log(
          'plans find',
          plans.find((d) => d.id === togglePlan),
        )
        if (matchedDuration) {
          if (matchedDuration.duration === 'monthly') {
            setSelectedDuration(duration[0])
          } else if (matchedDuration.duration === 'quarterly') {
            setSelectedDuration(duration[1])
          } else if (matchedDuration.duration === 'yearly') {
            setSelectedDuration(duration[2])
          }
        } else {
          setSelectedDuration(duration[0]) // Default to Monthly if no match
        }
      }
    } catch (error) {
      // console.error("Error in getprofile api is", error);
    }
  }

  //function to close the add card popup
  const handleClose = (data) => {
    console.log('Data recieved after add card is', data)
    if (data?.setupIntent) {
      let newCard = data.setupIntent
      setAddPaymentPopup(false)
      setCards([newCard, ...cards])
      setSuccessSnack('Card Added.')
      getCardsList()
      // window.location.reload()
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

      let ApiPath = Apis.getCardsList
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      }

      // //console.log;

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

  //get current subaccounts list
  const getCurrentSubAccounts = async () => {
    try {
      let ApiPAth = Apis.getAgencySubAccount
      const Token = AuthToken()
      const response = await axios.get(ApiPAth, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        setCurrentSubAccounts(response.data.data)
      }
    } catch (err) {
      console.log('Error occured in fetching subaccounts list', err)
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
    setTogglePlan(item.id)
    setSelectedPlan(item) // Always set selectedPlan to the clicked item
    planTitleTag()
  }

  const handleCancelPlanClick = () => {
    setShowCancelFeaturesModal(true)
  }

  const handleCancelFeaturesContinue = () => {
    setShowCancelFeaturesModal(false)
    setShowConfirmCancelPlanPopup(true)
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
            // let togglePlan = response2?.data?.data?.plan?.type;
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
            // setTogglePlan(planType);
            setCurrentPlan(togglePlan)
            // setCurrentPlanDetails(selectedPlan);
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
      setHistoryLoader(true)

      let AuthToken = null
      let localDetails = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        localDetails = LocalDetails
        AuthToken = LocalDetails.token
      }

      let ApiPath = Apis.getPaymentHistory
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency}`
      }

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

      const ApiPath = Apis.completeCancelatiton

      console.log('ApiPath', ApiPath)

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
        if (response.data.status === true) {
          console.log('response.data.data', response.data)

          setShowConfirmCancelPlanPopup(false)
          setGiftPopup(false)
          setTogglePlan(null)
          setCurrentPlan(null)
          getProfile()
          setSuccessSnack('Account canceled')
          await getProfileDetails()
          window.location.href = '/agency/plan'
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
          // setCurrentPlanDetails(selectedPlan);
          if (response2.data.status === true) {
            setSuccessSnack("You've claimed an extra 30 mins")
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

  //del reason api
  const handleDelReason = async () => {
    if (!otherReasonInput && !selectReason) return

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

      const ApiPath = Apis.calcelPlanReason

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          // After reason is submitted, proceed to cancel the plan
          setShowConfirmCancelPlanPopup2(false)
          await handleCancelPlan()
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      setErrorSnack(error)
      setCancelReasonLoader(false)
      console.error('Error occured in api is ', error)
    } finally {
      setCancelReasonLoader(false)
    }
  }

  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) {
      console.log('Monthly plans set are', monthlyPlans)
    }
    if (selectedDuration.id === 2) {
      console.log('Quarterly plans set are', quaterlyPlans)
    }
    if (selectedDuration.id === 3) {
      console.log('Yearly plans set are', yearlyPlans)
    }
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    return []
  }

  // Helper function to find matching plan by tier name in a different billing cycle
  // This finds a plan with the same tier (Starter/Growth/Scale) in the target plans list
  const findMatchingPlanByTier = (sourcePlan, targetPlans) => {
    if (!sourcePlan || !targetPlans || targetPlans.length === 0) {
      return null
    }

    // Get the tier name from source plan (normalize to lowercase)
    const sourceTitle = (
      sourcePlan.title ||
      sourcePlan.name ||
      ''
    ).toLowerCase()

    // Determine tier from source plan
    let tierName = null
    if (sourceTitle.includes('starter')) {
      tierName = 'starter'
    } else if (sourceTitle.includes('growth')) {
      tierName = 'growth'
    } else if (sourceTitle.includes('scale')) {
      tierName = 'scale'
    }

    if (!tierName) {
      console.log(
        '🔍 [FIND-MATCH] Could not determine tier from source plan:',
        sourceTitle,
      )
      return null
    }

    // Find plan with matching tier in target plans
    const matchingPlan = targetPlans.find((plan) => {
      const planTitle = (plan.title || plan.name || '').toLowerCase()
      return planTitle.includes(tierName)
    })

    if (matchingPlan) {
      console.log(
        `🔍 [FIND-MATCH] Found matching ${tierName} plan in target duration:`,
        matchingPlan.title,
      )
    } else {
      console.log(
        `🔍 [FIND-MATCH] No matching ${tierName} plan found in target duration`,
      )
    }

    return matchingPlan || null
  }

  // Function to handle duration change and auto-select matching plan
  const handleDurationChange = (newDuration) => {
    setSelectedDuration(newDuration)

    // Get target plans for the new duration
    let targetPlans = []
    if (newDuration.id === 1) {
      targetPlans = monthlyPlans
    } else if (newDuration.id === 2) {
      targetPlans = quaterlyPlans
    } else if (newDuration.id === 3) {
      targetPlans = yearlyPlans
    }

    if (targetPlans.length === 0) {
      console.log(
        '⚠️ [DURATION-CHANGE] No plans available for selected duration',
      )
      return
    }

    // Check if user has manually selected a plan that's different from their current plan
    const hasManualSelection = selectedPlan && selectedPlan.id !== currentPlan

    // Priority 1: If user has manually selected a plan (different from current), find its matching tier in new duration
    // This handles the case where user selected Growth Yearly, then switches to Quarterly
    // We want to auto-select Growth Quarterly (the selected plan's tier)
    if (hasManualSelection) {
      const matchingTierPlan = findMatchingPlanByTier(selectedPlan, targetPlans)
      if (matchingTierPlan) {
        console.log(
          '✅ [DURATION-CHANGE] Found matching tier for manually selected plan, auto-selecting:',
          matchingTierPlan.title,
        )
        setTogglePlan(matchingTierPlan.id)
        setSelectedPlan(matchingTierPlan)
        return
      }
    }

    // Priority 2: If user has a current plan ID, try to find the exact plan in the new duration
    // This handles the case where the user's actual plan exists in the new duration
    if (currentPlan) {
      const currentPlanInNewDuration = targetPlans.find(
        (p) => p.id === currentPlan,
      )
      if (currentPlanInNewDuration) {
        console.log(
          '✅ [DURATION-CHANGE] Found current plan by ID in new duration, auto-selecting:',
          currentPlanInNewDuration.title,
        )
        setTogglePlan(currentPlanInNewDuration.id)
        setSelectedPlan(currentPlanInNewDuration)
        // Update currentPlanDetails to the found plan
        setCurrentPlanDetails(currentPlanInNewDuration)
        return
      }
    }

    // Priority 3: If current plan not found by ID, find matching tier plan in new duration
    // This handles the case where user has Scale Yearly, switches to Monthly, then back to Yearly
    // We want to find Scale Yearly again (matching tier)
    if (currentPlanDetails) {
      const matchingTierPlan = findMatchingPlanByTier(
        currentPlanDetails,
        targetPlans,
      )
      if (matchingTierPlan) {
        console.log(
          '✅ [DURATION-CHANGE] Found matching tier plan for current plan, auto-selecting:',
          matchingTierPlan.title,
        )
        setTogglePlan(matchingTierPlan.id)
        setSelectedPlan(matchingTierPlan)
        // Update currentPlanDetails if this is the user's actual current plan
        if (matchingTierPlan.id === currentPlan) {
          setCurrentPlanDetails(matchingTierPlan)
        }
        return
      }
    }

    // If no match found, don't auto-select anything
    console.log(
      '⚠️ [DURATION-CHANGE] No matching plan found, keeping current selection',
    )
  }

  // Helper function to compare plans based on tier and billing cycle
  // Returns: 'upgrade' | 'downgrade' | 'same' | null
  // Logic:
  // 1. Compare plan tiers first (Starter < Growth < Scale)
  // 2. If same tier, compare billing cycles (monthly < quarterly < yearly)
  // 3. Fall back to price comparison if tier can't be determined
  const comparePlans = (currentPlanObj, targetPlanObj) => {
    if (!currentPlanObj || !targetPlanObj) {
      return null
    }

    // Get monthly prices (for fallback comparison)
    const currentPrice =
      currentPlanObj.originalPrice || currentPlanObj.price || 0
    const targetPrice = targetPlanObj.originalPrice || targetPlanObj.price || 0

    console.log(
      '🔍 [PLAN-COMPARE] Current plan:',
      currentPlanObj.title,
      'Price:',
      currentPrice,
      'Duration:',
      currentPlanObj.duration,
    )
    console.log(
      '🔍 [PLAN-COMPARE] Target plan:',
      targetPlanObj.title,
      'Price:',
      targetPrice,
      'Duration:',
      targetPlanObj.duration,
    )

    // If same plan (by ID), it's the same
    if (
      currentPlanObj.id === targetPlanObj.id ||
      currentPlanObj.planId === targetPlanObj.id
    ) {
      return 'same'
    }

    // Plan tier hierarchy (lower number = lower tier)
    const tierRanking = {
      starter: 1,
      growth: 2,
      scale: 3,
    }

    // Get plan titles/names (normalize to lowercase for comparison)
    const currentTitle = (
      currentPlanObj.title ||
      currentPlanObj.name ||
      ''
    ).toLowerCase()
    const targetTitle = (
      targetPlanObj.title ||
      targetPlanObj.name ||
      ''
    ).toLowerCase()

    // Get tier ranks (default to -1 if not found)
    let currentTierRank = -1
    let targetTierRank = -1

    // Try to match tier from title/name
    for (const [tier, rank] of Object.entries(tierRanking)) {
      if (currentTitle.includes(tier)) {
        currentTierRank = rank
      }
      if (targetTitle.includes(tier)) {
        targetTierRank = rank
      }
    }

    // Get billing cycle order (monthly < quarterly < yearly)
    const billingCycleOrder = {
      monthly: 1,
      quarterly: 2,
      yearly: 3,
    }

    const currentBillingOrder =
      billingCycleOrder[currentPlanObj.duration] ||
      billingCycleOrder[currentPlanObj.billingCycle] ||
      1
    const targetBillingOrder =
      billingCycleOrder[targetPlanObj.duration] ||
      billingCycleOrder[targetPlanObj.billingCycle] ||
      1

    // If we can determine tier ranks, compare them first
    if (currentTierRank >= 0 && targetTierRank >= 0) {
      // Different tiers - tier comparison determines upgrade/downgrade
      if (targetTierRank > currentTierRank) {
        console.log('🔍 [PLAN-COMPARE] Result: UPGRADE (tier change)')
        return 'upgrade'
      } else if (targetTierRank < currentTierRank) {
        console.log('🔍 [PLAN-COMPARE] Result: DOWNGRADE (tier change)')
        return 'downgrade'
      }
      // Same tier - compare billing cycles
      if (targetBillingOrder > currentBillingOrder) {
        console.log(
          '🔍 [PLAN-COMPARE] Result: UPGRADE (same tier, longer billing cycle)',
        )
        return 'upgrade'
      } else if (targetBillingOrder < currentBillingOrder) {
        console.log(
          '🔍 [PLAN-COMPARE] Result: DOWNGRADE (same tier, shorter billing cycle)',
        )
        return 'downgrade'
      } else {
        console.log(
          '🔍 [PLAN-COMPARE] Result: SAME (same tier and billing cycle)',
        )
        return 'same'
      }
    }

    // Fall back to price comparison if tier can't be determined
    console.log(
      '⚠️ [PLAN-COMPARE] Tier not determined, falling back to price comparison',
    )
    if (targetPrice > currentPrice) {
      return 'upgrade'
    } else if (targetPrice < currentPrice) {
      return 'downgrade'
    }

    // Same price, compare billing cycles
    if (targetBillingOrder > currentBillingOrder) {
      return 'upgrade'
    } else if (targetBillingOrder < currentBillingOrder) {
      return 'downgrade'
    }

    return 'same'
  }

  //get the plan title for the button to upgrade and own grade also cancel plan subscription
  const planTitleTag = () => {
    const plansList = getCurrentPlans()

    console.log('Current plan id is', currentPlan)
    console.log('Toggle plan id is', togglePlan)
    console.log('Current plan details are', currentPlanDetails?.status)
    console.log(
      'Plans list:',
      plansList.map((p) => p.id),
    )

    if (!togglePlan) return 'Select a Plan'

    // If agency has no plan at all, show "Subscribe" when a plan is selected
    if (!userLocalData?.plan || !currentPlan) {
      return 'Subscribe'
    }

    // Check user's plan status from userLocalData (not currentPlanDetails which is from DB)
    // currentPlanDetails comes from database plan list and doesn't have status field
    if (userLocalData?.plan?.status === 'cancelled') {
      // If same plan selected, show "Subscribe" (can't cancel an already cancelled plan)
      if (togglePlan === currentPlan) {
        return 'Subscribe'
      }
      // If different plan selected, allow subscription
      return 'Subscribe'
    }

    // If same plan selected, show cancel subscription
    if (togglePlan === currentPlan) {
      return 'Cancel Subscription'
    }

    // Find the target plan object
    const targetPlan = plansList.find((p) => p.id === togglePlan)
    if (!targetPlan) {
      console.warn('Target plan not found in current plans list')
      return 'Select a Plan'
    }

    // Compare plans using tier and price logic
    const comparison = comparePlans(currentPlanDetails, targetPlan)

    if (comparison === 'upgrade') {
      console.log('Plan status is Upgrade')
      return 'Upgrade'
    } else if (comparison === 'downgrade') {
      console.log('Plan status is Downgrade')
      return 'Downgrade'
    } else if (comparison === 'same') {
      return 'Cancel Subscription'
    }

    // Fallback: compare by ID if comparison failed
    if (togglePlan > currentPlan) {
      console.log('Plan status is Upgrade (fallback)')
      return 'Upgrade'
    } else if (togglePlan < currentPlan) {
      console.log('Plan status is Downgrade (fallback)')
      return 'Downgrade'
    }

    // Final fallback
    return 'Cancel Subscription'
  }

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
      // setCurrentPlanSequenceId(monthlyMatch.sequenceId); // or monthlyMatch.planId if that's your field
      return
    }

    // Search inside quarterly plans
    const quarterlyMatch = quaterlyPlans.find((p) => p.id === currentPlan)
    if (quarterlyMatch) {
      // console.log("Matching quarterlyMatch plan is", quarterlyMatch)
      setCurrentPlanDetails(quarterlyMatch)
      // setCurrentPlanSequenceId(quarterlyMatch.sequenceId);
      return
    }

    // Search inside yearly plans
    const yearlyMatch = yearlyPlans.find((p) => p.id === currentPlan)
    if (yearlyMatch) {
      // console.log("Matching yearlyMatch plan is", yearlyMatch)
      setCurrentPlanDetails(yearlyMatch)
      // setCurrentPlanSequenceId(yearlyMatch.sequenceId);
      return
    }
  }

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2 min-h-screen"
      style={{
        paddingBottom: '50px',
        scrollbarWidth: 'none', // For Firefox
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

        <button
          className=""
          onClick={() => {
            setAddPaymentPopup(true)
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: '500',
              className: 'text-brand-primary',
              textDecorationLine: 'underline',
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
            <CircularProgress size={35} />
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
                            className={`w-5 h-5 rounded-full border flex items-center justify-center`}
                            style={{
                              borderWidth:
                                item.isDefault || selectedCard?.id === item.id
                                  ? 3
                                  : 1,
                              borderColor: item.isDefault || selectedCard?.id === item.id
                                ? 'hsl(var(--brand-primary))'
                                : 'hsl(var(--brand-primary) / 0.3)',
                              backgroundColor: item.isDefault || selectedCard?.id === item.id
                                ? 'hsl(var(--brand-primary))'
                                : 'transparent',
                            }}
                          >
                            {(item.isDefault || selectedCard?.id === item.id) && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: '#fff',
                                }}
                              />
                            )}
                          </div>
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

      {/* Code for smart refill */}
      {/*<SmartRefillCard />*/}

      <div className="w-full flex flex-col items-end mt-2">
        <div className="flex flex-row items-center justify-end gap-2 px-2 me-[7px]">
          {durationSaving.map((item) => {
            return (
              <button
                key={item.id}
                // className={`px-2 py-1 text-[#8A8A8A] rounded-tl-lg rounded-tr-lg`}
                className={`px-2 py-1 ${selectedDuration?.id === item.id ? 'text-white bg-brand-primary shadow-sm shadow-brand-primary' : 'text-black'} rounded-tl-lg rounded-tr-lg`}
                style={{ fontWeight: '600', fontSize: '13px' }}
                onClick={() => {
                  handleDurationChange(item)
                }}
              >
                {item.title}
              </button>
            )
          })}
        </div>
        <div
          // className='flex flex-row items-center gap-2 bg-[#DFDFDF20] p-2 rounded-full'  //No plans available for no plans
          className="border bg-neutral-100 px-2 flex flex-row items-center gap-[8px] rounded-full py-1.5"
        >
          {duration.map((item) => (
            <button
              key={item.id}
              className={`px-4 py-1 ${selectedDuration.id === item.id ? 'text-white bg-brand-primary shadow-md shadow-brand-primary rounded-full' : 'text-black'}`}
              onClick={() => {
                handleDurationChange(item)
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* code for current plans available */}

      {/*getCurrentPlans().map((item, index) => (
                <button
                    key={item.id}
                    className="w-full mt-4 outline-none"
                    onClick={(e) => handleTogglePlanClick(item)}
                >
                    <div
                        className="px-4 py-1 pb-4"
                        style={{
                            ...styles.pricingBox,
                            border:
                                item.id === togglePlan
                                    ? "2px solid hsl(var(--brand-primary, 270 75% 50%))"
                                    : "1px solid #15151520",
                            backgroundColor: item.id === togglePlan ? "hsl(var(--brand-primary) / 0.05)" : "",
                        }}
                    >
                        <div
                            style={{ ...styles.triangleLabel, borderTopRightRadius: "7px" }}
                        ></div>
                        <span style={styles.labelText}>{item.planStatus}</span>
                        <div
                            className="flex flex-row items-start gap-3"
                            style={styles.content}
                        >
                            <div className="mt-1">
                                <div>
                                    {item.id === togglePlan ? (
                                        <Image
                                            src={"/svgIcons/checkMark.svg"}
                                            height={24}
                                            width={24}
                                            alt="*"
                                        />
                                    ) : (
                                        <Image
                                            src={"/svgIcons/unCheck.svg"}
                                            height={24}
                                            width={24}
                                            alt="*"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="w-full">
                                {item.id === currentPlan && currentPlanDetails?.status === "active" && (
                                    <div
                                        className="-mt-[27px] flex px-2 py-1 bg-brand-primary rounded-full text-white"
                                        style={{
                                            fontSize: 11.6,
                                            fontWeight: "500",
                                            width: "fit-content",
                                        }}
                                    >
                                        Current Plan
                                    </div>
                                )}

                                <div className="flex flex-row items-center gap-3">
                                    <div
                                        style={{
                                            color: "#151515",
                                            fontSize: 20,
                                            fontWeight: "600",
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                    {item.status && (
                                        <div
                                            className="flex px-2 py-1 bg-brand-primary rounded-full text-white"
                                            style={{ fontSize: 11.6, fontWeight: "500" }}
                                        >
                                            {item.status}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <div
                                        className="mt-2"
                                        style={{
                                            color: "#15151590",
                                            fontSize: 12,
                                            width: "60%",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {item.planDescription}
                                    </div>
                                    <div className="flex flex-row items-center">

                                        <div className="flex flex-row justify-start items-start ">
                                            <div style={styles.discountedPrice}>
                                                ${item.originalPrice}
                                            </div>
                                            <p style={{ color: "#15151580" }}>/mo*</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            ))*/}

      <RadioGroup
        value={togglePlan?.toString() || ''}
        onValueChange={(value) => {
          const plan = getCurrentPlans().find((p) => p.id?.toString() === value)
          if (plan) {
            handleTogglePlanClick(plan)
          }
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
        {getCurrentPlans().map((item, index) => (
          <button
            key={item.id}
            className="mt-4 outline-none flex-shrink-0"
            style={{ width: '250px' }} // Fixed width for consistent card sizes
            onClick={(e) => handleTogglePlanClick(item)}
          >
            <div
              className="px-4 py-4 pb-4 flex flex-col gap-3 h-full"
              style={{
                ...styles.pricingBox,
                border:
                  item.id === togglePlan
                    ? '2px solid hsl(var(--brand-primary))'
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
                        ) : (
                          <div
                            style={{
                              fontSize: 11.6,
                              fontWeight: '500',
                              width: 'fit-content',
                            }}
                          >
                            Renews on:{' '}
                            {userLocalData?.nextChargeDate &&
                              moment(userLocalData?.nextChargeDate).format(
                                'MM/DD/YYYY',
                              )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between w-full mb-4">
                    <div className="text-[16px] font-semibold">
                      {item.title}
                    </div>
                    {/*
                                         <div className="text-[16px] font-semibold">
                                             {item.mints} AI credits
                                         </div>
                                       */}
                  </div>

                  <div className="text-xl font-bold text-left mb-2">
                    ${formatDecimalValue(item.originalPrice)}/mo
                  </div>

                  {/*
                                        <div className="text-sm font-normal text-[#8a8a8a] text-left mb-3">
                                            {item.calls} calls* per month
                                        </div>
                                    */}

                  <div className="text-sm font-normal text-[#8a8a8a] text-left mb-4">
                    {item.description}
                  </div>

                  {/* Features section - only show features with thumb = true */}
                  <div
                    className="w-full max-h-[40vh] overflow-hidden"
                    style={{
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE/Edge
                    }}
                  >
                    {item.features &&
                      Array.isArray(item.features) &&
                      item.features.length > 0 && (
                        <div className="mt-6 flex-1">
                          <div className="flex flex-col gap-3">
                            {item?.features
                              ?.filter((feature) => feature.thumb === true)
                              ?.slice(0, 6)
                              ?.map((feature, featureIndex) => (
                                <div
                                  key={featureIndex}
                                  className="flex flex-row items-start gap-1"
                                >
                                  <Checkbox
                                    checked={true}
                                    className="h-4 w-4 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                  />
                                  <div className="text-sm font-normal text-gray-700 leading-relaxed flex-1 text-start">
                                    {feature.text}
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
                      currentPlanDetails?.status === 'active' && (
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
                      className="mt-4 flex px-3 py-1.5 font-semibold rounded-full cursor-pointer whitespace-nowrap hover:underline outline-none border-none text-brand-primary"
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
                      onClick={() => {
                        setShowPlanDetailsPopup(true)
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </RadioGroup>

      <div className="w-full flex flex-row items-center justify-center">
        {subscribePlanLoader ? (
          <div className="w-9/12 mt-8 flex flex-row items-center justify-center h-[50px]">
            <CircularProgress size={25} />
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
              if (title === 'Select a Plan') {
                return
              }

              // Ensure selectedPlan is set from togglePlan
              if (!selectedPlan && togglePlan) {
                const plansList = getCurrentPlans()
                const plan = plansList.find((p) => p.id === togglePlan)
                if (plan) {
                  setSelectedPlan(plan)
                }
              }

              if (title === 'Cancel Subscription') {
                handleCancelPlanClick()
              } else if (title === 'Downgrade') {
                console.log(
                  'Currently selected plan is',
                  selectedPlan?.capabilities?.maxSubAccounts,
                )
                console.log(
                  'Current sub accounts count:',
                  currentSubAccounts?.length,
                )
                // Check if downgrade would exceed sub-account limits
                if (
                  selectedPlan?.capabilities?.maxSubAccounts !== undefined &&
                  selectedPlan?.capabilities?.maxSubAccounts <
                    currentSubAccounts?.length
                ) {
                  setShowDowngradePlanWarning(true)
                } else {
                  setShowDowngradePlanPopup(true)
                }
              } else {
                // handleSubscribePlan()
                setShowUpgradeModal(true)
              }
            }}
          >
            {planTitleTag()}
          </button>
        )}
      </div>

      {/* Upgrade plans modal */}
      <Elements stripe={stripePromise}>
        <UpgradePlan
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          open={showUpgradeModal}
          handleClose={async (upgradeResult) => {
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
          from={'agency'}
        />
      </Elements>

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
            className={`w-full h-[88%] mt-4 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary`}
          >
            <AgencyPlans
              isFrom={'addPlan'}
              handleCloseModal={(d) => {
                setShowPlanDetailsPopup(false)
              }}
              disAblePlans={true}
            />
          </div>
        </Box>
      </Modal>

      {/* Downgrade Plan Warning */}
      <UnlockPremiunFeatures
        open={showDowngradePlanWarning}
        handleClose={() => {
          setShowDowngradePlanWarning(false)
        }}
        handleConfirmDownGrade={() => {
          setShowDowngradePlanWarning(false)
          window.location.href = '/agency/dashboard/subAccounts'
        }}
        from={'agencyPayments'}
        title={selectedPlan?.title || 'Downgrade Plan'}
      />

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
        />
      )}

      {/* Cancel Plan Features Modal */}
      <Modal
        open={showCancelFeaturesModal}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000030',
          },
        }}
      >
        <Box
          className="md:8/12 lg:w-[55%] sm:w-11/12 w-full"
          sx={styles.paymentModal}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
                height: '90vh',
                maxHeight: '600px',
              }}
            >
              <div className="flex flex-row justify-end mb-2">
                <button onClick={() => setShowCancelFeaturesModal(false)}>
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <div className="flex flex-col h-[calc(100%-60px)]">
                <AgencyCancelConfirmation
                  handleContinue={() => {
                    handleCancelFeaturesContinue()
                    setShowCancelFeaturesModal(false)
                  }}
                  currentPlanDetails={currentPlanDetails}
                  userLocalData={userLocalData}
                  selectedAgency={selectedAgency}
                />
              </div>
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
                  getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleClose}
                  // togglePlan={""}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
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
        <Box className="flex justify-center items-center w-full h-full">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-[90%] relative shadow-2xl">
            <div className="flex flex-row justify-between items-center w-full">
              <div style={{ fontWeight: '600', fontSize: 22 }}>
                Are you sure?
              </div>
              <CloseBtn onClick={() => setShowConfirmCancelPlanPopup(false)} />
            </div>
            <div
              className="mt-4"
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: '#000000',
              }}
            >
              {`You’ll lose access to sub accounts, future payouts, agents and all agency capabilities.
`}
            </div>

            <div className="w-full">
              <div className="flex flex-row items-center w-full justify-start mt-4 gap-2">
                <button
                  onClick={() => {
                    setConfirmChecked(!confirmChecked)
                  }}
                >
                  {confirmChecked ? (
                    <div
                      className="bg-brand-primary flex flex-row items-center justify-center rounded"
                      style={{ height: '17px', width: '17px' }}
                    >
                      <Image
                        src={'/assets/whiteTick.png'}
                        height={6}
                        width={8}
                        alt="*"
                      />
                    </div>
                  ) : (
                    <div
                      className="bg-none border-2 flex flex-row items-center justify-center rounded"
                      style={{ height: '17px', width: '17px' }}
                    ></div>
                  )}
                </button>

                <button
                  className="text-xs font-normal"
                  // onClick={() => { window.open(PersistanceKeys.CopyLinkTerms, "_blank") }}
                >
                  I understand and agree
                </button>
              </div>
              <button
                className={`${confirmChecked ? 'bg-brand-primary' : 'bg-btngray'} ${confirmChecked ? 'text-white' : 'text-black'} px-4 h-[40px] rounded-lg mt-4 w-full`}
                onClick={() => {
                  if (confirmChecked) {
                    setShowConfirmCancelPlanPopup(false)
                    setShowConfirmCancelPlanPopup2(true)
                  }
                }}
                disabled={!confirmChecked}
              >
                Cancel Account
              </button>
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
                <div></div>
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
                  marginTop: 5,
                }}
              >
                Account Successfully Cancelled
              </div>

              <div
                style={{
                  fontWeight: '500',
                  fontSize: 16,
                  textAlign: 'center',
                  marginTop: 5,
                }}
              >
                {`Tell us why you're cancelling so we can improve.`}
              </div>

              <div className="w-full flex flex-row items-center justify-center">
                <div className="mt-3 w-10/12">
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
                          // backgroundColor: item.reason === selectReason ? "hsl(var(--brand-primary, 270 75% 50%))" : "",
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
                            ? 'hsl(var(--brand-primary))'
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
    </div>
  )
}

export default AgencyPlansPayments
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
    borderRadius: '10px',
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
