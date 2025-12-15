import { Box, CircularProgress, Modal, Tooltip } from '@mui/material'
import { FalloutShelter } from '@phosphor-icons/react/dist/ssr'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import getProfileDetails from '@/components/apis/GetProfile'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { PersistanceKeys } from '@/constants/Constants'

import { formatDecimalValue } from '../agency/agencyServices/CheckAgencyData'
import { AuthToken } from '../agency/plan/AuthDetails'
import LoaderAnimation from '../animations/LoaderAnimation'
import Apis from '../apis/Apis'
import AddCardDetails from '../createagent/addpayment/AddCardDetails'
import AgencyAddCard from '../createagent/addpayment/AgencyAddCard'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import BackgroundVideo from '../general/BackgroundVideo'
import CloseBtn from '../globalExtras/CloseBtn'
import SelectYearlypopup from './SelectYearlypopup'
import AppLogo from '@/components/common/AppLogo'
import { Checkbox } from '../ui/checkbox'

//code for add card
const stripePromise = getStripe()

function AgencyPlans({
  isFrom,
  handleCloseModal,
  disAblePlans = false,
  hideProgressBar = true,
  isMobile = false,
}) {
  const router = useRouter()
  const duration = [
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
  ]

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

  //hover plans state
  const [hoverPlan, setHoverPlan] = useState(null)

  const [togglePlan, setTogglePlan] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null)
  const [monthlyPlans, setMonthlyPlans] = useState([])
  const [quaterlyPlans, setQuaterlyPlans] = useState([])
  const [yearlyPlans, setYearlyPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(duration[2])
  //code for add card
  const [addPaymentPopUp, setAddPaymentPopUp] = useState(false)
  const [subPlanLoader, setSubPlanLoader] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error)

  //yearly plans popup
  const [showYearlyPlan, setShowYearlyPlan] = useState(false)
  const [isContinueMonthly, setIsContinueMonthly] = useState(false)

  // Current user plan state
  const [currentUserPlan, setCurrentUserPlan] = useState(null)

  // Redirecting loader state
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Subscription payment failure tracking
  const [subscriptionPaymentFailed, setSubscriptionPaymentFailed] =
    useState(false)
  const [failedPlanId, setFailedPlanId] = useState(null)

  useEffect(() => {
    getPlans()
    getCurrentUserPlan()
  }, [])

  // Function to get current user plan from localStorage
  const getCurrentUserPlan = () => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const userData = JSON.parse(localData)
      const plan = userData.user?.plan
      console.log('Current user plan in AgencyPlans:', plan)
      setCurrentUserPlan(plan)
    }
  }

  console.log('disAblePlans', disAblePlans)

  // Function to check if a plan is the current user's plan
  const isPlanCurrent = (item) => {
    if (!currentUserPlan || !item) return false

    // Check if plan ID matches
    if (item.id === currentUserPlan.planId) {
      return true
    }

    // Fallback: Check by name and duration if IDs don't match
    const planName = (item.title || item.name || '').toLowerCase()
    const userPlanName = (
      currentUserPlan.title ||
      currentUserPlan.name ||
      ''
    ).toLowerCase()
    const planDuration = (item.duration || '').toLowerCase()
    const userPlanDuration = (currentUserPlan.duration || '').toLowerCase()

    if (planName === userPlanName && planDuration === userPlanDuration) {
      return true
    }

    return false
  }

  //if Noah said to resume this then apply this for yearly plan
  const selectDefaultPlan = (monthly) => {
    // if (monthlyPlans.length > 0) {
    // setSelectedPlanIndex(1);
    // setTogglePlan(monthly[1]?.id);
    // setSelectedPlan(monthly[1]);
    // console.log('monthlyPlans', monthlyPlans)
    // }else{
    //     console.log('no plan')
    // }
  }

  useEffect(() => {
    console.log('selectedPlanIndex', selectedPlanIndex)
    console.log('togglePlan', togglePlan)
  }, [selectedPlan, togglePlan])

  //continue monthly plan
  const continueMonthly = () => {
    setIsContinueMonthly(true)
    setShowYearlyPlan(false)
    handleSubscribePlan()
  }

  //continue yearly plan
  const continueYearlyPlan = () => {
    setSelectedDuration(duration[2])
    const planSelected = yearlyPlans[selectedPlanIndex]
    setSelectedPlan(planSelected) //yearlyPlans[selectedPlanIndex]
    // console.log("Selected plan is", planSelected);
    setTogglePlan(planSelected.id)
    setShowYearlyPlan(false)
    handleSubscribePlan()
  }

  //check the profit state
  const checkCanSelectYearly = () => {
    console.log('Selected duration plan is', selectedDuration)
    if (selectedDuration.title === 'Yearly') {
      setShowYearlyPlan(false)
    } else {
      if (isContinueMonthly === false) {
        setShowYearlyPlan(true)
      } else if (isContinueMonthly === true) {
        setShowYearlyPlan(false)
      }
    }
  }

  //handle select plan
  const handleTogglePlanClick = (item, index) => {
    console.log('Selected plan index is', index, item)
    setSelectedPlanIndex(index)
    setTogglePlan(item.id)
    // setSelectedPlan((prevId) => (prevId === item ? null : item));
    setSelectedPlan(item)
  }

  //claim early access
  const handleClaimEarlyAccess = (item, index) => {
    console.log('handleClaimEarlyAccess called with:', { item, index })

    if (!item) {
      console.error('Item is undefined in handleClaimEarlyAccess')
      return
    }

    setSelectedPlanIndex(index)
    setTogglePlan(item.id)
    // setSelectedPlan((prevId) => (prevId === item ? null : item));
    setSelectedPlan(item)
    if (selectedDuration.id === 3) {
      handleSubscribePlan(item)
      return
    }
    if (isContinueMonthly === false) {
      checkCanSelectYearly()
    } else if (isContinueMonthly === true) {
      handleSubscribePlan(item)
    }
  }

  //close add card popup
  const handleClose = async (data) => {
    console.log('Card added details are here', data)
    if (data) {
      const userProfile = await getProfileDetails()
      // Clear failure state when card is successfully added
      setSubscriptionPaymentFailed(false)
      setFailedPlanId(null)

      // Check if subscription was already handled by AgencyAddCard component
      // If data has a status indicating subscription was already processed, don't call again
      if (data.status && data.subscriptionHandled) {
        console.log('✅ Subscription already handled by AgencyAddCard, skipping duplicate call')
        setAddPaymentPopUp(false)
        return
      }
    }
    setAddPaymentPopUp(false)
    // Only retry subscription if it wasn't already handled
    // This prevents duplicate calls when AgencyAddCard already called handleSubscribePlan
    if (!data?.subscriptionHandled) {
      handleSubscribePlan()
    }
  }

  //show the selected plans list
  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    return []
  }

  const getPlans = async () => {
    setLoading(true)
    try {
      console.log('trying to get plans')
      let localData = localStorage.getItem(PersistanceKeys.LocalStorageUser)
      if (localData) {
        let u = JSON.parse(localData)

        const response = await axios.get(Apis.getPlansForAgency, {
          headers: {
            Authorization: `Bearer ${u.token}`,
          },
        })

        if (response.data) {
          setLoading(false)
          if (response.data.status === true) {
            console.log('plans list is: ', response.data.data)
            let plansList =
              response.data.data?.map((plan) => {
                const normalizedTitle = plan?.title?.toLowerCase?.() || ''
                const features = Array.isArray(plan?.features)
                  ? [...plan.features]
                  : []

                const ensureFeature = (label) => {
                  if (
                    !features.some(
                      (feature) =>
                        feature?.text?.toLowerCase?.() === label.toLowerCase(),
                    )
                  ) {
                    features.push({ text: label })
                  }
                }
                // TODO: Replace this when the language features are added to the API response
                if (normalizedTitle === 'growth') {
                  ensureFeature('Multilingual Compatible')
                }

                if (normalizedTitle === 'starter') {
                  ensureFeature('English or Spanish Compatible')
                }

                return {
                  ...plan,
                  features,
                }
              }) || []
            const monthly = []
            const quarterly = []
            const yearly = []
            localStorage.setItem('agencyPlansList', JSON.stringify(plansList))

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

            setMonthlyPlans(monthly)
            setQuaterlyPlans(quarterly)
            setYearlyPlans(yearly)

            selectDefaultPlan(monthly)
          } else {
            console.log('Error in getting plans: ', response.data.message)
          }
        }
      }
    } catch (error) {
      setLoading(false)
      console.log('Error in getPlans: ', error)
    }
  }

  //code to subscribeplan handleSubscribePlan
  //subscribe plan
  const handleSubscribePlan = async (planId = null) => {
    // Determine the actual plan ID to use
    const actualPlanId = planId?.id || planId || togglePlan

    // Check if there was a previous payment failure for this plan
    if (subscriptionPaymentFailed && failedPlanId === actualPlanId) {
      console.log(
        '🧪 Previous payment failure detected for this plan - showing add card modal immediately',
      )
      setAddPaymentPopUp(true)
      return
    }

    // setAddPaymentPopUp(true);
    // return
    console.log('trying to subscribe')
    // code for show plan add card popup
    const D = localStorage.getItem('User')
    let isPaymentMethodAdded = false
    if (D) {
      const userData = JSON.parse(D)
      console.log('userData', userData)
      if (userData.user.cards.length > 0) {
        console.log('Cards are available')
        isPaymentMethodAdded = true
      } else {
        setAddPaymentPopUp(true)
        // return
      }
    }

    if (isPaymentMethodAdded) {
      try {
        setSubPlanLoader(actualPlanId)
        const Token = AuthToken()
        const ApiPath = Apis.subAgencyAndSubAccountPlans
        const formData = new FormData()
        formData.append('planId', actualPlanId)
        for (let [key, value] of formData.entries()) {
          console.log(`${key} = ${value}`)
        }

        const response = await axios.post(ApiPath, formData, {
          headers: {
            Authorization: 'Bearer ' + Token,
          },
        })

        if (response) {
          console.log('Response of subscribe subaccount plan is', response.data)
          setSubPlanLoader(null)
          if (response.data.status === true) {
            // Clear failure state on successful subscription
            setSubscriptionPaymentFailed(false)
            setFailedPlanId(null)

            setErrorMsg(response.data.message)
            setSnackMsgType(SnackbarTypes.Success)
            localStorage.removeItem('subPlan')

            // Check if user is on mobile
            const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
            const SM_SCREEN_SIZE = 640
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              typeof navigator !== 'undefined' ? navigator.userAgent : ''
            )

            if (isFrom === 'addPlan') {
              console.log('call handleCloseModal')
              handleCloseModal(response.data.message)
              return
            }
            
            // Determine redirect path
            let redirectPath = '/agency/dashboard'
            if (isFrom === 'page') {
              // For mobile agencies, redirect to continue to desktop screen
              if (screenWidth <= SM_SCREEN_SIZE || isMobileDevice) {
                console.log('Mobile agency - redirecting to continue to desktop screen')
                redirectPath = '/createagent/desktop'
              } else {
                console.log('Desktop agency - redirecting to dashboard')
                redirectPath = '/agency/dashboard'
              }
            } else {
              // For mobile agencies, redirect to continue to desktop screen
              if (screenWidth <= SM_SCREEN_SIZE || isMobileDevice) {
                console.log('Mobile agency - redirecting to continue to desktop screen')
                redirectPath = '/createagent/desktop'
              } else {
                console.log('Desktop agency - redirecting to verify')
                redirectPath = '/agency/verify'
              }
            }
            
            // Use window.location.href for hard redirect to ensure clean page reload
            // This prevents DOM cleanup errors during navigation
            // Don't set state before redirect - it causes React cleanup errors during navigation
            console.log('✅ Subscription successful, redirecting to:', redirectPath)
            // Use setTimeout to ensure redirect happens in next event loop, avoiding React cleanup conflicts
            setTimeout(() => {
              window.location.href = redirectPath
            }, 0)
            return
          } else if (response.data.status === false) {
            // Check if this is a subscription payment failure (not renewal)
            const isSubscriptionFailure =
              response.data.cardFailed === true &&
              response.data.isSubscription === true

            if (isSubscriptionFailure) {
              console.log(
                '💳 Subscription payment failure detected - will show add card modal on retry',
              )
              setSubscriptionPaymentFailed(true)
              setFailedPlanId(actualPlanId)
              setErrorMsg(
                response.data.message ||
                'Card payment failed. Please add a new payment method and try again.',
              )
              setSnackMsgType(SnackbarTypes.Error)
              // Show add card modal immediately
              setAddPaymentPopUp(true)
            } else {
              // Regular error (not a subscription payment failure)
              setErrorMsg(response.data.message)
              setSnackMsgType(SnackbarTypes.Error)
              if (response.data.message === 'No payment method added') {
                setAddPaymentPopUp(true)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error occured in sub plan api is', error)
        setSubPlanLoader(null)
      }
    }
  }

  const getArray = (index) => {
    let array1 = [
      'Unlimited Minutes',
      'Unlimited Agents',
      'Unlimited Teams',
      'LLMs (AssignX, OpenAI, Llama, Gemini) ',
      '7000+ Integrations',
      'Mins roll over for 6 months',
      'Custom Monthly Plans',
    ]

    let array2 = [
      'Agents',
      'Unlimited Agents',
      'Unlimited Teams',
      '1000+ Integrations',
      'Mins roll over for 6 months',
    ]

    if (index === 0) {
      return array1
    } else {
      return array2
    }
  }

  // Helper functions for mobile layout
  const getMonthlyPrice = (plan) => {
    if (!plan) return 0
    return plan.originalPrice || plan.discountedPrice || 0
  }

  const getTotalPrice = (plan) => {
    if (!plan) return 0
    const monthlyPrice = getMonthlyPrice(plan)
    if (selectedDuration.id === 1) return monthlyPrice
    if (selectedDuration.id === 2) return monthlyPrice * 3
    if (selectedDuration.id === 3) return monthlyPrice * 12
    return monthlyPrice
  }

  const handlePlanSelect = (plan) => {
    if (disAblePlans) return
    setSelectedPlan(plan)
    setTogglePlan(plan.id)
  }

  const handleContinueClick = async () => {
    if (!selectedPlan) return

    const hasPM = () => {
      try {
        const localData = localStorage.getItem('User')
        if (localData) {
          const userData = JSON.parse(localData)
          const cards = userData?.data?.user?.cards || userData?.user?.cards
          if (Array.isArray(cards) && cards.length > 0) {
            return true
          }
        }
        return false
      } catch (error) {
        return false
      }
    }

    const isFreePlan = getTotalPrice(selectedPlan) === 0

    if (isFreePlan) {
      await handleSubscribePlan(selectedPlan.id)
    } else {
      if (hasPM()) {
        await handleSubscribePlan(selectedPlan.id)
      } else {
        setAddPaymentPopUp(true)
      }
    }
  }

  // Mobile layout
  if (isMobile) {
    const currentPlans = getCurrentPlans()
    const monthlyPrice = selectedPlan ? getMonthlyPrice(selectedPlan) : 0
    const totalPrice = selectedPlan ? getTotalPrice(selectedPlan) : 0

    return (
      <div className="h-screen bg-gradient-to-br from-brand-primary/40 via-white to-brand-primary/40 relative overflow-hidden flex flex-col w-full">
        {/* Background blur effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -left-1/4 -top-1/4 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-1/4 -bottom-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Scrollable Container */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Main Card - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-40 min-h-0">
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
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                      {duration.map((dur) => (
                        <button
                          key={dur.id}
                          onClick={() => {
                            setSelectedDuration(dur)
                            setSelectedPlan(null)
                          }}
                          className={`flex-shrink-0 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${selectedDuration.id === dur.id
                              ? 'bg-brand-primary text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {dur.title}
                          {durationSaving.find(s => s.id === dur.id) && (
                            <span className="ml-1 text-xs opacity-90">
                              ({durationSaving.find(s => s.id === dur.id).title})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plan Selection */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <CircularProgress size={35} />
                  </div>
                ) : currentPlans.length > 0 ? (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Select Plan
                    </label>
                    {currentPlans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedPlan?.id === plan.id
                            ? 'border-brand-primary bg-brand-primary/5'
                            : 'border-gray-200 hover:border-brand-primary/30'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-gray-900 capitalize">
                                {plan.title}
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
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-2xl font-bold text-gray-900">
                                ${formatDecimalValue(getMonthlyPrice(plan))}
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No plans available
                  </div>
                )}

                {/* Order Summary */}
                {selectedPlan && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-3">Plan Details</h3>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {selectedPlan.title}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {selectedDuration.title} Subscription
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${formatDecimalValue(getMonthlyPrice(selectedPlan))}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Billed</span>
                        <span className="font-semibold text-gray-900">
                          ${formatDecimalValue(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Due */}
                {selectedPlan && (
                  <div className="bg-brand-primary rounded-xl p-4 text-white">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-3xl font-bold">${formatDecimalValue(totalPrice)}</p>
                        <p className="text-sm text-purple-100 mt-1">Due Today</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Bottom Section with Continue Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
            <div className="max-w-md mx-auto px-6 pt-4 pb-6 space-y-3">
              {/* Terms and Conditions */}
              <p className="text-xs text-center text-gray-500">
                By continuing you agree to{' '}
                <span className="text-brand-primary font-semibold">Terms & Conditions</span>
              </p>

              {/* Continue Button */}
              <button
                onClick={handleContinueClick}
                disabled={!selectedPlan || subPlanLoader}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all ${!selectedPlan || subPlanLoader
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-brand-primary hover:opacity-90 shadow-lg active:scale-98'
                  }`}
              >
                {subPlanLoader ? (
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
              <AgencyAddCard
                key="agency-add-card"
                handleClose={handleClose}
                selectedPlan={selectedPlan}
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

  // Desktop layout (existing code)
  return (
    <div
      // style={backgroundImage}
      className={`flex flex-col items-center ${isFrom === 'addPlan' || isFrom === 'page' ? 'w-[100%] px-6 max-h-[100%]' : 'w-[90%] h-[90%]'}`}
    >
      <div
        className="flex flex-col items-center w-full "
        style={
          {
            // overflow: "hidden", // Prevent scrolling on the entire modal
            // scrollbarWidth: "none",
            // msOverflowStyle: "none",scrollbar-hide
          }
        }
      >
        <AgentSelectSnackMessage
          isVisible={errorMsg !== null}
          message={errorMsg}
          hide={() => {
            setErrorMsg(null)
          }}
          type={snackMsgType}
        />

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

            <div className={`w-[100%]`}>
              <ProgressBar value={100} />
            </div>
          </div>
        )}

        <div className="flex flex-row w-full items-end justify-between">
          <div className="flex flex-col items-start mt-4">
            <div
              style={{
                fontSize: 22,
                fontWeight: '600',
                marginTop: 20,
              }}
            >
              {/*`AI Agents from just $1.50/day`*/}
              Get an AI AaaS Agency
            </div>

            <div className="flex flex-row items-center gap-1">
              <span
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >{`Gets more done than coffee. Cheaper too.`}</span>
              <span>😉</span>
            </div>
          </div>


        </div>
        <div className="flex flex-col items-end w-full mt-6">
          <div className="flex flex-row items-center justify-end gap-2 px-2 me-[33px] md:me-[7px]  w-auto">
            {durationSaving.map((item) => {
              return (
                <button
                  key={item.id}
                  className={
                    `px-2 py-1 rounded-tl-lg rounded-tr-lg font-semibold text-[13px] ${selectedDuration.id === item.id ? 'text-white bg-brand-primary outline-none border-none' : 'text-muted-foreground'}`
                  }
                  onClick={() => {
                    setSelectedDuration(item);
                    getCurrentPlans();
                  }}
                >
                  {item.title}
                </button>
              )
            })}
          </div>
          <div className="w-full flex md:w-auto flex-col items-center md:items-end justify-center md:justify-end">
            <div
              className="border flex flex-row items-center bg-neutral-100 px-2 gap-[8px] rounded-full py-1.5 w-[80%] md:w-auto justify-center md:justify-start"
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
        <SelectYearlypopup
          showYearlyPlan={showYearlyPlan}
          duration={selectedDuration?.title}
          continueMonthly={continueMonthly}
          continueYearlyPlan={() => {
            continueYearlyPlan()
          }}
          handleClose={() => {
            setSelectedPlanIndex(null)
            setTogglePlan(null)
            setSelectedPlan(null)
            setShowYearlyPlan(false)
          }}
        />

        <div
          className="flex flex-row gap-5 w-full h-auto mt-4 pb-8"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            flexShrink: 0,
            alignItems: 'stretch',
            justifyContent:
              getCurrentPlans()?.length * 300 > (typeof window !== 'undefined' ? window.innerWidth : 1200)
                ? 'start'
                : 'center',
          }}
        >
          {loading ? (
            <div className="mt-9">
              <CircularProgress size={35} />
            </div>
          ) : (
            getCurrentPlans().length > 0 &&
            getCurrentPlans()?.map((item, index) => {
              const isCurrentPlan = isPlanCurrent(item)
              return item ? (
                <button
                  key={item.id}
                  onClick={() => {
                    if (disAblePlans) {
                      return
                    }
                    handleTogglePlanClick(item, index)
                    const currentItem = item
                    const currentIndex = index
                    if (currentItem && currentItem.id) {
                      handleClaimEarlyAccess(currentItem, currentIndex)
                    } else {
                      console.error(
                        'Item or item.id is undefined:',
                        currentItem,
                      )
                    }
                  }}
                  disabled={disAblePlans || (isCurrentPlan && currentUserPlan?.status !== 'cancelled')}
                  onMouseEnter={() => {
                    if (!isCurrentPlan || currentUserPlan?.status === 'cancelled') {
                      console.log('Hover entered on plan', item.tag)
                      setHoverPlan(item)
                    }
                  }}
                  onMouseLeave={() => {
                    setHoverPlan(null)
                  }}
                  className={
                    `flex flex-col items-center rounded-lg flex-shrink-0 border p-2 ${!isCurrentPlan || currentUserPlan?.status === 'cancelled' ? 'hover:p-2 hover:bg-gradient-to-b hover:from-brand-primary hover:to-brand-primary/40' : ''} ${selectedPlan?.id === item.id && (!isCurrentPlan || currentUserPlan?.status === 'cancelled') ? 'bg-gradient-to-t from-brand-primary to-brand-primary/40 p-2' : 'opacity-75 cursor-not-allowed'}`
                  }
                  style={{
                    width: '280px',
                    overflow: 'hidden',
                    scrollbarWidth: 'none',
                  }}
                >
                  <div className="flex flex-col items-center h-auto w-full">
                    <div className="pb-2">
                      {item.tag ? (
                        <div className=" flex flex-row items-center gap-2">
                          {(selectedPlan?.id === item.id ||
                            hoverPlan?.id === item.id) &&
                            (!isCurrentPlan || currentUserPlan?.status === 'cancelled') ? (
                            <Image
                              src="/svgIcons/powerWhite.svg"
                              height={24}
                              width={24}
                              alt="*"
                            />
                          ) : (
                            <div
                              className="icon-brand-primary"
                              style={{
                                '--icon-mask-image': `url('/svgIcons/power.svg')`,
                              }}
                            >
                              <Image
                                src="/svgIcons/power.svg"
                                height={24}
                                width={24}
                                alt="*"
                              />
                            </div>
                          )}

                          <div
                            className={`text-base font-bold ${selectedPlan?.id === item.id || hoverPlan?.id === item.id && (!isCurrentPlan || currentUserPlan?.status === 'cancelled') ? 'text-white' : 'text-brand-primary'}`}
                          >
                            {item.tag}
                          </div>
                          {(selectedPlan?.id === item.id ||
                            hoverPlan?.id === item.id) &&
                            (!isCurrentPlan || currentUserPlan?.status === 'cancelled') ? (
                            <Image
                              src="/svgIcons/enterArrowWhite.svg"
                              height={20}
                              width={20}
                              alt="*"
                            />
                          ) : (
                            <div
                              className="icon-brand-primary"
                              style={{
                                width: '20px',
                                height: '20px',
                                '--icon-mask-image': `url('/svgIcons/enterArrow.svg')`,
                              }}
                            >
                              <Image
                                src="/svgIcons/enterArrow.svg"
                                height={20}
                                width={20}
                                alt="*"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-[4vh]"></div>
                      )}
                    </div>
                    <div className="flex flex-col items-center rounded-lg gap-2 bg-white w-full h-full">
                      {/* Header section - fixed height */}
                      <div className="flex flex-col items-center w-full flex-shrink-0">
                        {/* Top section */}
                        <div className="text-3xl font-semibold mt-2 capitalize">
                          {item.title}
                        </div>

                        {/* Pricing */}
                        <div className="flex flex-row items-center gap-2">
                          <span className="text-4xl mt-4 font-semibold text-brand-primary  bg-clip-text ">
                            ${formatDecimalValue(getMonthlyPrice(item))}
                          </span>
                          
                        </div>

                        <div
                          className={`text-center mt-1 ${disAblePlans && 'w-full border-b border-foreground/40 pb-2'}`}
                          style={{ fontSize: 15, fontWeight: '400' }}
                        >
                          {selectedDuration.title === 'Monthly'
                            ? 'Billed Monthly'
                            : selectedDuration.title === 'Quarterly'
                              ? 'Billed Quarterly'
                              : selectedDuration.title === 'Yearly'
                                ? 'Billed Annually'
                                : '-'}
                        </div>
                        {/*
                                                            <div className='text-center mt-1' style={{ fontSize: 17, fontWeight: '600' }}>
                                                                {item.capabilities?.affiliatePercent}% Rev Share
                                                            </div>
    
                                                            <div className='text-center ' style={{ fontSize: 15, fontWeight: '500' }}>
                                                                ${item?.capabilities?.aiCreditRate?.toFixed(2)} per min
                                                            </div>
                                                        */}

                        {!disAblePlans &&
                          (!isCurrentPlan || currentUserPlan?.status === 'cancelled') &&
                          (subPlanLoader === item.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <div
                              className="w-[95%] py-3.5 h-[50px] mt-3 bg-brand-primary rounded-lg text-white cursor-pointer hover:bg-brand-primary/90 transition-colors"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleTogglePlanClick(item, index)
                                const currentItem = item
                                const currentIndex = index
                                if (currentItem && currentItem.id) {
                                  handleClaimEarlyAccess(currentItem, currentIndex)
                                }
                              }}
                              style={{
                                fontSize: 16.8,
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {selectedPlan?.id === item.id
                                ? 'Continue'
                                : 'Get Started'}
                            </div>
                          ))
                        }

                        {/* Features container - scrollable */}
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

                            {Array.isArray(item?.features) &&
                              item?.features?.map((feature) => (
                                <div
                                  key={feature.text}
                                  className="flex flex-row items-start gap-3 mb-3 w-full"
                                >
                                  <Checkbox
                                    checked={true}
                                    className="!rounded-full h-4 w-4 flex-shrink-0 border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                  />
                                  <div
                                    className="flex flex-row items-center gap-2"
                                    style={{
                                      whiteSpace: 'nowrap',
                                      width: '100%',
                                      borderWidth: 0,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    <div
                                      style={{
                                        ...styles.regularFont,
                                        textAlign: 'left',
                                        borderWidth: 0,
                                      }}
                                    >
                                      {feature.text}
                                    </div>
                                    {feature?.subtext && (
                                      <div
                                        style={{
                                          ...styles.regularFont,
                                          textAlign: 'left',
                                          borderWidth: 0,
                                          color: 'hsl(var(--muted-foreground))',
                                        }}
                                      >
                                        {feature?.subtext?.toLowerCase() ===
                                          'upsell' ? (
                                          '(Upsell)'
                                        ) : feature?.subtext?.toLowerCase() ===
                                          'coming soon' ? (
                                          '(coming soon)'
                                        ) : (
                                          <Tooltip
                                            title={feature.subtext}
                                            placement="top"
                                            arrow
                                            componentsProps={{
                                              tooltip: {
                                                sx: {
                                                  backgroundColor: 'hsl(var(--card))',
                                                  color: 'hsl(var(--card-foreground))',
                                                  fontSize: '14px',
                                                  padding: '10px 15px',
                                                  borderRadius: '8px',
                                                  boxShadow:
                                                    '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                                },
                                              },
                                              arrow: {
                                                sx: {
                                                  color: 'hsl(var(--card))',
                                                },
                                              },
                                            }}
                                          >
                                            <Image
                                              src="/otherAssets/infoLightDark.png"
                                              alt="info"
                                              width={12}
                                              height={12}
                                              className="cursor-pointer rounded-full"
                                            />
                                          </Tooltip>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ) : null
            })
          )}
        </div>

        {/*
                        <div className='w-3/12 flex flex-col items-start gap-3 mt-10 p-6 rounded-2xl border h-auto'>
    
                            <div style={{ fontSize: 24, fontWeight: '700' }}>
                                Whitelabel
                            </div>
    
                            <div style={{ fontSize: 20, fontWeight: '700' }}>
                                Contact our team
                            </div>
    
                            <div
                                style={{
                                    height: '358px',
                                    width: '100%',
                                    backgroundImage: "url('/svgIcons/contactTeamBg.svg')",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    borderRadius: 20,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 30,
                                    marginTop: 40
                                }}
                            >
                                <div style={{ fontSize: 35, fontWeight: '700', color: 'white', marginTop: 40 }}>
                                    Run your agency SaaS
                                </div>
    
                                <button
                                    className='w-full pv-2 bg-white rounded-lg h-[55px] items-center mt-[50px] text-purple items-center
    
                                    '
                                    style={{
                                        alignSelf: 'center'
                                    }}
                                >
                                    Contact Our Team
                                </button>
    
                            </div>
    
    
                        </div>
                    */}

        {/* Code for add payment modal */}
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
                <div className="flex flex-row justify-end w-full items-center pe-4 pt-4">
                  <CloseBtn
                    onClick={() => {
                      setAddPaymentPopUp(false)
                      setIsContinueMonthly(false)
                      // Clear failure state when user manually closes modal
                      setSubscriptionPaymentFailed(false)
                      setFailedPlanId(null)
                    }}
                  />
                </div>
                <Elements stripe={stripePromise}>
                  <AgencyAddCard
                    handleClose={handleClose}
                    selectedPlan={selectedPlan}
                  // togglePlan={togglePlan}
                  />
                </Elements>
              </div>
            </div>
          </Box>
        </Modal>

        {/* Redirecting Loader Overlay */}
        {isRedirecting && (
          <LoaderAnimation
            isOpen={isRedirecting}
            title="Redirecting to dashboard..."
          />
        )}

        {/* 
                <div className="w-full mt-2 flex flex-row items-center justify-center">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            if (typeof document !== "undefined") {
                                document.cookie =
                                    "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                            }
                            router.push("/");
                        }}
                        className="text-red bg-[#FF4E4E40] font-[600] text-lg px-4 py-1 rounded-full"
                    >
                        Log out
                    </button>
                </div> */}
      </div>
    </div>
  )
}

export default AgencyPlans

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
    borderTop: '50px solid hsl(var(--brand-primary))', // Increased height again for more padding
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
    color: 'hsl(var(--brand-primary) / 0.4)',
    fontSize: 18,
    fontWeight: '600',
  },
  discountedPrice: {
    color: 'hsl(var(--foreground))',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: '10px',
    whiteSpace: 'nowrap',
  },
  regularFont: {
    fontSize: 16,
    fontWeight: '400',
  },
}
