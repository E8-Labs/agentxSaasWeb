'use client'

import { Box, CircularProgress, Modal } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'

import {
  isSubaccountTeamMember,
  isTeamMember,
} from '@/constants/teamTypes/TeamTypes'
import { useUser } from '@/hooks/redux-hooks'

import { formatFractional2 } from '../agency/plan/AgencyUtilities'
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

  const stripePromise = useMemo(() => {
    const stripePublickKey =
      process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
        ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
        : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY
    return loadStripe(stripePublickKey)
  }, [])

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
  const [addPaymentPopUp, setAddPaymentPopUp] = useState(false)
  const [subscribeLoader, setSubscribeLoader] = useState(null)
  const [routedFrom, setRoutedFrom] = useState(isFrom)
  const [shouldAutoSubscribe, setShouldAutoSubscribe] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error)

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

  const refreshUserData = async () => {
    try {
      const userProfile = await getProfileDetails()
      if (userProfile) {
        setReduxUser(userProfile)
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
            console.log('✅ Subscription successful, redirecting to:', redirectPath)
            window.location.href = redirectPath
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

  const handleContinueClick = () => {
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

  const currentPlans = getCurrentPlans()
  const monthlyPrice = selectedPlan ? getMonthlyPrice(selectedPlan) : 0
  const totalPrice = selectedPlan ? getTotalPrice(selectedPlan) : 0
  const nextChargeDate = selectedPlan ? getNextChargeDate(selectedPlan) : null

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden flex flex-col">
      {/* Background blur effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -left-1/4 -top-1/4 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -right-1/4 -bottom-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Scrollable Container */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Main Card - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 min-h-0">
          <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-brand-primary px-6 py-8">
              <h1 className="text-2xl font-bold text-white mb-2">Order Summary</h1>
              <p className="text-white/80 text-sm">Choose your plan and continue</p>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
          {/* Duration Selector - Horizontally Scrollable */}
          {duration.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-brand-primary scrollbar-track-transparent">
              <div className="flex gap-2 min-w-max">
                {duration.map((dur) => (
                  <button
                    key={dur.id}
                    onClick={() => setSelectedDuration(dur)}
                    className={`flex-shrink-0 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                      selectedDuration.id === dur.id
                        ? 'bg-brand-primary text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dur.title}
                    {dur.save && (
                      <span className="ml-1 text-xs opacity-90">({dur.save})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plan Selection */}
          {currentPlans.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                Select Plan
              </label>
              {currentPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPlan?.id === plan.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-brand-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {plan.name || plan.title}
                        </h3>
                        {selectedPlan?.id === plan.id && (
                          <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.details || plan.description || plan.planDescription}
                      </p>
                      <div className="flex items-baseline gap-2 mt-2">
                        {isFrom === 'SubAccount' && plan?.originalPrice > 0 && (
                          <span className="text-gray-400 line-through text-sm">
                            ${formatFractional2(plan?.originalPrice)}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-gray-900">
                          ${formatFractional2(plan.discountedPrice || 0)}
                        </span>
                        <span className="text-sm text-gray-500">
                          /{selectedDuration.title.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Summary */}
          {selectedPlan && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Plan Details</h3>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedPlan.name || selectedPlan.title}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedDuration.title} Subscription
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${formatFractional2(selectedPlan.discountedPrice || 0)}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Billed Monthly</span>
                  <span className="font-semibold text-gray-900">
                    ${formatFractional2(monthlyPrice)}
                  </span>
                </div>
                {nextChargeDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Charge Date</span>
                    <span className="font-semibold text-gray-900">
                      {nextChargeDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method Icons */}
              {/* <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Accepted Payment Methods</p>
                <div className="flex gap-2">
                  <div className="bg-white px-3 py-1.5 rounded border border-gray-200">
                    <span className="text-xs font-semibold text-blue-600">VISA</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded border border-gray-200">
                    <span className="text-xs font-semibold text-red-500">MC</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded border border-gray-200">
                    <span className="text-xs font-semibold text-blue-500">AMEX</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded border border-gray-200">
                    <span className="text-xs font-semibold text-orange-500">DISCOVER</span>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {/* Total Due */}
          {selectedPlan && (
            <div className="bg-brand-primary rounded-xl p-4 text-white">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-3xl font-bold">${formatFractional2(totalPrice)}</p>
                  <p className="text-sm text-purple-100 mt-1">Due Today</p>
                </div>
              </div>
            </div>
          )}

            </div>
          </div>
        </div>

        {/* Sticky Bottom Section with Continue Button */}
        <div className="bg-white border-t border-gray-200 shadow-lg flex-shrink-0 relative z-20 safe-area-inset-bottom">
          <div className="max-w-md mx-auto px-6 pt-4 pb-6 space-y-3">
            {/* Terms and Conditions */}
            <p className="text-xs text-center text-gray-500">
              By continuing you agree to{' '}
              <span className="text-brand-primary font-semibold">Terms & Conditions</span>
            </p>
            
            {/* Continue Button */}
            <button
              onClick={handleContinueClick}
              disabled={!selectedPlan || subscribeLoader}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all ${
                !selectedPlan || subscribeLoader
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-brand-primary hover:opacity-90 shadow-lg active:scale-98'
              }`}
            >
              {subscribeLoader ? (
                <div className="flex items-center justify-center gap-2">
                  <CircularProgress size={20} color="inherit" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </div>
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
        >
          <Elements stripe={stripePromise}>
            <UserAddCard
              handleClose={handleClose}
              togglePlan={selectedPlan}
              isFrom={isFrom}
              selectedUser={selectedUser}
              selectedPlan={selectedPlan}
              setAddCardFailure={() => {}}
              setAddCardSuccess={() => {}}
              setAddCardErrtxt={() => {}}
              addCardFailure={false}
              addCardSuccess={false}
              addCardErrtxt=""
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

