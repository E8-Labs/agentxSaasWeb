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

import { getBusinessProfile } from '@/apiservicescomponent/twilioapis/GetBusinessProfile'
import SmartRefillCard from '@/components/agency/agencyExtras.js/SmartRefillCard'
import { formatDecimalValue } from '@/components/agency/agencyServices/CheckAgencyData'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { getUserLocalData } from '@/components/constants/constants'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import LeggacyPlanUpgrade from '@/components/myAccount/LegacyPlanUpgrade'
import CancelPlanAnimation from '@/components/myAccount/cancelationFlow/CancelPlanAdnimation'
import DowngradePlanPopup from '@/components/myAccount/cancelationFlow/DowngradePlanPopup'
import PauseSubscription from '@/components/myAccount/cancelationFlow/PauseSubscription'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { DurationView } from '@/components/plan/DurationView'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import AppLogo from '@/components/common/AppLogo'
import {
  downgradeToGrowthFeatures,
  downgradeToStarterFeatures,
  getMonthlyPrice,
  getTotalPrice,
  getUserPlans,
  initiateCancellation,
  isLagecyPlan,
} from '@/components/userPlans/UserPlanServices'
import UserPlans from '@/components/userPlans/UserPlans'
import UpgradeModal from '@/constants/UpgradeModal'
import { isSubaccountTeamMember } from '@/constants/teamTypes/TeamTypes'
import { useUser } from '@/hooks/redux-hooks'
import { getFeaturesToLose } from '@/utilities/PlanComparisonUtils'
import PlansService, { duration } from '@/utilities/PlansService'
import { GetFormattedDateString } from '@/utilities/utility'

import AdminGetProfileDetails from '../../AdminGetProfileDetails'

const stripePromise = getStripe()

function AdminBilling({ selectedUser, from }) {
  //stroes user cards list
  const [cards, setCards] = useState([])

  //stores subAccount Plans
  const defaultPlans = [
    {
      id: 1,
      mints: 30,
      calls: 125,
      details: 'Great for trying out AI sales agents.',
      // originalPrice: "45",
      discountPrice: '45',
      planStatus: '',
      status: '',
    },
    {
      id: 2,
      mints: 120,
      calls: '500',
      details: 'Perfect for lead updates and engagement.',
      originalPrice: '165',
      discountPrice: '99',
      planStatus: '40%',
      status: '',
    },
    {
      id: 3,
      mints: 360,
      calls: '1500',
      details: 'Perfect for lead reactivation and prospecting.',
      originalPrice: '540',
      discountPrice: '299',
      planStatus: '50%',
      status: 'Popular',
    },
    {
      id: 4,
      mints: 720,
      calls: '5k',
      details: 'Ideal for teams and reaching new GCI goals. ',
      originalPrice: '1200',
      discountPrice: '599',
      planStatus: '60%',
      status: 'Best Value',
    },
  ]

  const { user: reduxUser, updateProfile } = useUser()

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

  const [allowSmartRefill, setAllowSmartRefill] = useState(false)

  //confirmation popup for update plan
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  //array of plans - now loaded dynamically
  const [plans, setPlans] = useState([])

  const [showCancelPopup, setShowCancelPoup] = useState(false)

  const [selectedDuration, setSelectedDuration] = useState(duration[0])

  const [monthlyPlans, setMonthlyPlans] = useState([])
  const [quaterlyPlans, setQuaterlyPlans] = useState([])
  const [yearlyPlans, setYearlyPlans] = useState([])

  const [currentFullPlan, setCurrentFullPlan] = useState(null)
  const [toggleFullPlan, setToggleFullPlan] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showDowngradeModal, setShowDowngradeModal] = useState(false)
  const [downgradeTitle, setDowngradeTitle] = useState('')
  const [downgradeFeatures, setDowngradeFeatures] = useState([])

  // Smart Refill Upgrade Modal state
  const [showSmartRefillUpgradeModal, setShowSmartRefillUpgradeModal] =
    useState(false)

  // State for UserPlans modal
  const [showUserPlansModal, setShowUserPlansModal] = useState(false)
  const [showLegacyPlanUpgrade, setShowLegacyPlanUpgrade] = useState(false)

  // Add state to hold the profile plan before matching
  const [profilePlan, setProfilePlan] = useState(null)

  // Track if initial plan selection has been done
  const [initialPlanSelectionDone, setInitialPlanSelectionDone] =
    useState(false)

  const [cancelInitiateLoader, setCancelInitiateLoader] = useState(false)

  //delreason extra variables
  const [cancelReasonLoader, setCancelReasonLoader] = useState(false)

  //snack messages variables
  const [showSnack, setShowSnack] = useState({
    message: null,
    type: null,
  })

  useEffect(() => {
    let screenWidth = 1000
    if (typeof window !== 'undefined') {
      screenWidth = window.innerWidth
    }
    // //console.log;
    setScreenWidth(screenWidth)
  }, [])

  //code to get plans
  useEffect(() => {
    if (from === 'subaccount') {
      getPlans()
    } else {
      loadPlansForBilling()
    }
    if (selectedUser?.id) {
      getCardsList()
      getPaymentHistory()
      getProfile()
    }
  }, [selectedUser])

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
    const d = localStorage.getItem('User')
    if (d) {
      const Data = JSON.parse(d)
      setAllowSmartRefill(Data.user.smartRefill)
    }
    getProfile()
    getPaymentHistory()
    getCardsList()
  }, [])

  useEffect(() => {}, [selectedPlan])

  useEffect(() => {
    let screenWidth = 1000
    if (typeof window !== 'undefined') {
      screenWidth = window.innerWidth
    }
    setScreenWidth(screenWidth)
    getPlans()
  }, [])

  const getPlans = async () => {
    let plansList = await getUserPlans()
    let userData = getUserLocalData()

    let filteredPlans = []
    if (plansList) {
      // Filter features in each plan to only show features where thumb = true
      if (!isSubaccountTeamMember(userData.user)) {
        filteredPlans = plansList?.map((plan) => ({
          ...plan,
          features:
            plan.features && Array.isArray(plan.features)
              ? plan.features.filter((feature) => feature.thumb === true)
              : [],
        }))

        setPlans(filteredPlans)
      } else {
        // filter the plans and show only first 6 features of each plan
        filteredPlans = plansList?.map((plan) => ({
          ...plan,
          features: plan.features ? plan.features.slice(0, 6) : [],
        }))
        setPlans(filteredPlans)
      }

      let currentPlan = userData?.user?.plan?.planId

      let planFromList = filteredPlans.find((plan) => plan.id === currentPlan)

      const monthly = []
      const quarterly = []
      const yearly = []
      let freePlan = null
      filteredPlans.forEach((plan) => {
        switch (plan.billingCycle) {
          case 'monthly':
            monthly.push(plan)
            if (plan.isFree) {
              freePlan = plan
            }
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

      if (freePlan) {
        quarterly.unshift({ ...freePlan, billingCycle: 'quarterly' })
        yearly.unshift({ ...freePlan, billingCycle: 'yearly' })
      }
      setMonthlyPlans(monthly)
      setQuaterlyPlans(quarterly)
      setYearlyPlans(yearly)
    } else {
      setPlans(plansList)
    }
  }

  // Auto-select billing cycle and plan based on current user plan (only on initial load)
  useEffect(() => {
    // Only run this once when plans are loaded and we haven't done initial selection
    if (initialPlanSelectionDone) {
      return
    }

    if (userLocalData && userLocalData.plan) {
      setTogglePlan(userLocalData.plan.planId)
      setToggleFullPlan(userLocalData.plan)
      setSelectedPlan(userLocalData.plan)
      setCurrentPlan(userLocalData.plan.planId)
    }

    if (
      currentFullPlan &&
      (monthlyPlans.length > 0 ||
        quaterlyPlans.length > 0 ||
        yearlyPlans.length > 0)
    ) {
      const billingCycle = getBillingCycleFromPlan(currentFullPlan)

      // Set the appropriate duration based on billing cycle
      let targetDuration = duration[0] // Default to monthly
      if (billingCycle === 'quarterly') {
        targetDuration = duration[1]
      } else if (billingCycle === 'yearly') {
        targetDuration = duration[2]
      } else {}

      setSelectedDuration(targetDuration)

      // Find and select the matching plan in the target billing cycle
      let currentPlans = []
      if (billingCycle === 'monthly') {
        currentPlans = monthlyPlans
      } else if (billingCycle === 'quarterly') {
        currentPlans = quaterlyPlans
      } else if (billingCycle === 'yearly') {
        currentPlans = yearlyPlans
      }

      const matchingPlan = findMatchingPlan(currentFullPlan, currentPlans)

      if (matchingPlan) {
        setTogglePlan(matchingPlan.id)
        setToggleFullPlan(matchingPlan)
        setSelectedPlan(matchingPlan)
      } else {}

      // Mark that we've done the initial selection
      setInitialPlanSelectionDone(true)
    } else {}
  }, [
    currentFullPlan,
    monthlyPlans,
    quaterlyPlans,
    yearlyPlans,
    initialPlanSelectionDone,
  ])

  // Effect to match profile plan with plans list and set currentFullPlan
  useEffect(() => {
    if (isLagecyPlan(profilePlan)) {
      setCurrentFullPlan(profilePlan)
    } else if (
      profilePlan &&
      (monthlyPlans.length > 0 ||
        quaterlyPlans.length > 0 ||
        yearlyPlans.length > 0)
    ) {
      const matchedPlan = findMatchingPlanFromAllArrays(profilePlan)

      if (matchedPlan) {
        matchedPlan.planId = profilePlan.planId
        setCurrentFullPlan(matchedPlan)
      } else {
        setCurrentFullPlan(profilePlan)
      }
    }
  }, [profilePlan, monthlyPlans, quaterlyPlans, yearlyPlans])

  // Function to load plans for billing context
  const loadPlansForBilling = async () => {
    try {
      const plansData = await PlansService.getCachedPlans(
        'billing_plans',
        'regular',
        'billing',
        false,
      )
      setPlans(plansData)
    } catch (error) {
      console.error('Error loading billing plans:', error)
      setPlans(PlansService.getFallbackPlans('billing', false))
    }
  }

  const getProfile = async () => {
    try {
      const localData = localStorage.getItem('User')
      let response = await AdminGetProfileDetails(selectedUser.id)
      //console.log;
      if (response) {
        let plan = response.plan
        let togglePlan = plan?.planId

        setProfilePlan(plan) // Set profile plan for matching, don't set currentFullPlan directly
        setIsPaused(plan.pauseExpiresAt != null ? true : false)
        setToggleFullPlan(plan)
        let planType = togglePlan
        // if (plan.status == "active") {
        //     if (togglePlan === "Plan30") {
        //         planType = 1;
        //     } else if (togglePlan === "Plan120") {
        //         planType = 2;
        //     } else if (togglePlan === "Plan360") {
        //         planType = 3;
        //     } else if (togglePlan === "Plan720") {
        //         planType = 4;
        //     }
        // }
        setUserLocalData(response)
        setTogglePlan(planType)
        setCurrentPlan(planType)
      }
    } catch (error) {
      // console.error("Error in getprofile api is", error);
    }
  }

  useEffect(() => {
    // //console.log;
  }, [userLocalData])

  //function to close the add card popup
  const handleClose = (data) => {
    if (data) {
      setAddPaymentPopup(false)
      window.dispatchEvent(
        new CustomEvent('hidePlanBar', { detail: { update: true } }),
      )
      window.dispatchEvent(
        new CustomEvent('UpdateProfile', { detail: { update: true } }),
      )
      getCardsList()
    }
  }

  //functiion to get cards list
  const getCardsList = async () => {
    if (!selectedUser?.id) {
      return
    }

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

      const ApiPath = Apis.getCardsList + '?userId=' + selectedUser.id

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
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
    setTogglePlan(item.id)
    setToggleFullPlan(item)

    setSelectedPlan(item)
    // setTogglePlan(prevId => (prevId === id ? null : id));
  }

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {
      let planType = selectedPlan.planType

      //// //console.log;

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

      const ApiData = {
        plan: planType,
        payNow: true,
        userId: selectedUser.id,
      }

      const ApiPath = Apis.subscribePlan
      // //console.log;

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // console.log
        if (response.data.status === true) {
          // Refresh profile and update all state
          await refreshProfileAndState()

          setSuccessSnack(response.data.message)
          setShowDowngradeModal(false)
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
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

      const ApiPath = Apis.getPaymentHistory + '?userId=' + selectedUser.id

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //console.log;
        if (response.data.status === true) {
          setPaymentHistoryData(response.data.data)
        }
      }
    } catch (error) {
      console.error('Error occured in get history api is', error)
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

      const ApiPath = Apis.cancelPlan

      // //console.log;

      //// //console.log;
      // //console.log;

      const ApiData = {
        patanai: 'Sari dunya',
      }

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // //console.log;
          await getProfileDetails()
          setShowConfirmCancelPlanPopup(false)
          setGiftPopup(false)
          setTogglePlan(null)
          setCurrentPlan(null)
          setShowConfirmCancelPlanPopup2(true)
          setSuccessSnack('Your plan was successfully cancelled')
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      // console.error("Eror occured in cancel plan api is", error);
    } finally {
      setCancelPlanLoader(false)
    }
  }

  //function to call redeem api
  const handleRedeemPlan = async () => {
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
        // //console.log;
        if (response2) {
          let togglePlan = response2?.data?.data?.plan?.type
          let planType = null
          if (togglePlan === 'Plan30') {
            planType = 1
          } else if (togglePlan === 'Plan120') {
            planType = 2
          } else if (togglePlan === 'Plan360') {
            planType = 3
          } else if (togglePlan === 'Plan720') {
            planType = 4
          }
          setUserLocalData(response2?.data?.data)
          setGiftPopup(false)
          setTogglePlan(planType)
          setCurrentPlan(planType)
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
        // //console.log;
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
      // console.error("Error occured in api is ", error);
    } finally {
      setCancelReasonLoader(false)
      // //console.log;
    }
  }

  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    return []
  }

  // Function to determine billing cycle from current plan
  const getBillingCycleFromPlan = (plan) => {
    if (!plan) return 'monthly' // Default to monthly for free plans

    // Check if plan has billingCycle property
    if (plan.billingCycle) {
      return plan.billingCycle
    }

    // Check if plan has billing_cycle property (alternative naming)
    if (plan.billing_cycle) {
      return plan.billing_cycle
    }

    // Check plan type for legacy plans
    if (plan.planType) {
      // Map planType to billing cycle based on common patterns
      if (
        plan.planType.toLowerCase().includes('yearly') ||
        plan.planType.toLowerCase().includes('year')
      ) {
        return 'yearly'
      } else if (
        plan.planType.toLowerCase().includes('quarterly') ||
        plan.planType.toLowerCase().includes('quarter')
      ) {
        return 'quarterly'
      } else if (
        plan.planType.toLowerCase().includes('monthly') ||
        plan.planType.toLowerCase().includes('month')
      ) {
        return 'monthly'
      }
    }

    // Check plan name for billing cycle indicators
    if (plan.name) {
      if (
        plan.name.toLowerCase().includes('yearly') ||
        plan.name.toLowerCase().includes('year')
      ) {
        return 'yearly'
      } else if (
        plan.name.toLowerCase().includes('quarterly') ||
        plan.name.toLowerCase().includes('quarter')
      ) {
        return 'quarterly'
      } else if (
        plan.name.toLowerCase().includes('monthly') ||
        plan.name.toLowerCase().includes('month')
      ) {
        return 'monthly'
      }
    }

    // Check if it's a free plan (default to monthly)
    if (plan.isFree || plan.price <= 0) {
      return 'monthly'
    }

    // Default to monthly
    return 'monthly'
  }

  // Function to find matching plan in different billing cycles
  const findMatchingPlan = (plan, plansList) => {
    if (!plan || !plansList) {
      return null
    }

    // First try to match by name
    let matchingPlan = plansList.find((p) => p.name === plan.name)
    if (matchingPlan) {
      return matchingPlan
    }

    // Then try to match by planType
    if (plan.planType) {
      matchingPlan = plansList.find((p) => p.planType === plan.planType)
      if (matchingPlan) {
        return matchingPlan
      }
    }

    // For free plans, find the free plan in the list
    if (plan.price <= 0 || plan.isFree) {
      matchingPlan = plansList.find((p) => p.isFree || p.price <= 0)
      if (matchingPlan) {
        return matchingPlan
      }
    }

    // Try to match by similar characteristics (same tier but different billing)
    if (plan.name) {
      // Look for plans with similar names but different billing cycles
      matchingPlan = plansList.find((p) => {
        // Check if the plan names are similar (e.g., "Starter" matches "Starter")
        const planNameWords = plan.name.toLowerCase().split(' ')
        const pNameWords = p.name.toLowerCase().split(' ')
        return planNameWords.some((word) => pNameWords.includes(word))
      })
      if (matchingPlan) {
        return matchingPlan
      }
    }

    return null
  }

  // Helper function to find matching plan from all plan arrays (monthly, quarterly, yearly)
  const findMatchingPlanFromAllArrays = (profilePlan) => {
    if (!profilePlan) return null

    // Combine all plan arrays
    const allPlans = [...monthlyPlans, ...quaterlyPlans, ...yearlyPlans]

    if (allPlans.length === 0) {
      return null
    }

    // Try to find by planId first (most reliable)
    if (profilePlan.planId) {
      const matchByPlanId = allPlans.find(
        (plan) => plan.id === profilePlan.planId,
      )
      if (matchByPlanId) {
        return matchByPlanId
      }
    }

    // Try to find by planType
    if (profilePlan.type) {
      const matchByType = allPlans.find(
        (plan) => plan.planType === profilePlan.type,
      )
      if (matchByType) {
        return matchByType
      }
    }

    // Try to find by title/name
    if (profilePlan.title) {
      const matchByTitle = allPlans.find(
        (plan) => plan.name === profilePlan.title,
      )
      if (matchByTitle) {
        return matchByTitle
      }
    }

    return null
  }

  const handleCancelClick = async () => {
    setCancelInitiateLoader(true)
    await initiateCancellation(selectedUser.id)
    setShowCancelPoup(true)
    setCancelInitiateLoader(false)
  }

  const handleUpgradeClick = () => {
    if (currentPlan && selectedPlan.name === 'Free') {
      // if user try to downgrade on free plan
      setShowCancelPoup(true)
    } else {
      const planComparison = comparePlans(currentFullPlan, selectedPlan)

      if (planComparison === 'upgrade') {
        setShowUpgradeModal(true)
      } else if (planComparison === 'downgrade') {
        // Set title based on target plan
        setDowngradeTitle(`Confirm ${selectedPlan?.name} Plan`)

        const featuresToLose = getFeaturesToLose(currentFullPlan, selectedPlan)
        setDowngradeFeatures(featuresToLose)
        if (featuresToLose.length > 0) {
          setShowDowngradeModal(true)
        } else {
          setShowUpgradeModal(true)
        }
      }
      // If 'same', do nothing (user selected their current plan in different billing cycle)
    }
  }

  // Function to check if user is on free plan
  const isFreePlan = () => {
    return (
      currentFullPlan && (currentFullPlan.price === 0 || currentFullPlan.isFree)
    )
  }

  // Helper function to compare plans based on monthly price
  // Returns: 'upgrade' | 'downgrade' | 'same'
  const comparePlans = (currentPlan, targetPlan) => {
    if (!currentPlan || !targetPlan) {
      return null // Changed from 'same' to null to indicate loading state
    }

    // Get monthly prices (discountPrice is already per-month for all billing cycles)
    const currentPrice = currentPlan.discountPrice || currentPlan.price || 0
    const targetPrice = targetPlan.discountPrice || targetPlan.price || 0

    // If same plan (by ID), it's the same
    if (
      currentPlan.id === targetPlan.id ||
      currentPlan.planId === targetPlan.id
    ) {
      return 'same'
    }

    // If target is free plan and current is paid, it's a downgrade
    if ((targetPlan.isFree || targetPrice === 0) && currentPrice > 0) {
      return 'downgrade'
    }

    // If current is free and target is paid, it's an upgrade
    if ((currentPlan.isFree || currentPrice === 0) && targetPrice > 0) {
      return 'upgrade'
    }

    // Get billing cycle order (monthly < quarterly < yearly)
    const billingCycleOrder = {
      monthly: 1,
      quarterly: 2,
      yearly: 3,
    }

    const currentBillingOrder = billingCycleOrder[currentPlan.billingCycle] || 1
    const targetBillingOrder = billingCycleOrder[targetPlan.billingCycle] || 1

    // If same name/tier but different billing cycle
    if (currentPlan.name === targetPlan.name) {
      // Longer billing cycle is considered an upgrade (more commitment)
      if (targetBillingOrder > currentBillingOrder) {
        return 'upgrade'
      } else if (targetBillingOrder < currentBillingOrder) {
        return 'downgrade'
      } else {
        return 'same'
      }
    }

    // Compare prices
    if (targetPrice > currentPrice) {
      return 'upgrade'
    } else if (targetPrice < currentPrice) {
      return 'downgrade'
    } else {
      // Same price, different plans - consider billing cycle
      if (targetBillingOrder > currentBillingOrder) {
        return 'upgrade'
      } else if (targetBillingOrder < currentBillingOrder) {
        return 'downgrade'
      } else {
        return 'same'
      }
    }
  }

  // Handler for smart refill disabled click
  const handleSmartRefillDisabledClick = () => {
    setShowSmartRefillUpgradeModal(true)
  }

  // Handler for smart refill upgrade modal
  const handleSmartRefillUpgrade = async () => {
    setShowSmartRefillUpgradeModal(false)
    // Refresh profile after upgrade
    await refreshProfileAndState()
  }

  // Function to refresh profile and update all related state
  const refreshProfileAndState = async () => {
    try {
      const response = await AdminGetProfileDetails(selectedUser.id)

      if (response) {
        const profileData = response
        const plan = profileData.plan

        // Update user local data
        setUserLocalData(profileData)

        // Update plan-related state
        setProfilePlan(plan) // Set profile plan for matching, currentFullPlan will be set by useEffect
        setToggleFullPlan(plan)
        setCurrentPlan(plan?.planId)
        setTogglePlan(plan?.planId)

        // Update pause status
        setIsPaused(plan?.pauseExpiresAt != null ? true : false)

        // Dispatch custom event to notify parent components (like AgencySubacount) to refresh selectedUser
        window.dispatchEvent(
          new CustomEvent('refreshSelectedUser', {
            detail: { userId: selectedUser.id, userData: profileData },
          }),
        )

        // Store updated user data in localStorage for other screens to access
        localStorage.setItem('selectedSubAccount', JSON.stringify(profileData))

        return true
      }
    } catch (error) {
      console.error('❌ [NEW-BILLING] Error refreshing profile:', error)
    }
    return false
  }

  const handleCloseCancelation = async () => {
    setShowCancelPoup(false)
    // Refresh profile after cancellation
    await refreshProfileAndState()
  }

  // Function to determine button text and action
  const getButtonConfig = () => {
    // If no plan is selected, show loading or disabled state
    if (!selectedPlan) {
      return {
        text: 'Cancel Subscription',
        action: () => handleCancelClick(),
        isLoading: cancelInitiateLoader,
        className:
          'w-full text-base font-normal h-[50px] flex flex-col items-center justify-center text-black rounded-lg border',
        style: {},
      }
    }

    // Compare plans based on price
    const planComparison = comparePlans(currentFullPlan, selectedPlan)

    // If still loading (currentFullPlan not ready), don't show any button
    if (planComparison === null) {
      return null // Will hide the button section while loading
    }

    // If current plan is same as selected plan (by ID), show Cancel
    if (currentPlan === togglePlan) {
      return {
        text: 'Cancel Subscription',
        action: () => handleCancelClick(),
        isLoading: cancelInitiateLoader,
        className:
          'w-full text-base font-normal h-[50px] flex flex-col items-center justify-center text-black rounded-lg border',
        style: {},
      }
    }

    // If it's the same plan tier (shouldn't happen with proper selection logic)
    if (planComparison === 'same') {
      return {
        text: 'Cancel Subscription',
        action: () => handleCancelClick(),
        isLoading: cancelInitiateLoader,
        className:
          'w-full text-base font-normal h-[50px] flex flex-col items-center justify-center text-black rounded-lg border',
        style: {},
      }
    }

    // If it's an upgrade, show Upgrade button
    if (planComparison === 'upgrade') {
      return {
        text: 'Upgrade Plan',
        action: () => handleUpgradeClick(),
        isLoading: subscribePlanLoader,
        className: 'rounded-xl w-full',
        style: {
          height: '50px',
          fontSize: 16,
          fontWeight: '700',
          flexShrink: 0,
          backgroundColor: '#7902DF',
          color: '#ffffff',
        },
      }
    }

    // Otherwise it's a downgrade
    return {
      text: 'Downgrade Plan',
      action: () => handleUpgradeClick(),
      isLoading: subscribePlanLoader,
      className: 'rounded-xl w-full',
      style: {
        height: '50px',
        fontSize: 16,
        fontWeight: '700',
        flexShrink: 0,
        backgroundColor: '#7902DF',
        color: '#ffffff',
      },
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
      <AgentSelectSnackMessage
        isVisible={showSnack.message == null ? false : true}
        hide={() => {
          setShowSnack({
            message: null,
            type: null,
          })
        }}
        message={showSnack.message}
        type={showSnack.type || SnackbarTypes.Error}
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

        {/*
          <button
            className=""
            onClick={() => {
              setAddPaymentPopup(true);
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: "#7902DF",
                textDecorationLine: "underline",
              }}
            >
              Add New Card
            </div>
          </button>
        */}
      </div>
      {/* Payment Cards Section */}
      <div className="w-full mt-6">
        <div
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#000',
            marginBottom: 16,
          }}
        >
          Payment Methods
        </div>
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
                  marginTop: 10,
                  flexShrink: 0,
                }}
              >
                {cards.map((item) => (
                  <div className="flex-shrink-0 w-5/12" key={item.id}>
                    <div
                      className="flex items-start justify-between w-full p-4 border rounded-lg"
                      style={{
                        backgroundColor:
                          item.isDefault || selectedCard?.id === item.id
                            ? '#4011FA05'
                            : 'transparent',
                        borderColor:
                          item.isDefault || selectedCard?.id === item.id
                            ? '#7902DF'
                            : '#15151510',
                        cursor: 'default', // Read-only for admin
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-5 h-5 rounded-full border border-[#7902DF] flex items-center justify-center`}
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
                            {item.isDefault && (
                              <div
                                className="flex px-2 py-1 rounded-full bg-purple text-white text-[10]"
                                style={{ fontSize: 11, fontWeight: '500' }}
                              >
                                Default
                              </div>
                            )}
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
      <SmartRefillCard
        selectedUser={selectedUser}
        isDisabled={false}
        onDisabledClick={handleSmartRefillDisabledClick}
        isFreePlan={isFreePlan()}
      />
      {/* code for current plans available */}
      <div className="w-full flex flex-row items-center justify-end">
        <div className="flex flex-col items-end  w-full mt-4">
          <DurationView
            duration={duration}
            selectedDuration={selectedDuration}
            handleDurationChange={(item) => {
              setSelectedDuration(item)

              // Auto-select matching plan when switching billing cycles
              if (currentFullPlan) {
                let targetPlans = []
                if (item.id === 1) {
                  targetPlans = monthlyPlans
                } else if (item.id === 2) {
                  targetPlans = quaterlyPlans
                } else if (item.id === 3) {
                  targetPlans = yearlyPlans
                }

                const matchingPlan = findMatchingPlan(
                  currentFullPlan,
                  targetPlans,
                )
                if (matchingPlan) {
                  setTogglePlan(matchingPlan.id)
                  setToggleFullPlan(matchingPlan)
                  setSelectedPlan(matchingPlan)
                }
              }
            }}
          />
        </div>
      </div>
      <div
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
        {getCurrentPlans()?.map((item, index) => (
          <div
            key={item.id}
            className="mt-4 outline-none flex-shrink-0 cursor-pointer"
            style={{ width: '250px' }} // Fixed width for consistent card sizes
            onClick={(e) => {
              // Only handle click if it's not from the View Details button
              if (!e.target.closest('.view-details-btn')) {
                handleTogglePlanClick(item)
              }
            }}
          >
            <div
              className="px-4 py-4 pb-4 flex flex-col gap-3 h-full"
              style={{
                ...styles.pricingBox,
                border:
                  item.id === togglePlan
                    ? '2px solid #7902DF'
                    : '1px solid #15151520',
                backgroundColor: item.id === togglePlan ? '#402FFF05' : '',
                minHeight: '320px', // Further increased height for better feature accommodation
              }}
            >
              <div className="flex flex-col items-start h-full justify-between">
                <div className="w-full">
                  <div className="flex flex-row items-center w-full justify-between mb-3">
                    {item.id === togglePlan ? (
                      <Image
                        src={'/svgIcons/checkMark.svg'}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    ) : (
                      <Image
                        src={'/svgIcons/unCheck.svg'}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    )}

                    {isPaused && item.id === currentPlan ? (
                      <div
                        className="flex px-2 py-1 bg-[#EAB308] rounded-full text-white"
                        style={{
                          fontSize: 11.6,
                          fontWeight: '500',
                          width: 'fit-content',
                        }}
                      >
                        Paused
                      </div>
                    ) : (
                      <div>
                        {item.id === currentPlan && (
                          <div
                            style={{
                              fontSize: 11.6,
                              fontWeight: '500',
                              width: 'fit-content',
                            }}
                          >
                            Renews on:{' '}
                            {reduxUser?.nextChargeDate &&
                              moment(userLocalData?.nextChargeDate).format(
                                'MM/DD/YYYY',
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row items-center justify-between w-full mb-4">
                    <div className="text-[16px] font-semibold">
                      {item.name || item.title}
                    </div>
                    <div className="text-[16px] font-semibold">
                      {item.mints || item.minutes} AI credits
                    </div>
                  </div>

                  <div className="text-xl font-bold text-left mb-2">
                    $
                    {formatFractional2(
                      item.discountPrice || item.discountedPrice || 0,
                    ) || '0'}
                    /mo
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
                  {item.features && item.features.length > 0 && (
                    <div className="mt-6 flex-1">
                      <div className="flex flex-col gap-3">
                        {item.features?.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex flex-row items-start gap-1"
                          >
                            <Image
                              src="/svgIcons/selectedTickBtn.svg"
                              height={16}
                              width={16}
                              alt="✓"
                              className="mt-0.5 flex-shrink-0"
                            />
                            <div className="text-sm font-normal text-gray-700 leading-relaxed flex-1 text-start">
                              {
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
                                            fontSize: '14px',
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
                                          fontSize: 12,
                                          fontWeight: '600',
                                          color: '#000000',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <Image
                                          src="/agencyIcons/InfoIcon.jpg"
                                          alt="info"
                                          width={16}
                                          height={16}
                                          className="cursor-pointer rounded-full"
                                        />
                                      </div>
                                    </Tooltip>
                                  )}
                                </div>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-row items-center justify-between w-full mt-4">
                  {item.id === currentPlan && (
                    <div
                      className="flex px-2 py-1 bg-purple rounded-full text-white"
                      style={{
                        fontSize: 9,
                        fontWeight: '600',
                        width: 'fit-content',
                      }}
                    >
                      Current Plan
                    </div>
                  )}

                  <div
                    className="view-details-btn ml-auto flex px-2 py-1 rounded-full cursor-pointer hover:underline"
                    onClick={(e) => {
                      setShowUserPlansModal(true)
                    }}
                    style={{
                      color: '#7902DF',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: 10,
                      width: 'fit-content',
                    }}
                  >
                    View Details
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex flex-row items-center justify-center gap-3 mt-8">
        {(() => {
          const buttonConfig = getButtonConfig()

          // If buttonConfig is null (still loading), show loading spinner
          if (buttonConfig === null) {
            return null
          }

          // Only show button if user has a paid plan or if they have selected a different plan
          // Show cancel button if user is on paid plan and selected their own plan
          if (
            currentFullPlan?.name === 'Free' &&
            selectedPlan?.name === 'Free'
          ) {
            return null
          }

          return (
            <div className="w-1/2">
              {buttonConfig.isLoading ? (
                <div className="w-full flex flex-col items-center justify-center h-[50px]">
                  <CircularProgress size={25} />
                </div>
              ) : (
                <button
                  className={buttonConfig.className}
                  onClick={buttonConfig.action}
                  style={buttonConfig.style}
                >
                  {buttonConfig.text}
                </button>
              )}
            </div>
          )
        })()}
      </div>
      <LeggacyPlanUpgrade
        open={showLegacyPlanUpgrade}
        handleClose={() => setShowLegacyPlanUpgrade(false)}
        plan={selectedPlan}
        handleContinue={() => {
          setShowLegacyPlanUpgrade(false)
          handleSubscribePlan()
          refreshProfileAndState()
        }}
        reduxUser={reduxUser}
      />
      <DowngradePlanPopup
        open={showDowngradeModal}
        handleClose={() => setShowDowngradeModal(false)}
        onConfirm={() => {
          handleSubscribePlan()
        }}
        subscribePlanLoader={subscribePlanLoader}
        downgradeTitle={downgradeTitle}
        features={downgradeFeatures}
      />
      <CancelPlanAnimation
        showModal={showCancelPopup}
        handleClose={handleCloseCancelation}
        userLocalData={userLocalData}
        setShowSnak={setShowSnack}
        isPaused={isPaused}
      />
      <Elements stripe={stripePromise}>
        <UpgradePlan
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          open={showUpgradeModal}
          handleClose={async (upgradeResult) => {
            setShowUpgradeModal(false)

            // If upgrade was successful, refresh profile and state
            if (upgradeResult) {
              await refreshProfileAndState()
            }
          }}
          plan={selectedPlan}
          currentFullPlan={currentFullPlan}
          selectedUser={selectedUser}
        />
      </Elements>
      {/* Smart Refill Upgrade Modal */}
      <UpgradeModal
        title="Enable Smart Refill"
        subTitle="Avoid call interruptions when making calls, ensure your AI always has minutes."
        buttonTitle="No Thanks. Continue on free plan"
        open={showSmartRefillUpgradeModal}
        handleClose={() => setShowSmartRefillUpgradeModal(false)}
        onUpgradeSuccess={handleSmartRefillUpgrade}
        functionality={'smartRefill'}
      />
      {/* UserPlans Modal */}
      {showUserPlansModal && (
        <Modal
          open={showUserPlansModal}
          onClose={() => {
            setShowUserPlansModal(false)
          }}
          closeAfterTransition
          BackdropProps={{
            timeout: 100,
            sx: {
              backgroundColor: '#00000020',
              backdropFilter: 'blur(15px)',
            },
          }}
        >
          <Box
            className="flex justify-center items-center border-none"
            sx={{
              bgcolor: 'transparent',
              outline: 'none',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              className="flex flex-col bg-white rounded-lg overflow-hidden relative"
              style={{ width: '90%', height: '90%' }}
            >
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
                    setShowUserPlansModal(false)
                  }}
                />
              </div>
              <div
                className={`w-full h-[88%] overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-scrollBarPurple`}
              >
                <Elements stripe={stripePromise}>
                  <UserPlans
                    handleContinue={() => {
                      setShowUserPlansModal(false)
                      refreshProfileAndState()
                    }}
                    handleBack={() => setShowUserPlansModal(false)}
                    from="billing-modal"
                    onPlanSelected={(plan) => {
                      // Close UserPlans modal
                      setShowUserPlansModal(false)
                      // Set the selected plan
                      setSelectedPlan(plan)
                      setTogglePlan(plan.id)
                      setToggleFullPlan(plan)
                      // Open Upgrade modal
                      setShowUpgradeModal(true)
                    }}
                    disAblePlans={true}
                    hideProgressBar={true}
                    isFrom={
                      isSubaccountTeamMember(userLocalData)
                        ? 'SubAccount'
                        : 'User'
                    }
                  />
                </Elements>
              </div>
            </div>
          </Box>
        </Modal>
      )}
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
                  togglePlan={''}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
      <LeggacyPlanUpgrade
        open={showLegacyPlanUpgrade}
        handleClose={() => setShowLegacyPlanUpgrade(false)}
        plan={selectedPlan}
        handleContinue={() => {
          setShowLegacyPlanUpgrade(false)
          handleSubscribePlan()
          refreshProfileAndState()
        }}
        reduxUser={userLocalData}
      />
      <DowngradePlanPopup
        open={showDowngradeModal}
        handleClose={() => setShowDowngradeModal(false)}
        onConfirm={() => {
          handleSubscribePlan()
        }}
        subscribePlanLoader={subscribePlanLoader}
        downgradeTitle={downgradeTitle}
        features={downgradeFeatures}
      />
      <CancelPlanAnimation
        showModal={showCancelPopup}
        handleClose={handleCloseCancelation}
        userLocalData={userLocalData}
        setShowSnak={setShowSnack}
        isPaused={isPaused}
        selectedUser={selectedUser}
      />
    </div>
  );
}

export default AdminBilling
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
    borderTop: '50px solid #7902DF', // Increased height again for more padding
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
    color: '#7902DF65',
    fontSize: 18,
    fontWeight: '600',
  },
  discountedPrice: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: '10px',
  },
}
