'use client'

import { Box, CircularProgress, Modal } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'

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

  // Check if user has a current plan (for first-time subscription check)
  const getCurrentUserPlan = () => {
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        return userData?.user?.plan || null
      }
    } catch (error) {
      console.log('Error getting current user plan:', error)
    }
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
      nextChargeDate = getNextChargeDate(selectedPlan)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-brand-primary/40 via-white to-brand-primary/40 relative overflow-hidden flex flex-col w-full">
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Main Card - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-40 min-h-0">
      <div className="w-full flex flex-col items-center  overflow-hidden">
        <h1 className="text-2xl font-bold text-black pt-2">Get an AI AaaS Agency</h1>

        <div className="text-sm text-gray-500">
          Gets more done than coffee. Cheaper too.<span className="text-black">😉</span>
        </div>



        {/* Content */}
        <div className="px-6 py-6 space-y-6">


          <div className="flex flex-col items-end w-full mt-2">
            <div className="flex flex-row items-center justify-end gap-5 px-2 me-[0px] md:me-[7px]  w-auto">
              {durationSaving.map((item) => {
                const matchingDuration = duration.find(d => d.id === item.id)
                return (
                  <button
                    key={item.id}
                    className={
                      `px-2 py-1 rounded-tl-lg rounded-tr-lg font-semibold text-[13px] ${selectedDuration.id === item.id ? 'text-white bg-brand-primary outline-none border-none' : 'text-muted-foreground'}`
                    }
                    onClick={() => {
                      if (matchingDuration) {
                        setSelectedDuration(matchingDuration);
                        getCurrentPlans();
                      }
                    }}
                  >
                    {item.title}
                  </button>
                )
              })}
            </div>
            <div className="w-full flex md:w-auto flex-col items-center md:items-end justify-center md:justify-end">
              <div
                className="border flex flex-row items-center bg-neutral-100 px-2 gap-[8px] rounded-full py-1.5 w-[90%] md:w-auto justify-center md:justify-start"
              >
                {duration?.map((item) => (
                  <button
                    key={item.id}
                    className={
                      `px-4 py-1 rounded-full ${selectedDuration.id === item.id ? 'text-white bg-brand-primary outline-none border-none shadow-md shadow-brand-primary/50' : 'text-foreground'}`
                    }
                    onClick={() => {
                      setSelectedDuration(item);
                      getCurrentPlans();
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* Plan Selection */}
          {loading ? (
            <div className="flex justify-center py-8">
              <CircularProgress size={35} />
            </div>
          ) : currentPlans.length > 0 ? (
            <div className="space-y-3">
              {currentPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  className={`p-2 pb-4 rounded-xl border-2 transition-all cursor-pointer ${selectedPlan?.id === plan.id
                    ? 'border-none bg-gradient-to-b from-brand-primary to-brand-primary/40 rounded-lg'
                    : 'border-gray-200 hover:border-brand-primary/30'
                    } h-auto
                     
                    
                    ` }
                >
                  <div className="flex items-center flex-col">
                    {
                      plan.tag && (

                        <div className="flex flex-row items-center gap-2 pb-1">
                          {
                            selectedPlan?.id === plan.id ? (
                              <Image src="/svgIcons/powerWhite.svg" height={24} width={24} alt="*" />
                            ) : (
                              renderBrandedIcon('/svgIcons/power.svg', 24, 24)
                            )
                          }
                          <div className={`text-base font-bold ${selectedPlan?.id === plan.id ? 'text-white' : 'text-brand-primary'}`}>
                            {plan.tag}
                          </div>
                          {
                            selectedPlan?.id === plan.id ? (
                              <Image src="/svgIcons/enterArrowWhite.svg" height={20} width={20} alt="*" />
                            ) : (
                              renderBrandedIcon('/svgIcons/enterArrow.svg', 20, 20)
                            )
                          }
                        </div>
                      )
                    }
                    <div className="flex-1 flex flex-col items-center w-full bg-white rounded-lg">
                      <div className="flex items-center flex-col gap-2 w-full">
                        <h3 className="font-bold text-2xl text-black capitalize mt-2">
                          {plan.title}
                        </h3>


                        <div className="flex items-baseline gap-2 mt-4">
                          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-primary">
                            ${formatDecimalValue(getMonthlyPrice(plan))}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm text-gray-500 capitalize">
                            {plan.planDescription}
                          </span>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <button
                        onClick={handleContinueClick}
                        disabled={!selectedPlan || subscribeLoader}
                        className={`w-[90%] py-3 mt-4 rounded-xl font-regular text-white text-base transition-all ${!selectedPlan || subscribeLoader && selectedPlan?.id === plan.id
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-brand-primary hover:opacity-90 shadow-lg active:scale-98'
                          }`}
                      >
                        {subscribeLoader && selectedPlan?.id === plan.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <CircularProgress size={20} color="inherit" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          'Get Started'
                        )}
                      </button>
                      {plan.id === selectedPlan?.id && !showPlanDetails && (
                        <button className=" mt-4 mb-4"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPlanDetails(true)
                          }}
                        >
                          <div className="flex flex-row items-center gap-2">
                            <span className="text-sm text-brand-primary capitalize underline">
                              Show Plan Details
                            </span>
                            {renderBrandedIcon('/svgIcons/downArrow.svg', 20, 20)}
                          </div>
                        </button>
                      )}
                      {plan.id === selectedPlan?.id && showPlanDetails && (
                        <button className=" mt-4 mb-4"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPlanDetails(false)
                          }}
                        >
                          <div className="flex flex-row items-center gap-2">
                            <span className="text-sm text-brand-primary capitalize underline">
                              Hide Plan Details
                            </span>
                            {renderBrandedIcon('/svgIcons/downArrow.svg', 20, 20)}
                          </div>
                        </button>
                      )}


                      {
                        showPlanDetails && plan.id === selectedPlan?.id && (

                          <div className="flex flex-col items-start w-[95%] flex-1 mt-4 min-h-0">
                            <div className="flex flex-col items-start w-full flex-1 pr-2">
                              {index > 0 && (
                                <div className="w-full mb-3 flex-shrink-0">
                                  <div className="text-sm font-semibold text-foreground mb-2 text-left">
                                    Everything in{' '}
                                    {getCurrentPlans()[index - 1]?.title}, and:
                                  </div>
                                </div>
                              )}

                              {Array.isArray(plan?.features) &&
                                plan?.features?.map((feature) => (
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
                        )
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No plans available</div>
          )}

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
    </div>
  )
}

export default UserPlansMobile

