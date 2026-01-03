import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import moment from 'moment'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { getNextChargeDate } from '@/components/userPlans/UserPlanServices'
import SignupHeaderMobile from './SignupHeaderMobile'
import LoaderAnimation from '@/components/animations/LoaderAnimation'
import { useUser } from '@/hooks/redux-hooks'
function PlanSummaryMobile({ selectedPlan,
   onMakePayment, onEditPayment, isRedirecting: isRedirectingProp, handleBack ,
  
  isSubscribing,
  setIsSubscribing,
}) {
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isRedirecting, setIsRedirecting] = useState(false)
  const [currentUserPlan, setCurrentUserPlan] = useState(null)

  const {user:reduxUser} = useUser()

  useEffect(() => {
    getCardsList()
    getCurrentUserPlan()
  }, [])

  const getCurrentUserPlan = () => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const userData = JSON.parse(localData)
      const plan = userData.user?.plan
      console.log('Current user plan from localStorage:', plan)
      setCurrentUserPlan(plan)
      return plan
    }
    return null
  }

  const GetMonthCountFronBillingCycle = (billingCycle) => {
    if (billingCycle === 'monthly') return 1
    if (billingCycle === 'quarterly') return 3
    if (billingCycle === 'yearly') return 12
    return 1
  }

  const getCardsList = async () => {
    try {
      setLoading(true)
      const Token = AuthToken()
      const ApiPath = Apis.getCardsList

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${Token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response?.data?.status === true && response.data.data?.length > 0) {
        // Get the default card or first card
        const defaultCard = response.data.data.find((c) => c.isDefault) || response.data.data[0]
        setCard(defaultCard)
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">No plan selected</div>
      </div>
    )
  }

  // Calculate plan details
  const planDuration = selectedPlan.duration || selectedPlan.billingCycle || 'monthly'
  const planPrice = selectedPlan.discountedPrice || selectedPlan.discountPrice || selectedPlan.originalPrice || 0
  const planTitle = selectedPlan.title || selectedPlan.name || 'Plan'
  
  // Calculate duration label
  let durationLabel = 'Monthly Subscription'
  if (planDuration === 'quarterly') {
    durationLabel = 'Quarterly Subscription'
  } else if (planDuration === 'yearly') {
    durationLabel = 'Annual Subscription'
  }

  // Calculate total price with trial logic (matching UserAddCardModal)
  const calculateTotalPrice = () => {
    // Check if plan has trial and user is subscribing for the first time
    const hasTrial = selectedPlan?.hasTrial === true
    const isFirstTimeSubscription = !currentUserPlan || currentUserPlan.planId === null

    // If plan has trial and user has no previous plan, show $0
    if (hasTrial && isFirstTimeSubscription) {
      return 0
    }

    const billingMonths = GetMonthCountFronBillingCycle(planDuration)
    const monthlyPrice = planPrice
    return billingMonths * monthlyPrice
  }

  const totalPrice = calculateTotalPrice()

  // Calculate next charge date
  const nextChargeDate = getNextChargeDate(planDuration)

  // Format card expiry
  const formatCardExpiry = (card) => {
    if (!card?.expMonth || !card?.expYear) return '12/28'
    const month = String(card.expMonth).padStart(2, '0')
    const year = String(card.expYear).slice(-2)
    return `${month}/${year}`
  }

  // Get card brand image
  const getCardBrandImage = (brand) => {
    const brandLower = brand?.toLowerCase() || 'visa'
    if (brandLower === 'visa') return '/svgIcons/Visa.svg'
    if (brandLower === 'mastercard') return '/svgIcons/Mastercard.svg'
    if (brandLower === 'amex' || brandLower === 'american express') return '/svgIcons/Amex.svg'
    return '/svgIcons/Visa.svg'
  }

  // Handle payment with loading states
  const handleMakePayment = async () => {
    try {
      setIsSubscribing(true)
      await onMakePayment()
      // If payment succeeds, the parent will handle redirect
      // Set redirecting state after a short delay to show transition
      setTimeout(() => {
        setIsRedirecting(true)
      }, 500)
    } catch (error) {
      console.error('Payment error:', error)
      setIsSubscribing(false)
    }
  }

  // Use prop if provided, otherwise use internal state
  const showRedirecting = isRedirectingProp !== undefined ? isRedirectingProp : isRedirecting

  return (
    <div className="flex flex-col items-center h-full w-full h-full">
      <SignupHeaderMobile  title={reduxUser?.userRole == 'Agency' ? "Get an AI AaaS Agency" : "Grow Your Business"}
       description={reduxUser?.userRole == 'Agency' || reduxUser?.userRole == 'AgencySubAccount' ? "Gets more done than coffee. Cheaper too.😉" : "Gets more done than coffee. Cheaper too. Cancel anytime.😉"}  />
      
      {/* Purple to Pink Gradient Background */}
      <div
        className="flex-1 w-full flex items-center justify-center pb-8"
        style={{
          position: 'absolute',
           top: '28vh',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* White Card */}
        <div className="w-[90%] max-w-md h-auto bg-white rounded-2xl shadow-2xl px-6 py-4 mt-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-black mb-6">Review & Confirm</h1>

          {/* Payment Method Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {card ? (
                  <>
                    <Image
                      src={getCardBrandImage(card.brand)}
                      alt={card.brand || 'Card'}
                      width={40}
                      height={25}
                      className="object-contain"
                    />
                    <div>
                      <div className="text-base font-semibold text-black">
                        **** {card.last4 || '1234'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expiry: {formatCardExpiry(card)}
                      </div>
                    </div>
                  </>
                ) : (
                ""
                )}
              </div>
              { onEditPayment && card && (
                <button
                  onClick={onEditPayment}
                  className="text-purple-600 font-medium text-sm hover:text-purple-700"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-base font-semibold text-black">
                    {planTitle}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {durationLabel}
                  </div>
                </div>
                <div className="text-base font-semibold text-black">
                ${formatFractional2(planPrice)}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Billed {planDuration === 'yearly' ? 'Annually' : planDuration === 'quarterly' ? 'Quarterly' : 'Monthly'}:</span>
                  <span className="text-base font-semibold text-black">
                    {(() => {
                      // Check if plan has trial and user is subscribing for the first time
                      const hasTrial = selectedPlan?.hasTrial === true
                      const isFirstTimeSubscription = !currentUserPlan || currentUserPlan.planId === null

                      // If plan has trial and user has no previous plan, show $0
                      if (hasTrial && isFirstTimeSubscription) {
                        return '$0'
                      }

                      const billingMonths = GetMonthCountFronBillingCycle(planDuration)
                      const monthlyPrice = planPrice
                      return `$${formatFractional2(billingMonths * monthlyPrice)}`
                    })()}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Next Charge: {moment(getNextChargeDate(selectedPlan)).format('MMMM DD,YYYY')}
                </div>
              </div>
            </div>
          </div>

          {/* Total Section */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-bold text-black">Total:</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-black">
                  {(() => {
                    if (!selectedPlan) return '$0'

                    // Check if plan has trial and user is subscribing for the first time
                    const hasTrial = selectedPlan?.hasTrial === true
                    const isFirstTimeSubscription = !currentUserPlan || currentUserPlan.planId === null

                    // If plan has trial and user has no previous plan, show $0
                    if (hasTrial && isFirstTimeSubscription) {
                      return '$0'
                    }

                    const billingMonths = GetMonthCountFronBillingCycle(planDuration)
                    const monthlyPrice = planPrice
                    return `$${formatFractional2(billingMonths * monthlyPrice)}`
                  })()}
                </div>
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: 13,
                    marginTop: 4,
                    color: '#8A8A8A',
                  }}
                >
                  Due Today
                </div>
              </div>
            </div>
          </div>

          {/* Make Payment Button */}
          <button
            onClick={handleMakePayment}
            disabled={isSubscribing || showRedirecting}
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl text-lg hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubscribing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Payment...
              </>
            ) : (

              selectedPlan?.hasTrial == true ? 'Start Trial' : 'Continue'
            )}
          </button>

          <div className="w-full flex flex-row justify-start">
          <button
            onClick={handleBack}
            className=" text-brand-primary font-semibold py-4 rounded-xl text-lg hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Back
          </button>
          </div>
        </div>
      </div>

      {/* Redirect Loading Overlay */}
      {showRedirecting && (
        <LoaderAnimation
          open={showRedirecting}
          title="Redirecting to dashboard..."
        />
      )}
    </div>
  )
}

export default PlanSummaryMobile
