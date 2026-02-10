'use client'

import { Box, CircularProgress, Modal } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import {
  isSubaccountTeamMember,
  isTeamMember,
} from '@/constants/teamTypes/TeamTypes'
import { useUser } from '@/hooks/redux-hooks'

import { formatDecimalValue } from '../agency/agencyServices/CheckAgencyData'
import LoaderAnimation from '../animations/LoaderAnimation'
import Apis from '../apis/Apis'
import getProfileDetails from '../apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import UserAddCard from './UserAddCardModal'
import {
  getUserPlans,
  getMonthlyPrice,
  getNextChargeDate,
  getTotalPrice,
} from './UserPlanServices'
import { getPolicyUrls } from '@/utils/getPolicyUrls'
import { Checkbox } from '../ui/checkbox'
import FeatureLine from './FeatureLine'
import { renderBrandedIcon } from '@/utilities/iconMasking'
import PlansListMobile from '../onboarding/mobileUI/PlansListMobile'
import PlanSummaryMobile from '../onboarding/mobileUI/PlanSummaryMobile'

function UserPlansMobile({
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


  const durationSaving = [
    {
      id: 2,
      title: 'save 20%',
    },
    {
      id: 3,
      title: 'save 30%',
    },
  ]


  const [selectedDuration, setSelectedDuration] = useState(duration[0])

  const [monthlyPlans, setMonthlyPlans] = useState([])
  const [quaterlyPlans, setQuaterlyPlans] = useState([])
  const [yearlyPlans, setYearlyPlans] = useState([])

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [addPaymentPopUp, setAddPaymentPopUp] = useState(false)
  const [subscribeLoader, setSubscribeLoader] = useState(null)
  const [routedFrom, setRoutedFrom] = useState(isFrom)
  const [shouldAutoSubscribe, setShouldAutoSubscribe] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error)
  const [loading, setLoading] = useState(false)
  const [showPlanDetails, setShowPlanDetails] = useState(false)
  const [showPlanSummary, setShowPlanSummary] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Helper function to check if user has payment methods
  const hasPaymentMethod = () => {
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        const cards = userData?.data?.user?.cards
        if (Array.isArray(cards) && cards.length > 0) {
          return true
        }
      }
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
    if (
      reduxUser?.plan &&
      reduxUser?.availableSeconds > 120 &&
      from !== 'billing-modal'
    ) {
      if (handleContinue) {
        handleContinue()
      }
    }
    if (!isFrom) {
      let data = localStorage.getItem('User')
      if (data) {
        let user = JSON.parse(data)
        if (isTeamMember(user.user)) {
          if (isSubaccountTeamMember(user.user)) {
            isFrom = 'SubAccount'
          }
        } else if (user.user.userRole === 'AgencySubAccount') {
          isFrom = 'SubAccount'
        } else if (user.user.userRole === 'Agency') {
          isFrom = 'Agency'
        } else {
          isFrom = 'User'
        }
      }
    }
    setRoutedFrom(isFrom)
    getPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper function to remove non-serializable values from objects
  const cleanNonSerializable = (obj) => {
    if (obj === null || obj === undefined) {
      return obj
    }

    // Remove common non-serializable properties
    if (typeof obj === 'object') {
      // Check if it's an array
      if (Array.isArray(obj)) {
        return obj.map(cleanNonSerializable)
      }

      // Check if it's a Date
      if (obj instanceof Date) {
        return obj.toISOString()
      }

      // Check if it has non-serializable properties (like AxiosHeaders)
      if (obj.constructor && obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array') {
        // If it's a class instance (like AxiosHeaders), convert to plain object
        try {
          return JSON.parse(JSON.stringify(obj))
        } catch {
          return null
        }
      }

      // Recursively clean object properties
      const cleaned = {}
      for (const key in obj) {
        if (key === 'headers' || key === 'config' || key === 'request') {
          // Skip axios-specific non-serializable properties
          continue
        }
        cleaned[key] = cleanNonSerializable(obj[key])
      }
      return cleaned
    }

    return obj
  }

  const refreshUserData = async () => {
    try {
      const response = await getProfileDetails()
      if (response && response.data && response.data.status === true) {
        // Extract only the user data, not the full axios response
        const userData = response.data.data

        // Get token from localStorage to maintain the token
        let token = null
        const localData = localStorage.getItem('User')
        if (localData) {
          const localDetails = JSON.parse(localData)
          token = localDetails.token
        }

        // Clean any non-serializable values from user data
        const cleanedUserData = cleanNonSerializable(userData)

        // Format data for Redux
        const cleanUserData = {
          token: token,
          user: cleanedUserData,
        }

        setReduxUser(cleanUserData)
        return true
      }
      return false
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return false
    }
  }

  const handleClose = async (data) => {
    if (data) {
      const isSubscriptionComplete = data.subscriptionHandled === true || data.status === true
      await refreshUserData()

      if (shouldAutoSubscribe && selectedPlan && !isSubscriptionComplete) {
        setAddPaymentPopUp(false)
        setShouldAutoSubscribe(false)
        await handleSubscribePlan()
        return
      }

      setAddPaymentPopUp(false)
      setShouldAutoSubscribe(false)

      if (isSubscriptionComplete) {
        if (from === 'dashboard') {
          router.push('/dashboard')
        } else {
          // Check if user is on mobile
          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
          const SM_SCREEN_SIZE = 640
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
          )

          // For mobile users (all types including agencies), redirect to continue to desktop screen
          if (screenWidth <= SM_SCREEN_SIZE || isMobileDevice) {
            router.push('/createagent/desktop')
          } else {
            // Desktop: Agencies go to agency dashboard, others continue
            if (isFrom == 'Agency' || routedFrom == 'Agency' || reduxUser?.userRole === 'Agency') {
              router.push('/agency/dashboard')
            } else {
              if (handleContinue) {
                handleContinue()
              }
            }
          }
        }
        return
      }
    }
  }

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {
      let planType = selectedPlan?.planType

      setSubscribeLoader(selectedPlan?.id)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      let ApiData = {
        plan: selectedPlan?.id,
      }

      if (isFrom === 'SubAccount' || reduxUser?.userRole === 'Agency') {
        ApiData = {
          planId: selectedPlan?.id,
        }
      }

      let ApiPath = Apis.subscribePlan
      if (isFrom === 'SubAccount' || reduxUser?.userRole === 'Agency') {
        ApiPath = Apis.subAgencyAndSubAccountPlans
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
          if (response.data.status === true) {
            await refreshUserData()

            setAddPaymentPopUp(false)
            setShouldAutoSubscribe(false)
            setIsRedirecting(true)

            // Determine redirect path
            let redirectPath = null

            if (from === 'dashboard') {
              redirectPath = '/dashboard'
            } else {
              // Check if user is on mobile
              const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
              const SM_SCREEN_SIZE = 640
              const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                typeof navigator !== 'undefined' ? navigator.userAgent : ''
              )

              // For mobile users (all types including agencies), redirect to continue to desktop screen
              if (screenWidth <= SM_SCREEN_SIZE || isMobileDevice) {
                redirectPath = '/createagent/desktop'
              } else {
                // Desktop: Agencies go to agency dashboard, others continue
                if (reduxUser?.userRole === 'Agency' || isFrom === 'Agency' || routedFrom === 'Agency') {
                  redirectPath = '/agency/dashboard'
                } else {
                  if (handleContinue) {
                    handleContinue()
                    return // Exit early if handleContinue is called
                  }
                }
              }
            }

            // Use window.location.href for hard redirect to ensure clean page reload
            // This prevents DOM cleanup errors during navigation
            if (redirectPath) {
              // Use setTimeout to ensure redirect happens in next event loop, avoiding React cleanup conflicts
              setTimeout(() => {
                window.location.href = redirectPath
              }, 0)
              return
            }
          }
      }
    } catch (error) {
      console.error('Error occured in api is:', error)
      setErrorMsg('Failed to subscribe. Please try again.')
      setSnackMsgType(SnackbarTypes.Error)
    } finally {
      setSubscribeLoader(null)
    }
  }

  const getPlans = async () => {
    setLoading(true)
    try {
      let plansList = await getUserPlans(isFrom, selectedUser)

    if (plansList && plansList.length > 0) {
      const monthly = []
      const quarterly = []
      const yearly = []

      plansList?.forEach((plan) => {
        // Agency plans use 'duration', normal plans use 'billingCycle'
        const cycle = plan.billingCycle || plan.duration
        switch (cycle) {
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

      if (isFrom === 'SubAccount') {
        if (
          monthly.length > 0 &&
          quarterly.length === 0 &&
          yearly.length === 0
        ) {
          setSelectedDuration({ id: 1, title: 'Monthly' })
        } else {
          if (monthly.length > 0) {
            setSelectedDuration({ id: 1, title: 'Monthly' })
          } else if (quarterly.length > 0) {
            setSelectedDuration({ id: 2, title: 'Quarterly' })
          } else if (yearly.length > 0) {
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

      // Auto-select first plan if available
      if (monthly.length > 0 && !selectedPlan) {
        setSelectedPlan(monthly[0])
      } else if (quarterly.length > 0 && !selectedPlan) {
        setSelectedPlan(quarterly[0])
      } else if (yearly.length > 0 && !selectedPlan) {
        setSelectedPlan(yearly[0])
      }
    }
    } catch (error) {
      console.error('Error getting plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    return []
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
  }

  const handleContinueClick = async () => {
    if (!selectedPlan) {
      setErrorMsg('Please select a plan')
      setSnackMsgType(SnackbarTypes.Error)
      return
    }

    // Check if plan is free
    const isFreePlan =
      selectedPlan.discountedPrice === 0 ||
      selectedPlan.discountedPrice === null

    // Check if user has payment method
    const hasPM = hasPaymentMethod()

    if (isFreePlan) {
      // Free plan - subscribe directly
      await handleSubscribePlan()
    } else {
      // Paid plan - check for payment method
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

  const monthlyPrice = selectedPlan ? getMonthlyPrice(selectedPlan) : 0

  // Check if user has a current plan (for first-time subscription check)
  const getCurrentUserPlan = () => {
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        return userData?.user?.plan || null
      }
    } catch (error) {}
    return null
  }

  const currentUserPlan = getCurrentUserPlan()
  const isFirstTimeSubscription = !currentUserPlan || currentUserPlan.planId === null

  // Calculate total price - show $0 if plan has trial and it's first-time subscription
  let totalPrice = 0
  if (selectedPlan) {
    const hasTrial = selectedPlan?.hasTrial === true
    if (hasTrial && isFirstTimeSubscription) {
      totalPrice = 0
    } else {
      totalPrice = getTotalPrice(selectedPlan)
    }
  }

  // Calculate next charge date - if trial and first-time, show trial end date, otherwise use normal calculation
  let nextChargeDate = null
  if (selectedPlan) {
    const hasTrial = selectedPlan?.hasTrial === true
    const trialDays = selectedPlan?.trialValidForDays || 0

    if (hasTrial && isFirstTimeSubscription && trialDays > 0) {
      // For trial plans on first-time subscription, next charge date is when trial ends
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + trialDays)
      nextChargeDate = trialEndDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } else {
      // Normal calculation (includes trial if not first-time)
      // getNextChargeDate returns an already-formatted date string
      nextChargeDate = getNextChargeDate(selectedPlan)
    }
  }

  const currentPlans = getCurrentPlans()

  return (
    <div className="h-screen overflow-hidden flex flex-col w-full">
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden h-screen">
        {/* Main Card - Scrollable */}
        <div className="w-full flex h-full flex-col items-center overflow-hidden">
          {showPlanSummary ? (
            <PlanSummaryMobile
              selectedPlan={selectedPlan}
              onMakePayment={async () => {
                await handleContinueClick()
              }}
              onEditPayment={() => {
                setShowPlanSummary(false)
                setAddPaymentPopUp(true)
              }}
              isRedirecting={isRedirecting}
              handleBack={() => {
                setShowPlanSummary(false)
              }}
              isSubscribing={subscribeLoader !== null}
              setIsSubscribing={setSubscribeLoader}
            />
          ) : (
            <PlansListMobile
              loading={loading}
              currentPlans={currentPlans}
              selectedPlan={selectedPlan}
              selectedDuration={selectedDuration}
              duration={duration}
              durationSaving={durationSaving}
              showPlanDetails={showPlanDetails}
              subPlanLoader={subscribeLoader}
              onPlanSelect={handlePlanSelect}
              onDurationChange={(item) => {
                setSelectedDuration(item)
              }}
              onShowPlanDetails={(plan) => {
                if (plan.id === selectedPlan?.id) {
                  setShowPlanDetails(!showPlanDetails)
                } else {
                  setShowPlanDetails(true)
                  handlePlanSelect(plan)
                }
              }}
              onGetStarted={(plan) => {
                handlePlanSelect(plan)
                setShowPlanSummary(true)
              }}
              getMonthlyPrice={getMonthlyPrice}
              getCurrentPlans={getCurrentPlans}
            />
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal
        open={addPaymentPopUp}
        onClose={() => {
          setAddPaymentPopUp(false)
          setShouldAutoSubscribe(false)
        }}
        className="flex items-center justify-center p-0"
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: { xs: '100%', sm: '500px' },
            height: { xs: '100vh', sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '90vh' },
            bgcolor: 'background.paper',
            borderRadius: { xs: '0', sm: '16px' },
            boxShadow: 24,
            p: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
          key="payment-modal"
        >
          <Elements stripe={stripePromise} key="stripe-elements">
            <UserAddCard
              key="user-add-card"
              handleClose={handleClose}
              togglePlan={selectedPlan}
              isFrom={isFrom}
              selectedUser={selectedUser}
              selectedPlan={selectedPlan}
              setAddCardFailure={() => { }}
              setAddCardSuccess={() => { }}
              setAddCardErrtxt={() => { }}
              addCardFailure={false}
              addCardSuccess={false}
              addCardErrtxt=""
              handleBack={() => {
                setSubscribeLoader(null)
                setAddPaymentPopUp(false)
                setShouldAutoSubscribe(false)

              }}
            />
          </Elements>
        </Box>
      </Modal>

      {/* Error Snackbar */}
      <AgentSelectSnackMessage
        isVisible={errorMsg !== null}
        message={errorMsg}
        hide={() => setErrorMsg(null)}
        type={snackMsgType}
      />
    </div>
  )
}

export default UserPlansMobile

