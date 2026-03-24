import { Box, CircularProgress, Modal, Tooltip } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import ProgressBar from '@/components/onboarding/ProgressBar'
import {
  isSubaccountTeamMember,
  isTeamMember,
} from '@/constants/teamTypes/TeamTypes'
import { useUser } from '@/hooks/redux-hooks'

import { formatDecimalValue } from '../agency/agencyServices/CheckAgencyData'
import { formatFractional2 } from '../agency/plan/AgencyUtilities'
import LoaderAnimation from '../animations/LoaderAnimation'
import Apis from '../apis/Apis'
import getProfileDetails from '../apis/GetProfile'
import AdminGetProfileDetails from '../admin/AdminGetProfileDetails'
import AgencyAddCard from '../createagent/addpayment/AgencyAddCard'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import FeatureLine from './FeatureLine'
import FitText from './FitText'
import {
  getDisplayFeaturesForPlan,
  getFeatureDisplayText,
  getInheritedPlanTitle,
  reorderPlanFeatures,
} from '../plan/PlansUtilities'
import UpgradePlan from './UpgradePlan'
import UserAddCard from './UserAddCardModal'
import { getSubscribeApiConfig, getUserLocalData, getUserPlans } from './UserPlanServices'
import YearlyPlanModal from './YearlyPlanModal'
import AppLogo from '@/components/common/AppLogo'
import { logout } from '@/utilities/UserUtility'
import { renderBrandedIcon } from '@/utilities/iconMasking'

const FIGMA_BORDER = 'rgba(21,21,21,0.1)'

function BoltIcon({ className = '' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserPlans({
  handleContinue,
  handleBack,
  from = '',
  isFrom,
  subPlanLoader,
  onPlanSelected,
  selectedUser,
  disAblePlans = false,
  hideProgressBar = false,
}) {
  const router = useRouter()

  const stripePromise = getStripe()

  const { user: reduxUser, setUser: setReduxUser } = useUser()

  const [duration, setDuration] = useState([
    {
      id: 1,
      title: 'Monthly',
      save: '',
    },
    {
      id: 2,
      title: 'Quarterly',
      save: '20%',
    },
    {
      id: 3,
      title: 'Yearly',
      save: '30%',
    },
  ])

  const [selectedDuration, setSelectedDuration] = useState(duration[0])

  const [monthlyPlans, setMonthlyPlans] = useState([])
  const [quaterlyPlans, setQuaterlyPlans] = useState([])
  const [yearlyPlans, setYearlyPlans] = useState([])

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [hoverPlan, setHoverPlan] = useState(null)
  const [togglePlan, setTogglePlan] = useState(null)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null)
  const [addPaymentPopUp, setAddPaymentPopUp] = useState(false)

  const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)
  const [showYearlyPlanModal, setShowYearlyPlanModal] = useState(false)
  const [selectedMonthlyPlan, setSelectedMonthlyPlan] = useState(null)
  const [subscribeLoader, setSubscribeLoader] = useState(null)

  const [credentialsErr, setCredentialsErr] = useState(false)
  const [addCardFailure, setAddCardFailure] = useState(false)
  const [addCardSuccess, setAddCardSuccess] = useState(false)
  const [addCardErrtxt, setAddCardErrtxt] = useState('')
  const [routedFrom, setRoutedFrom] = useState(isFrom)

  const [showRoutingLoader, setShowRoutingLoader] = useState(false)
  const [shouldAutoSubscribe, setShouldAutoSubscribe] = useState(false)
  const [gridAnimationId, setGridAnimationId] = useState(0)

  // Helper function to check if user has payment methods
  const hasPaymentMethod = () => {
    try {
      // First check localStorage (primary source)
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        const cards = userData?.data?.user?.cards
        if (Array.isArray(cards) && cards.length > 0) {
          return true
        }
      }
      // Fallback to Redux user data (check both reduxUser.cards and reduxUser.user.cards)
      if (
        reduxUser?.cards &&
        Array.isArray(reduxUser.cards) &&
        reduxUser.cards.length > 0
      ) {
        return true
      }
      if (
        reduxUser?.user?.cards &&
        Array.isArray(reduxUser.user.cards) &&
        reduxUser.user.cards.length > 0
      ) {
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking payment methods:', error)
      return false
    }
  }

  useEffect(() => {
    // Only auto-continue if user has a plan AND we're not in modal view (billing-modal)
    if (
      reduxUser?.plan &&
      reduxUser?.availableSeconds > 120 &&
      from !== 'billing-modal'
    ) {
      if (handleContinue) {
        handleContinue()
      }
    }

    // Determine user type - use prop if provided, otherwise detect from user data
    let detectedFrom = isFrom
    if (!detectedFrom) {
      let data = localStorage.getItem('User')
      if (data) {
        let user = JSON.parse(data)
        const userRole = user?.user?.userRole

        // Only set to SubAccount if user is actually a subaccount
        if (userRole === 'AgencySubAccount') {
          detectedFrom = 'SubAccount'
        } else if (isTeamMember(user.user)) {
          // For team members, check their team type
          if (isSubaccountTeamMember(user.user)) {
            detectedFrom = 'SubAccount'
          } else {
            // Team member but not subaccount - treat as normal user
            detectedFrom = 'User'
          }
        } else if (userRole === 'Agency') {
          detectedFrom = 'Agency'
        } else {
          // Default to User for normal agents
          detectedFrom = 'User'
        }
      } else {
        // No user data, default to User
        detectedFrom = 'User'
      }
    }
    setRoutedFrom(detectedFrom)
    // Call getPlans with the detected user type
    getPlans(detectedFrom)
  }, [])

  useEffect(() => {
    // Bump animation key whenever billing duration changes
    setGridAnimationId((prev) => prev + 1)
  }, [selectedDuration.id])

  const handleClose = async (data) => {
    if (data) {
      // Check if this is a subscription completion (from AgencyAddCard)
      const isSubscriptionComplete = data.subscriptionHandled === true || data.status === true

      // Refresh user data to get updated cards/plan
      await refreshUserData()

      // If we should auto-subscribe after adding card, do it now
      if (shouldAutoSubscribe && selectedPlan && !isSubscriptionComplete) {
        setAddPaymentPopUp(false)
        setShouldAutoSubscribe(false)
        await handleSubscribePlan()
        return
      }

      // Close the payment modal
      setAddPaymentPopUp(false)
      setShouldAutoSubscribe(false)

      // If subscription was completed, handle routing
      if (isSubscriptionComplete) {
        // If from Agency, route to dashboard
        if (isFrom == 'Agency' || routedFrom == 'Agency') {
          router.push('/agency/dashboard')
          //show routing loader animation
          setShowRoutingLoader(true)
          setTimeout(() => {
            setShowRoutingLoader(false)
          }, 3000)
        } else if (from === 'dashboard') {
          // If from dashboard, route back to dashboard
          router.push('/dashboard')
        } else {
          // Check if user is on mobile (for normal users and subaccounts)
          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
          const SM_SCREEN_SIZE = 640
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
          )

          // For mobile normal users and subaccounts, redirect to continue to desktop screen
          if ((screenWidth <= SM_SCREEN_SIZE || isMobileDevice) &&
            (isFrom === 'SubAccount' || routedFrom === 'SubAccount' || reduxUser?.userRole === 'AgencySubAccount' || !isFrom || isFrom === 'User')) {
            router.push('/createagent/desktop')
          } else {
            // Otherwise, continue to next step (for createagent flow)
            if (handleContinue) {
              handleContinue()
            }
          }
        }
        return
      }

      // For card addition (not subscription), handle routing
      // const userProfile = await getProfileDetails();
      if (isFrom == 'Agency' || routedFrom == 'Agency') {
        router.push('/agency/dashboard')
        //show routing loader animation
        setShowRoutingLoader(true)
        setTimeout(() => {
          setShowRoutingLoader(false)
        }, 3000)
      } else {
        if (handleContinue) {
          handleContinue()
        }
      }
      // handleSubscribePlan()
    }
  }

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        // Update Redux with fresh data
        setReduxUser({
          token: localData.token,
          user: freshUserData,
        })

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [subscribe plan] Error refreshing user data:', error)
      return false
    }
  }

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {
      // Check if plan is free
      const isFreePlan =
        selectedPlan &&
        (selectedPlan.discountedPrice === 0 ||
          selectedPlan.discountedPrice === null)

      // For paid plans, check if payment method exists
      if (!isFreePlan) {
        const hasPM = hasPaymentMethod()
        if (!hasPM) {
          setShouldAutoSubscribe(true)
          setAddPaymentPopUp(true)
          setSubscribeLoader(null)
          return
        }
      }

      let planType = selectedPlan?.planType

      setSubscribeLoader(selectedPlan?.id)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      const loggedInUser = getUserLocalData() || reduxUser?.user || reduxUser
      const { apiPath: ApiPath, usePlanId, omitContentType } = getSubscribeApiConfig(loggedInUser, {
        from: isFrom || from,
        selectedUser,
      })

      let ApiData = usePlanId
        ? { planId: selectedPlan?.id || hoverPlan?.id }
        : { plan: selectedPlan?.id }
      if (selectedUser && usePlanId) {
        ApiData.userId = selectedUser.id
      }

      const headers = {
        Authorization: 'Bearer ' + AuthToken,
      }
      if (!omitContentType) {
        headers['Content-Type'] = 'application/json'
      }
      const response = await axios.post(ApiPath, ApiData, {
        headers,
      })

      if (response) {
        if (response.data.status === true) {
          await refreshUserData()

          // If subscribing for a subaccount (agency/admin context), refresh the subaccount's profile
          if (selectedUser && (isFrom === 'SubAccount' || reduxUser?.userRole === 'Agency')) {
            try {
              const refreshedUserData = await AdminGetProfileDetails(selectedUser.id)

              if (refreshedUserData) {
                // Dispatch custom event to notify parent components
                window.dispatchEvent(
                  new CustomEvent('refreshSelectedUser', {
                    detail: { userId: selectedUser.id, userData: refreshedUserData },
                  }),
                )

                // Store updated user data in localStorage for other screens
                localStorage.setItem('selectedSubAccount', JSON.stringify(refreshedUserData))
              }
            } catch (error) {
              console.error('Error refreshing subaccount profile after subscription:', error)
            }
          }

          // Close payment modal if it's open
          setAddPaymentPopUp(false)
          setShouldAutoSubscribe(false)

          // Determine redirect path
          let redirectPath = null

          if (reduxUser?.userRole === 'Agency') {
            redirectPath = '/agency/dashboard'
          } else if (from === 'dashboard' || isFrom === 'SubAccount') {
            redirectPath = '/dashboard'
          } else {
            // Check if user is on mobile (for normal users and subaccounts)
            const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
            const SM_SCREEN_SIZE = 640
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              typeof navigator !== 'undefined' ? navigator.userAgent : ''
            )

            // For mobile normal users and subaccounts, redirect to continue to desktop screen
            if ((screenWidth <= SM_SCREEN_SIZE || isMobileDevice) &&
              (isFrom === 'SubAccount' || reduxUser?.userRole === 'AgencySubAccount' || !isFrom || isFrom === 'User')) {
              redirectPath = '/createagent/desktop'
            } else {
              if (handleContinue) {
                handleContinue()
                return // Exit early if handleContinue is called
              }
            }
          }

          // Use window.location.href for hard redirect to ensure clean page reload
          // This prevents DOM cleanup errors during navigation
          if (redirectPath) {
            window.location.href = redirectPath
            return
          }
        } else if (response.data.status === false) {
          // Handle subscription failure - check if it's due to missing payment method
          const errorMessage = response.data.message || 'Subscription failed. Please try again.'

          if (response.data.message === 'No payment method added' || response.data.message?.toLowerCase().includes('payment')) {
            setShouldAutoSubscribe(true)
            setAddPaymentPopUp(true)
          } else {
            // Display error message for other types of failures (e.g., trial access failed)
            setAddCardFailure(true)
            setAddCardErrtxt(errorMessage)
          }
        }
      }
    } catch (error) {
      console.error('Error occured in api is:', error)
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'An error occurred while subscribing to the plan. Please try again.'

      // If error is related to payment, show payment modal
      if (error?.response?.data?.message?.toLowerCase().includes('payment') ||
        error?.response?.data?.message?.toLowerCase().includes('card')) {
        setShouldAutoSubscribe(true)
        setAddPaymentPopUp(true)
      } else {
        // Display error message for other types of failures
        setAddCardFailure(true)
        setAddCardErrtxt(errorMessage)
      }
    } finally {
      setSubscribeLoader(null)
    }
  }

  const getPlans = async (overrideFrom = null) => {
    const fromValue = overrideFrom || isFrom || routedFrom
    let plansList = await getUserPlans(fromValue, selectedUser)
    if (plansList) {
      // Filter features in each plan to only show features where thumb = false
      let filteredPlans = []

      if (fromValue !== 'SubAccount') {
        filteredPlans = plansList?.map((plan) => ({
          ...plan,
          features:
            plan.features && Array.isArray(plan.features)
              ? plan.features.filter((feature) => !feature.thumb)
              : [],
        }))
      }
      if (fromValue === 'Agency') {
        filteredPlans = plansList?.map((plan) => ({
          ...plan,
          features:
            plan.features && Array.isArray(plan.features) ? plan.features : [], //.filter(feature => feature.thumb === true) : []
        }))
      }
      const monthly = []
      const quarterly = []
      const yearly = []
      let freePlan = null
      // Handle both SubAccount plans (with duration) and normal plans (with billingCycle)
      let plansToProcess = fromValue === 'SubAccount' ? plansList : filteredPlans
      plansToProcess = plansToProcess?.monthlyPlans || plansToProcess
      plansToProcess?.forEach((plan) => {
        // SubAccount plans use 'duration', normal plans use 'billingCycle'
        const cycle = plan.duration || plan.billingCycle
        switch (cycle) {
          case 'monthly':
            monthly.push(plan)
            if (plan.discountedPrice == 0) {
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

      if (fromValue === 'SubAccount') {
        if (
          monthly.length > 0 &&
          quarterly.length === 0 &&
          yearly.length === 0
        ) {
          setSelectedDuration({ id: 1, title: 'Monthly' })
        } else {
          if (monthly.length > 0) {
            setSelectedDuration({ id: 1, title: 'Monthly' })
          }
          // Check inside quarterly plans
          else if (quarterly.length > 0) {
            setSelectedDuration({ id: 2, title: 'Quarterly' })
          }
          // Check inside yearly plans
          else if (yearly.length > 0) {
            setSelectedDuration({ id: 3, title: 'Yearly' })
          }
        }
      }

      const emptyDurations = [monthly, quarterly, yearly].filter(
        (arr) => arr.length === 0,
      ).length
      if (emptyDurations >= 2) {
        setDuration([])
      } else {
        if (monthly.length === 0) {
          setDuration((prev) => prev.filter((item) => item.id !== 1))
        }
        if (quarterly.length === 0) {
          setDuration((prev) => prev.filter((item) => item.id !== 2))
        }
        if (yearly.length === 0) {
          setDuration((prev) => prev.filter((item) => item.id !== 3))
        }
      }

      setMonthlyPlans(monthly)
      setQuaterlyPlans(quarterly)
      setYearlyPlans(yearly)
    }
  }
  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    return []
  }

  const checkWindowInnerWidth = () => {
    console.log("Window inner width is", getCurrentPlans()?.length * 300, window.innerWidth)
    if (getCurrentPlans()?.length <= 3) {
      return getCurrentPlans()?.length * 300 > window.innerWidth
        ? 'start'
        : 'center'
    } else {
      return 'start'
    }
  }

  // Check if a plan is the current user's plan
  const isCurrentPlan = (plan) => {
    if (!reduxUser?.plan || !plan) {
      return false
    }
    const userPlan = reduxUser.plan

    // First, try to match by planId (most reliable)
    // Prioritize planId over id because id might be a subscription/user_plan ID, not the actual plan ID
    // Compare userPlan.planId with plan.id (the plan's database ID)
    const userPlanPlanId = userPlan.planId ?? userPlan.id
    const planId = plan.id ?? plan.planId

    // Only match by ID if both IDs exist and are truthy
    if (userPlanPlanId != null && planId != null) {
      // Convert to strings for consistent comparison (handles number vs string)
      const userPlanPlanIdStr = String(userPlanPlanId)
      const planIdStr = String(planId)

      if (userPlanPlanIdStr === planIdStr) {
        return true
      }
    } else { }

    // Fallback: Match by name and billing cycle ONLY if both plan IDs are missing
    // This is a last resort - we should always prefer ID matching
    // Only use this if we truly can't match by ID (both IDs are null/undefined)
    if (userPlanPlanId == null && planId == null) {
      const userPlanName = userPlan.name || userPlan.title
      const planName = plan.name || plan.title
      const userBillingCycle = (userPlan.billingCycle || userPlan.duration || '')
        .toLowerCase()
        .trim()
      const planBillingCycle = (plan.billingCycle || plan.duration || '')
        .toLowerCase()
        .trim()

      // Both name and billing cycle must exist and match
      if (userPlanName && planName && userPlanName === planName) {
        if (
          userBillingCycle &&
          planBillingCycle &&
          userBillingCycle === planBillingCycle
        ) {
          return true
        } else { }
      }
    } else { }

    return false
  }

  const handleTogglePlanClick = (item, index) => {
    setSelectedPlanIndex(index)
    setTogglePlan(item.id)
    setSelectedPlan(item)
  }

  const handleContinueYearly = async () => {
    // Switch to yearly billing and find matching plan
    setSelectedDuration(duration[2]) // Switch to yearly

    // Find the matching plan in yearly billing
    if (selectedMonthlyPlan && yearlyPlans.length > 0) {
      const matchingYearlyPlan = yearlyPlans.find(
        (plan) =>
          plan.name === selectedMonthlyPlan.name ||
          plan.planType === selectedMonthlyPlan.planType,
      )

      if (matchingYearlyPlan) {
        const planIndex = yearlyPlans.findIndex(
          (plan) => plan.id === matchingYearlyPlan.id,
        )
        setSelectedPlan(matchingYearlyPlan)
        setSelectedPlanIndex(planIndex)
        setTogglePlan(matchingYearlyPlan.id)
      }
    }

    setShowYearlyPlanModal(false)

    // Check if the yearly plan is free before showing payment popup
    const isFreePlan =
      selectedPlan &&
      (selectedPlan.discountedPrice === 0 ||
        selectedPlan.discountedPrice === null)
    const hasPM = hasPaymentMethod()

    if (isFreePlan) {
      // Free yearly plan - subscribe directly
      await handleSubscribePlan()
    } else {
      setShouldAutoSubscribe(true)
      setAddPaymentPopUp(true)
      // Paid yearly plan - check for payment method
      // if (hasPM) {
      //   // User has PM - subscribe directly
      //   await handleSubscribePlan()
      // } else {
      //   // User doesn't have PM - show payment modal and set auto-subscribe flag
      //   setShouldAutoSubscribe(true)
      //   setAddPaymentPopUp(true)
      // }
    }
  }

  const handleContinueMonthly = async () => {
    // Proceed with monthly plan
    const isFreePlan =
      selectedMonthlyPlan.discountedPrice === 0 ||
      selectedMonthlyPlan.discountedPrice === null
    const hasPM = hasPaymentMethod()

    if (isFreePlan) {
      // Free monthly plan - subscribe directly
      await handleSubscribePlan()
    } else {
      setShouldAutoSubscribe(true)
      setAddPaymentPopUp(true)
      // Paid monthly plan - check for payment method
      // if (hasPM) {
      //   // User has PM - subscribe directly
      //   await handleSubscribePlan()
      // } else {
      //   // User doesn't have PM - show payment modal and set auto-subscribe flag
      //   setShouldAutoSubscribe(true)
      //   setAddPaymentPopUp(true)
      // }
    }

    setShowYearlyPlanModal(false)
  }

  const isFeatureIncluded = (feature) => {
    if (!feature || typeof feature !== 'object') return true
    if (feature.included === false) return false
    if (feature.available === false) return false
    if (feature.enabled === false) return false
    return true
  }

  return (
    <div className={`w-full bg-white ${from === 'billing-modal' ? 'h-full' : 'min-h-screen'}`}>
      <LoaderAnimation
        isOpen={showRoutingLoader}
        title="Redirecting to dashboard..."
      />
      <AgentSelectSnackMessage
        isVisible={addCardFailure}
        hide={() => setAddCardFailure(false)}
        message={addCardErrtxt}
      />
      <AgentSelectSnackMessage
        isVisible={addCardSuccess}
        hide={() => setAddCardSuccess(false)}
        type={SnackbarTypes.Success}
        message={'Card added successfully'}
      />
      {!hideProgressBar && (
        <div className="w-full">
          <div
            className="bg-white border-b border-solid w-full flex items-center justify-between overflow-hidden px-[43px] py-[17px]"
            style={{ borderColor: FIGMA_BORDER }}
          >
            <AppLogo height={32} width={125} alt="logo" />
            <button
              type="button"
              onClick={() => logout('User clicked logout from plans page')}
              className="bg-[#efefef] min-h-[36px] px-4 py-[7.5px] rounded-[8px] text-[14px] font-semibold text-[#0f172a] hover:bg-[#e7e7e7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            >
              Logout
            </button>
          </div>
          <div
            className="bg-white border-b border-solid w-full"
            style={{ borderColor: FIGMA_BORDER }}
          >
            <div className="h-[3px] w-full bg-brand-primary" />
          </div>
        </div>
      )}

      <div className="w-full px-4 pb-8 sm:px-6 sm:pb-10">
        <div className="mx-auto w-full max-w-[1500px] pt-6 sm:pt-8">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between px-0 sm:px-6">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <div className="text-[#31302e] text-[22px] leading-[28px] sm:text-[28px] sm:leading-[36px] font-semibold tracking-[-0.84px]">
                Get an AI AaaS Agency
              </div>
              <div className="text-[13px] sm:text-[14px] text-[#666] leading-[normal]">
                {`Gets more done than coffee. Cheaper too. ${reduxUser?.userRole != 'Agency' ? 'Cancel anytime.' : ''}`}{' '}
                <span>😉</span>
              </div>
            </div>

            {[
              monthlyPlans?.length > 0,
              quaterlyPlans?.length > 0,
              yearlyPlans?.length > 0,
            ].filter(Boolean).length >= 2 && (
              <div className="flex flex-col items-center gap-1 md:items-end">
                {isFrom !== 'SubAccount' && (
                  <div className="flex items-center justify-center gap-3 px-3 md:justify-end">
                    {duration?.filter((d) => Boolean(d.save)).map((d) => {
                      const isActive = selectedDuration?.id === d.id
                      return (
                        <div
                          key={d.id}
                          className="backdrop-blur-[10px] bg-white px-3 py-[2px] rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_4px_15.5px_0px_rgba(0,0,0,0.11)]"
                        >
                          <span
                            className={`text-[12px] font-semibold tracking-[-0.36px] leading-[16px] ${isActive ? 'bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-[#ec15ff]' : 'text-[#666]'}`}
                          >
                            Save {d.save}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="bg-[#f9f9f9] rounded-[27px] p-1 w-full md:w-[293px] flex items-center gap-[10px]">
                  {duration?.map((d) => {
                    const isActive = selectedDuration?.id === d.id
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDuration(d)}
                        className={`flex-1 rounded-[27px] px-[10px] py-1 text-[14px] text-black transition-shadow ${isActive ? 'bg-white shadow-[0px_4px_10.4px_0px_rgba(0,0,0,0.18)]' : 'bg-transparent'}`}
                      >
                        {d.title}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="py-3 sm:py-4">
            <div className="overflow-x-auto overflow-y-visible scroll-smooth scroll-px-4 sm:scroll-px-6 -mx-4 px-4 sm:-mx-6 sm:px-6 [scrollbar-width:thin] snap-x snap-mandatory pb-1">
              <div
                key={gridAnimationId}
                className="mx-auto flex w-max flex-nowrap gap-3 pt-4 pb-2 sm:gap-4 sm:pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
              >
              {getCurrentPlans()?.map((item, index) => {
                const isCurrentUserPlan = isCurrentPlan(item)
                const currentPlanStatus = reduxUser?.plan?.status
                const isDisabled =
                  disAblePlans ||
                  (isCurrentUserPlan && currentPlanStatus !== 'cancelled')

                const isBadgeVisible = Boolean(item?.status)
                const badgeText = String(item?.status ?? '')
                const shouldEmphasizePrice =
                  badgeText.toLowerCase().includes('best') ||
                  badgeText.toLowerCase().includes('value')

                return (
                  <button
                    key={item?.id ?? index}
                    type="button"
                    disabled={isDisabled}
                    onClick={(e) => {
                      if (isDisabled) return
                      e.preventDefault()
                      e.stopPropagation()
                      handleTogglePlanClick(item, index)
                    }}
                    className={`group relative shrink-0 snap-start snap-always w-[clamp(260px,min(360px,calc(100vw-1.5rem)),360px)] max-w-[360px] bg-white border border-solid rounded-[12px] overflow-hidden pt-6 pb-[10px] flex flex-col text-left transition-all duration-200 ease-out ${
                      isDisabled
                        ? 'opacity-80 cursor-not-allowed border-border'
                        : 'border-border hover:-translate-y-[5px] hover:border-white hover:shadow-[0px_10px_28px_rgba(0,0,0,0.05)]'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30`}
                  >
                    <div className="absolute w-[200px] h-[150px] rounded-full bg-brand-primary blur-[50px] pointer-events-none opacity-25 left-0 top-0 -translate-y-full scale-100 transition-transform duration-300 ease-out group-hover:-translate-y-[70%] group-hover:scale-110" aria-hidden />
                    <div className="w-full flex flex-col gap-1 px-[8px]">
                      {isBadgeVisible &&
                        item.discountedPrice !== 0 &&
                        item.discountedPrice != null && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 py-1 px-2 rounded-[4px] bg-brand-primary/10 uppercase">
                          <span className="text-brand-primary">
                            <BoltIcon />
                          </span>
                          <span className="text-[12px] leading-[16px] font-semibold tracking-[-0.36px] text-brand-primary">
                            {badgeText}
                          </span>
                        </div>
                      )}
                      <div className="w-full flex items-center justify-center">
                        <span className="text-[18px] leading-[25px] font-semibold tracking-[-0.54px] text-black">
                          {(item.name || item.title || '').toString()}
                        </span>
                      </div>

                      <div className="w-full flex flex-col items-center justify-center gap-2 px-2 py-3">
                        <div className="flex items-center gap-2">
                          {isFrom === 'SubAccount' && item?.originalPrice > 0 && (
                            <span className="text-[#8a8a8a] line-through text-[14px]">
                              ${formatFractional2(item?.originalPrice) || ''}
                            </span>
                          )}
                          <span className="text-[42px] font-semibold tracking-[-1px] text-black leading-tight">
                            ${formatFractional2(item.discountedPrice || 0)}
                          </span>
                        </div>
                        {(item.details || item.description || item.planDescription) && (
                          <div className="text-center text-[14px] font-normal leading-[normal] text-black/80">
                            {item.details ||
                              item.description ||
                              item.planDescription}
                          </div>
                        )}
                      </div>

                      <div className="w-full px-4 py-3">
                        {subscribeLoader === item.id ? (
                          <div className="flex justify-center">
                            <CircularProgress size={18} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleTogglePlanClick(item, index)

                              if (isDisabled) return

                              if (reduxUser?.consecutivePaymentFailures >= 3) {
                                setTimeout(() => {
                                  setShouldAutoSubscribe(true)
                                  setAddPaymentPopUp(true)
                                }, 300)
                                return
                              }

                              if (from === 'billing-modal' && onPlanSelected) {
                                onPlanSelected(item)
                                return
                              }

                              const isFreePlan =
                                item.discountedPrice === 0 ||
                                item.discountedPrice === null
                              const hasPM = hasPaymentMethod()

                              if (
                                reduxUser?.userRole === 'Agency' ||
                                reduxUser?.user?.userRole === 'Agency'
                              ) {
                                setAddPaymentPopUp(true)
                                return
                              }

                              if (
                                reduxUser?.userRole === 'AgentX' ||
                                reduxUser?.user?.userRole === 'AgentX'
                              ) {
                                if (selectedDuration.id === 1 || selectedDuration.id === 2) {
                                  setSelectedMonthlyPlan(item)
                                  setShowYearlyPlanModal(true)
                                } else {
                                  if (isFreePlan) {
                                    setAddPaymentPopUp(true)
                                  } else {
                                    if (hasPM) {
                                      setAddPaymentPopUp(true)
                                    } else {
                                      setShouldAutoSubscribe(true)
                                      setAddPaymentPopUp(true)
                                    }
                                  }
                                }
                                return
                              }

                              if (isFreePlan) {
                                setAddPaymentPopUp(true)
                              } else {
                                if (hasPM) {
                                  setAddPaymentPopUp(true)
                                } else {
                                  setShouldAutoSubscribe(true)
                                  setAddPaymentPopUp(true)
                                }
                              }
                            }}
                            className={`w-full min-h-[36px] px-4 py-[7.5px] rounded-[8px] text-[14px] font-normal text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 group-hover:shadow-[0_12px_24px_hsl(var(--brand-primary)_/_0.15)] ${
                              isDisabled
                                ? 'bg-[rgba(234,226,255,0.4)] text-black cursor-not-allowed'
                                : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                            }`}
                          >
                            {isDisabled ? (
                              'Current Plan'
                            ) : item?.hasTrial == true ? (
                              `${item?.trialValidForDays} Day Free Trial`
                            ) : (
                              'Get Started'
                            )}
                          </button>
                        )}
                      </div>

                      {(isFrom === 'SubAccount' || routedFrom === 'Agency') ? null : (
                        <div className="w-full px-4 py-[2px]">
                          {getInheritedPlanTitle(item, getCurrentPlans()) && (
                            <div className="min-h-[36px] px-4 py-[1px] rounded-[8px] text-[14px] text-[#0f172a] text-center">
                              Everything in{' '}
                              {getInheritedPlanTitle(item, getCurrentPlans())}{' '}
                              and...
                            </div>
                          )}
                        </div>
                      )}

                      <div className="w-full px-2">
                        <div className="flex flex-col gap-1">
                          {Array.isArray(item.features) &&
                            reorderPlanFeatures(
                              getDisplayFeaturesForPlan(item, getCurrentPlans()),
                            )?.map((feature) => {
                              const included = isFeatureIncluded(feature)
                              return (
                                <div
                                  key={feature.text || feature?.id || JSON.stringify(feature)}
                                  className="w-full flex items-start gap-3 px-2 py-2"
                                >
                                  <div
                                    className="flex items-center justify-center p-[2px] rounded-full flex-shrink-0 mt-0.5"
                                    style={{
                                      backgroundColor: included
                                        ? 'rgba(234,226,255,0.4)'
                                        : 'rgba(255,78,78,0.05)',
                                    }}
                                  >
                                    <span
                                      className="inline-flex h-[12px] w-[12px] items-center justify-center"
                                      style={{
                                        color: included ? 'hsl(var(--primary))' : '#FF4E4E',
                                      }}
                                    >
                                      {included ? <CheckIcon /> : <CloseIcon />}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <FeatureLine
                                      text={getFeatureDisplayText(
                                        feature,
                                        index,
                                        getCurrentPlans()?.length ?? 0,
                                      )}
                                      info={feature.subtext}
                                      max={14}
                                      min={10}
                                      gap={6}
                                      iconSize={16}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Elements stripe={stripePromise}>
        <UpgradePlan
          open={showUpgradePlanPopup}
          handleClose={async (result) => {
            setShowUpgradePlanPopup(false)
            if (result) {
              // console.log('🎉 [subscribe plan] Plan upgraded successfully');
              // Refresh user data after upgrade to get new plan capabilities
              await refreshUserData()

              if (handleContinue) {
                handleContinue()
              }
            }
          }}
          setSelectedPlan={() => { }}
        />
      </Elements>
      <YearlyPlanModal
        open={showYearlyPlanModal}
        handleClose={() => setShowYearlyPlanModal(false)}
        onContinueYearly={handleContinueYearly}
        onContinueMonthly={handleContinueMonthly}
        selectedDuration={selectedDuration}
        loading={subscribeLoader}
        isFree={!selectedPlan?.discountedPrice ? true : false}
      />
      <Modal
        open={addPaymentPopUp}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: { backgroundColor: '#00000099' },
        }}
      >
        <Box className="flex w-full h-full justify-center items-center p-4">
          <div className="w-[715px] max-w-[90vw] flex flex-col overflow-hidden rounded-[12px] bg-white border border-[#eaeaea] shadow-[0_4px_36px_rgba(0,0,0,0.25)] max-h-[90vh]">
            <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-[#eaeaea] flex-shrink-0">
              <h2 className="text-[16px] font-semibold text-foreground">Continue to Payment</h2>
              <button
                onClick={() => {
                  setAddPaymentPopUp(false)
                  setShouldAutoSubscribe(false)
                }}
                className="rounded-lg hover:bg-black/5 transition-colors p-1"
                aria-label="Close"
              >
                <Image src="/assets/crossIcon.png" height={24} width={24} alt="" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
              <Elements stripe={stripePromise}>
                <UserAddCard
                  handleClose={handleClose}
                  selectedPlan={selectedPlan}
                  isFrom={isFrom || routedFrom}
                  setCredentialsErr={setCredentialsErr}
                  setAddCardFailure={setAddCardFailure}
                  setAddCardSuccess={setAddCardSuccess}
                  setAddCardErrtxt={setAddCardErrtxt}
                  credentialsErr={credentialsErr}
                  addCardFailure={addCardFailure}
                  addCardSuccess={addCardSuccess}
                  addCardErrtxt={addCardErrtxt}
                  hasExternalHeader
                />
              </Elements>
              </div>
            </div>
        </Box>
      </Modal>
    </div>
  );
}

const styles = {
  paymentModal: {
    // height: "auto",
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: 0,
    borderRadius: 3,
    // border: "none",
    outline: 'none',
    width: '100%',
    maxWidth: 900,
    maxHeight: '90vh',
  },
}

export default UserPlans
