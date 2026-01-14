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
import UpgradePlan from './UpgradePlan'
import UserAddCard from './UserAddCardModal'
import { getUserPlans } from './UserPlanServices'
import YearlyPlanModal from './YearlyPlanModal'
import AppLogo from '@/components/common/AppLogo'
import { Checkbox } from '@/components/ui/checkbox'
import { logout } from '@/utilities/UserUtility'
import { renderBrandedIcon } from '@/utilities/iconMasking'

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

  // Helper function to check if user has payment methods
  const hasPaymentMethod = () => {
    try {
      // First check localStorage (primary source)
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        const cards = userData?.data?.user?.cards
        console.log('🔍 [hasPaymentMethod] Checking localStorage cards:', cards)
        if (Array.isArray(cards) && cards.length > 0) {
          console.log(
            '✅ [hasPaymentMethod] Found payment method in localStorage',
          )
          return true
        }
      }
      // Fallback to Redux user data (check both reduxUser.cards and reduxUser.user.cards)
      if (
        reduxUser?.cards &&
        Array.isArray(reduxUser.cards) &&
        reduxUser.cards.length > 0
      ) {
        console.log(
          '✅ [hasPaymentMethod] Found payment method in reduxUser.cards',
        )
        return true
      }
      if (
        reduxUser?.user?.cards &&
        Array.isArray(reduxUser.user.cards) &&
        reduxUser.user.cards.length > 0
      ) {
        console.log(
          '✅ [hasPaymentMethod] Found payment method in reduxUser.user.cards',
        )
        return true
      }
      console.log('❌ [hasPaymentMethod] No payment method found')
      return false
    } catch (error) {
      console.error('Error checking payment methods:', error)
      return false
    }
  }

  useEffect(() => {
    console.log('reduxUser', reduxUser)
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
        console.log('user.user.userRole', userRole)
        
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

  const handleClose = async (data) => {
    console.log('Card added details are here', data)
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
            console.log('Mobile user/subaccount - redirecting to continue to desktop screen')
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
      console.log(
        '🔄 [subscribe plan] Refreshing user data after plan upgrade...',
      )
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        console.log(
          '🔄 [subscribe plan] Fresh user data received after upgrade',
        )
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
          console.log('❌ [handleSubscribePlan] No payment method found - showing payment modal')
          setShouldAutoSubscribe(true)
          setAddPaymentPopUp(true)
          setSubscribeLoader(null)
          return
        }
      }

      let planType = selectedPlan?.planType

      setSubscribeLoader(selectedPlan?.id)
      console.log('subscribeLoader', subscribeLoader)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      // //console.log;

      let ApiData = {
        plan: selectedPlan?.id,
      }

      if (isFrom === 'SubAccount' || reduxUser?.userRole === 'Agency') {
        ApiData = {
          planId: selectedPlan?.id || hoverPlan?.id,
        }
        // Add userId to body if subscribing for a subaccount
        if (selectedUser) {
          ApiData.userId = selectedUser.id
        }
      }

      // //console.log;

      let ApiPath = Apis.subscribePlan
      if (isFrom === 'SubAccount' || reduxUser?.userRole === 'Agency') {
        ApiPath = Apis.subAgencyAndSubAccountPlans
      }
      // //console.log;
      console.log('Api data', ApiData)
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('Response of subscribe plan api is', response.data)
        if (response.data.status === true) {
          await refreshUserData()
          
          // If subscribing for a subaccount (agency/admin context), refresh the subaccount's profile
          if (selectedUser && (isFrom === 'SubAccount' || reduxUser?.userRole === 'Agency')) {
            try {
              console.log('🔄 [USER-PLANS] Refreshing subaccount profile after plan subscription')
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
                
                console.log('✅ [USER-PLANS] Subaccount profile refreshed and event dispatched')
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
              console.log('Mobile user/subaccount - redirecting to continue to desktop screen')
              redirectPath = '/createagent/desktop'
            } else {
              console.log('handle continue ')
              if (handleContinue) {
                handleContinue()
                return // Exit early if handleContinue is called
              }
            }
          }
          
          // Use window.location.href for hard redirect to ensure clean page reload
          // This prevents DOM cleanup errors during navigation
          if (redirectPath) {
            console.log('✅ Subscription successful, redirecting to:', redirectPath)
            window.location.href = redirectPath
            return
          }
        } else if (response.data.status === false) {
          // Handle subscription failure - check if it's due to missing payment method
          const errorMessage = response.data.message || 'Subscription failed. Please try again.'
          console.log('❌ [handleSubscribePlan] Subscription failed:', errorMessage)
          
          if (response.data.message === 'No payment method added' || response.data.message?.toLowerCase().includes('payment')) {
            console.log('❌ [handleSubscribePlan] API returned no payment method error - showing payment modal')
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
        console.log('❌ [handleSubscribePlan] Payment error detected - showing payment modal')
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
    console.log('getPlans is called', fromValue)
    console.log('selectedUser is', selectedUser)
    let plansList = await getUserPlans(fromValue, selectedUser)
    console.log('Plans list found is', plansList)
    if (plansList) {
      console.log('isFrom is', fromValue)
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
      console.log('Filtered plans are', filteredPlans)
      const monthly = []
      const quarterly = []
      const yearly = []
      let freePlan = null
      console.log('Status f is from is', fromValue)
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

      // if (freePlan) {
      //     quarterly.unshift({ ...freePlan, billingCycle: "quarterly" });
      //     yearly.unshift({ ...freePlan, billingCycle: "yearly" });
      // }

      //select duration selection dynamically
      console.log('Isfrom is', fromValue)
      if (fromValue === 'SubAccount') {
        if (
          monthly.length > 0 &&
          quarterly.length === 0 &&
          yearly.length === 0
        ) {
          setSelectedDuration({ id: 1, title: 'Monthly' })
        } else {
          if (monthly.length > 0) {
            console.log('Should select the 0 index')
            setSelectedDuration({ id: 1, title: 'Monthly' })
          }
          // Check inside quarterly plans
          else if (quarterly.length > 0) {
            console.log('Should select the 2 index')
            setSelectedDuration({ id: 2, title: 'Quarterly' })
          }
          // Check inside yearly plans
          else if (yearly.length > 0) {
            console.log('Should select the 3 index')
            setSelectedDuration({ id: 3, title: 'Yearly' })
          }
        }
      }

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

      setMonthlyPlans(monthly)
      setQuaterlyPlans(quarterly)
      setYearlyPlans(yearly)

      console.log('monthly', monthly)
      console.log('quarterly', quarterly)
      console.log('yearly', yearly)
    }
  }
  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    return []
  }

  // Check if a plan is the current user's plan
  const isCurrentPlan = (plan) => {
    if (!reduxUser?.plan || !plan) {
      console.log('🔍 [isCurrentPlan] Early return:', {
        hasReduxPlan: !!reduxUser?.plan,
        hasPlan: !!plan,
      })
      return false
    }
    const userPlan = reduxUser.plan

    // Log user's current plan details
    console.log('🔍 [isCurrentPlan] User Plan Details:', {
      userPlanId: userPlan.id,
      userPlanPlanId: userPlan.planId,
      userName: userPlan.name,
      userTitle: userPlan.title,
      userBillingCycle: userPlan.billingCycle,
      userDuration: userPlan.duration,
      userStatus: userPlan.status,
    })

    // Log plan being checked
    console.log('🔍 [isCurrentPlan] Checking Plan:', {
      planId: plan.id,
      planPlanId: plan.planId,
      planName: plan.name,
      planTitle: plan.title,
      planBillingCycle: plan.billingCycle,
      planDuration: plan.duration,
    })

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
      
      console.log('🔍 [isCurrentPlan] ID Comparison:', {
        userPlanId: userPlan.id,
        userPlanPlanId,
        planId,
        userPlanPlanIdStr,
        planIdStr,
        match: userPlanPlanIdStr === planIdStr,
      })

      if (userPlanPlanIdStr === planIdStr) {
        console.log('✅ [isCurrentPlan] MATCHED BY PLAN ID:', {
          planId: plan.id,
          planPlanId: plan.planId,
          planTitle: plan.title || plan.name,
          userPlanPlanId,
          planId,
        })
        return true
      }
    } else {
      console.log('⚠️ [isCurrentPlan] ID comparison skipped:', {
        userPlanPlanId,
        planId,
        reason: userPlanPlanId == null ? 'userPlanPlanId is null/undefined' : 'planId is null/undefined',
      })
    }

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

      console.log('🔍 [isCurrentPlan] Name & Billing Cycle Comparison (fallback - no IDs available):', {
        userPlanName,
        planName,
        userBillingCycle,
        planBillingCycle,
        nameMatch: userPlanName && planName && userPlanName === planName,
        billingCycleMatch: userBillingCycle && planBillingCycle && userBillingCycle === planBillingCycle,
      })

      // Both name and billing cycle must exist and match
      if (userPlanName && planName && userPlanName === planName) {
        if (
          userBillingCycle &&
          planBillingCycle &&
          userBillingCycle === planBillingCycle
        ) {
          console.log('✅ [isCurrentPlan] MATCHED BY NAME + BILLING CYCLE (fallback):', {
            planId: plan.id,
            planPlanId: plan.planId,
            planTitle: plan.title || plan.name,
            planName,
            planBillingCycle,
            userPlanName,
            userBillingCycle,
          })
          return true
        } else {
          console.log('⚠️ [isCurrentPlan] Name matched but billing cycle did not:', {
            planId: plan.id,
            planTitle: plan.title || plan.name,
            planName,
            planBillingCycle,
            userPlanName,
            userBillingCycle,
          })
        }
      }
    } else {
      console.log('⚠️ [isCurrentPlan] Skipping name fallback - IDs are available but did not match:', {
        userPlanPlanId,
        planId,
        reason: 'Should match by ID, not by name',
      })
    }

    console.log('❌ [isCurrentPlan] NO MATCH:', {
      planId: plan.id,
      planPlanId: plan.planId,
      planTitle: plan.title || plan.name,
    })
    return false
  }

  const handleTogglePlanClick = (item, index) => {
    console.log('Selected plan index is', index, item)
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
      // Paid yearly plan - check for payment method
      if (hasPM) {
        // User has PM - subscribe directly
        await handleSubscribePlan()
      } else {
        // User doesn't have PM - show payment modal and set auto-subscribe flag
        setShouldAutoSubscribe(true)
        setAddPaymentPopUp(true)
      }
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
      // Paid monthly plan - check for payment method
      if (hasPM) {
        // User has PM - subscribe directly
        await handleSubscribePlan()
      } else {
        // User doesn't have PM - show payment modal and set auto-subscribe flag
        setShouldAutoSubscribe(true)
        setAddPaymentPopUp(true)
      }
    }

    setShowYearlyPlanModal(false)
  }

  return (
    <div
      className={`flex flex-col items-center w-full bg-white ${from === 'billing-modal' ? 'h-full' : 'h-[100vh]'}`}
    >
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
      <div
        className={`flex flex-col items-center ${from === 'billing-modal' ? 'w-full px-6' : 'w-[90%]'} h-full overflow-y-auto`}
        style={{
          scrollbarWidth: 'none',
        }}
      >
        {!hideProgressBar && (
          <div
            className="flex w-full flex-row items-center gap-2 mt-[5vh]"
            style={{ backgroundColor: '' }}
          >
            <AppLogo
              height={30}
              width={130}
              alt="logo"
            />

            <div className={`w-[${from === 'billing-modal' ? '80%' : '100%'}] flex flex-row items-center gap-2`}>
              <div className="flex-1">
                <ProgressBar value={100} />
              </div>
              {/* Logout button right in front of progress line */}
              <button
                onClick={() => logout('User clicked logout from plans page')}
                className="px-3 py-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
                style={{
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <div
          className={`flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-4 md:gap-0 ${hideProgressBar ? 'mt-6' : 'mt-10'}`}
        >
          <div className="flex flex-col items-start w-full">
            <div //className='text-4xl font-semibold'
              // onClick={getPlans}
              style={{
                fontSize: 22,
                fontWeight: '600',
                // marginTop: 20,
              }}
            >
              {`Grow Your Business`}
            </div>
            <div className="flex flex-row items-center gap-1 mt-1">
              <span
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#808080',
                }}
              >
                {`Gets more done than coffee. Cheaper too. ${reduxUser?.userRole != 'Agency' ? 'Cancel anytime.' : ''}`}
                <span>😉</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end w-full">
            {isFrom !== 'SubAccount' && (
              <div className="flex flex-row items-center justify-end gap-2 px-2 me-[33px] md:me-[7px]  w-auto">
                {duration?.map(
                  (item) =>
                    item.save && (
                      <div
                        key={item.id}
                        // className={`text-xs font-semibold ${selectedDuration?.id === item.id ? "text-purple" : "text-neutral-400 "}`}
                        className={`px-2 py-1 ${selectedDuration?.id === item.id ? 'text-white bg-brand-primary shadow-sm shadow-brand-primary' : 'text-black'} rounded-tl-lg rounded-tr-lg`}
                        style={{ fontWeight: '600', fontSize: '13px' }}
                      >
                        Save {item.save}
                      </div>
                    ),
                )}
              </div>
            )}
            <div className="w-full flex md:w-auto flex-col items-center md:items-end justify-center md:justify-end">
              {// count how many have length > 0
              [
                monthlyPlans?.length > 0,
                quaterlyPlans?.length > 0,
                yearlyPlans?.length > 0,
              ].filter(Boolean).length >= 2 && (
                <div
                  // className='flex flex-row items-center border gap-2 bg-neutral-100 px-2 py-1 rounded-full'
                  className="border flex flex-row items-center bg-neutral-100 px-2 gap-[8px] rounded-full py-1.5 w-[80%] md:w-auto justify-center md:justify-start"
                >
                  {duration?.map((item) => (
                    <button
                      key={item.id}
                      // className={`px-6 py-[10px] ${selectedDuration?.id === item.id ? "text-white text-base font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
                      className={`px-4 py-1 ${selectedDuration.id === item.id ? 'text-white bg-brand-primary shadow-md shadow-brand-primary rounded-full' : 'text-black'}`}
                      onClick={() => {
                        setSelectedDuration(item)
                        // getCurrentPlans();
                      }}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex flex-row gap-5 w-full h-auto mt-4 pb-8"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            // marginTop: 20,
            flexShrink: 0,
            alignItems: 'stretch', // This makes all cards the same height
            justifyContent:
              getCurrentPlans()?.length * 300 > window.innerWidth
                ? 'start'
                : 'center',
          }}
        >
          {(() => {
            // Log summary before rendering plans
            const allPlans = getCurrentPlans()
            if (allPlans?.length > 0) {
              const matchedPlans = []
              const unmatchedPlans = []
              
              allPlans.forEach((plan) => {
                const isCurrent = isCurrentPlan(plan)
                if (isCurrent) {
                  matchedPlans.push({
                    id: plan.id,
                    planId: plan.planId,
                    title: plan.title || plan.name,
                    name: plan.name,
                    billingCycle: plan.billingCycle || plan.duration,
                  })
                } else {
                  unmatchedPlans.push({
                    id: plan.id,
                    planId: plan.planId,
                    title: plan.title || plan.name,
                    name: plan.name,
                    billingCycle: plan.billingCycle || plan.duration,
                  })
                }
              })
              
              console.log('📊 [UserPlans] PLAN MATCHING SUMMARY:', {
                totalPlans: allPlans.length,
                matchedPlansCount: matchedPlans.length,
                unmatchedPlansCount: unmatchedPlans.length,
                matchedPlans: matchedPlans,
                unmatchedPlans: unmatchedPlans,
                userPlan: reduxUser?.plan ? {
                  id: reduxUser.plan.id,
                  planId: reduxUser.plan.planId,
                  name: reduxUser.plan.name,
                  title: reduxUser.plan.title,
                  billingCycle: reduxUser.plan.billingCycle,
                  duration: reduxUser.plan.duration,
                  status: reduxUser.plan.status,
                } : null,
              })
            }
            return allPlans
          })().length > 0 &&
            getCurrentPlans()?.map((item, index) => {
              const isCurrentUserPlan = isCurrentPlan(item)
              const currentPlanStatus = reduxUser?.plan?.status
              const isDisabled = disAblePlans || (isCurrentUserPlan && currentPlanStatus !== 'cancelled')
              
              console.log(`🔍 [UserPlans] Rendering Plan ${index + 1}:`, {
                planId: item.id,
                planPlanId: item.planId,
                title: item.title || item.name,
                isCurrentUserPlan,
                currentPlanStatus,
                isDisabled,
              })

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    if (isDisabled) {
                      return
                    }
                    e.preventDefault()
                    e.stopPropagation()
                    handleTogglePlanClick(item, index)
                  }}
                  onMouseEnter={() => {
                    if (!isDisabled) setHoverPlan(item)
                  }}
                  onMouseLeave={() => {
                    setHoverPlan(null)
                  }}
                  disabled={isDisabled}
                  className={`flex flex-col items-center rounded-lg ${!isDisabled && 'hover:p-2 hover:bg-gradient-to-b from-brand-primary to-brand-primary/40'}
                                 ${selectedPlan?.id === item.id && !isDisabled ? 'bg-gradient-to-b from-brand-primary to-brand-primary/40 p-2' : 'border p-2'}
                                 ${isDisabled ? 'opacity-75 cursor-not-allowed' : ''}
                                flex-shrink-0
                                 `}
                  style={{
                    width: from === 'billing-modal' ? '280px' : '280px',
                  }}
                >
                  <div className="flex flex-col items-center w-full h-full">
                    <div className="pb-2">
                      {item.status ? (
                        <div className=" flex flex-row items-center gap-2">
                          {(
                            renderBrandedIcon('/svgIcons/power.svg', 24, 24)
                          )}

                          <div
                            className={`text-base font-semibold ${
                              selectedPlan?.id === item.id ||
                              (hoverPlan?.id === item.id && !isDisabled)
                                ? 'text-brand-primary'
                                : 'text-brand-primary'
                            }`}
                            style={{}}
                          >
                            {item.status}
                          </div>
                          {(
                            renderBrandedIcon('/svgIcons/enterArrow.svg', 20, 20)
                          )}
                        </div>
                      ) : (
                        <div className="h-[3vh]"></div>
                      )}
                    </div>

                    <div className="flex flex-col items-center rounded-lg gap-2 bg-white w-full h-full">
                      {/* Header section - fixed height */}
                      <div className="flex flex-col items-center w-full flex-shrink-0">
                        <div className="text-3xl font-semibold mt-2 capitalize">
                          {item.name || item.title}
                        </div>

                        <div className="flex flex-row items-center gap-2">
                          {isFrom === 'SubAccount' &&
                            item?.originalPrice > 0 && (
                              <span className="text-[#00000020] line-through">
                                ${formatFractional2(item?.originalPrice) || ''}
                              </span>
                            )}
                          <span className="text-4xl mt-4 font-semibold text-black">
                            ${formatFractional2(item.discountedPrice || 0)}
                          </span>
                        </div>

                        <div
                          //  className='text-[14px] font-normal text-black/50 '
                          className={`text-center mt-1 ${isDisabled && 'w-full border-b border-[#00000040] pb-2'}`}
                          style={{ fontSize: 15, fontWeight: '400' }}
                        >
                          {item.details ||
                            item.description ||
                            item.planDescription}
                        </div>

                        {!isDisabled &&
                          (subscribeLoader === item.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <div
                              className="w-[95%] py-3.5 h-[50px] mt-3 bg-brand-primary rounded-lg text-white cursor-pointer"
                              disabled={isDisabled}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleTogglePlanClick(item, index)
                                console.log(
                                  'item.discountPrice',
                                  item.discountedPrice,
                                )
                                console.log('isFrom in user plans', isFrom)
                                if (
                                  reduxUser?.consecutivePaymentFailures >= 3
                                ) {
                                  setTimeout(() => {
                                    setShouldAutoSubscribe(true)
                                    setAddPaymentPopUp(true)
                                  }, 300)
                                  return
                                }

                                // If opened from billing modal, callback with selected plan
                                if (
                                  from === 'billing-modal' &&
                                  onPlanSelected
                                ) {
                                  onPlanSelected(item)
                                  return
                                }

                                // Check if plan is free
                                const isFreePlan =
                                  item.discountedPrice === 0 ||
                                  item.discountedPrice === null

                                // Check if user has payment method
                                const hasPM = hasPaymentMethod()
                                console.log(
                                  '🔍 [Subscribe Click] Plan:',
                                  item.name,
                                  'Price:',
                                  item.discountedPrice,
                                  'isFreePlan:',
                                  isFreePlan,
                                  'hasPM:',
                                  hasPM,
                                  'userRole:',
                                  reduxUser?.userRole ||
                                    reduxUser?.user?.userRole,
                                )

                                // Handle Agency users
                                if (
                                  reduxUser?.userRole === 'Agency' ||
                                  reduxUser?.user?.userRole === 'Agency'
                                ) {
                                  if (isFreePlan) {
                                    // Free plan - subscribe directly
                                    handleSubscribePlan()
                                  } else {
                                    // Paid plan - check for payment method
                                    if (hasPM) {
                                      // User has PM - subscribe directly
                                      handleSubscribePlan()
                                    } else {
                                      // User doesn't have PM - show payment modal and set auto-subscribe flag
                                      setShouldAutoSubscribe(true)
                                      setAddPaymentPopUp(true)
                                    }
                                  }
                                  return
                                }

                                // Handle AgentX users
                                if (
                                  reduxUser?.userRole === 'AgentX' ||
                                  reduxUser?.user?.userRole === 'AgentX'
                                ) {
                                  if (
                                    selectedDuration.id === 1 ||
                                    selectedDuration.id === 2
                                  ) {
                                    // Monthly plan selected - show yearly plan modal
                                    setSelectedMonthlyPlan(item)
                                    setShowYearlyPlanModal(true)
                                  } else {
                                    // Yearly plan selected - check for payment method
                                    if (isFreePlan) {
                                      // Free plan - subscribe directly
                                      handleSubscribePlan()
                                    } else {
                                      // Paid plan - check for payment method
                                      if (hasPM) {
                                        // User has PM - subscribe directly
                                        handleSubscribePlan()
                                      } else {
                                        // User doesn't have PM - show payment modal and set auto-subscribe flag
                                        setShouldAutoSubscribe(true)
                                        setAddPaymentPopUp(true)
                                      }
                                    }
                                  }
                                } else {
                                  // Handle other user roles
                                  if (isFreePlan) {
                                    // Free plan - subscribe directly
                                    handleSubscribePlan()
                                  } else {
                                    // Paid plan - check for payment method
                                    if (hasPM) {
                                      // User has PM - subscribe directly
                                      handleSubscribePlan()
                                    } else {
                                      // User doesn't have PM - show payment modal and set auto-subscribe flag
                                      setShouldAutoSubscribe(true)
                                      setAddPaymentPopUp(true)
                                    }
                                  }
                                }
                              }}
                            >
                              {item?.hasTrial == true ? (
                                <span
                                  style={{
                                    fontWeight: '600',
                                    fontSize: 14,
                                    // color: "white",
                                  }}
                                >
                                  {item?.trialValidForDays} Day Free Trial
                                </span>
                              ) : (
                                !isDisabled && (
                                  <span className="text-base font-normal">
                                    Get Started
                                  </span>
                                )
                              )}
                            </div>
                          ))}
                      </div>

                      {/* Features container - scrollable */}
                      <div className="flex flex-col items-start w-[95%] flex-1 mt-4 min-h-0">
                        {/* Previous plan heading */}
                        {isFrom === 'SubAccount' || routedFrom === 'Agency' ? (
                          ''
                        ) : (
                          <div>
                            {index > 0 && (
                              <div className="w-full mb-3 flex-shrink-0">
                                <div className="text-sm font-semibold text-black mb-2 text-left">
                                  Everything in{' '}
                                  {getCurrentPlans()[index - 1]?.name}, and:
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col items-start w-full flex-1 pr-2">
                          {Array.isArray(item.features) &&
                            item.features?.map((feature, featureIndex) => (
                              <div
                                key={feature.text}
                                className="flex flex-row items-start gap-3 mb-3 w-full"
                              >
                                <Checkbox
                                  checked={true}
                                  className="!rounded-full h-4 w-4 flex-shrink-0 border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                />

                                <FeatureLine
                                  text={feature.text}
                                  info={feature.subtext}
                                  max={16}
                                  min={10}
                                  gap={6}
                                  iconSize={16}
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
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
          setSelectedPlan={() => {
            console.log('setSelectedPlan is called')
          }}
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
        // open={true}
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
          className="flex lg:w-9/12 sm:w-full w-full justify-center items-center border-none"
          sx={styles.paymentModal}
        >
          <div className="flex flex-row justify-center w-full ">
            <div
              className="w-full border-white"
              style={{
                backgroundColor: '#ffffff',
                padding: 0,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-end w-full items-center pe-5 pt-5">
                <button
                  onClick={() => {
                    setAddPaymentPopUp(false)
                    setShouldAutoSubscribe(false)
                    // setIsContinueMonthly(false);
                  }}
                >
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
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
                  // togglePlan={togglePlan}
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
    // height: "auto",
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    // border: "none",
    outline: 'none',
    height: '60svh',
  },
}

export default UserPlans
