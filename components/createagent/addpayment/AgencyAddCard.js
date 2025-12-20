// import { CardPostalCodeElement } from '@stripe/react-stripe-js';
import {
  Alert,
  Button,
  CircularProgress,
  Fade,
  Slide,
  Snackbar,
} from '@mui/material'
// import stripe
import {
  CardCvcElement,
  CardElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { formatDecimalValue } from '@/components/agency/agencyServices/CheckAgencyData'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import Apis from '@/components/apis/Apis'
import { getPolicyUrls } from '@/utils/getPolicyUrls'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import {
  checkReferralCode,
  getNextChargeDate,
} from '@/components/userPlans/UserPlanServices'

// import Apis from '../Apis/Apis';

const AgencyAddCard = ({
  subscribePlan,
  subscribeLoader,
  fromMYPlansScreen,
  closeAddCardPopup,
  handleClose,
  togglePlan,
  setAddPaymentSuccessPopUp,
  textBelowContinue = '',
  selectedUser,
  fromAdmin = false,
  selectedPlan,
}) => {
  const stripeReact = useStripe()
  const elements = useElements()
  ////console.log
  ////console.log

  const [inviteCode, setInviteCode] = useState('')

  const [addCardLoader, setAddCardLoader] = useState(false)
  const [credentialsErr, setCredentialsErr] = useState(false)
  const [addCardSuccess, setAddCardSuccess] = useState(false)
  const [addCardFailure, setAddCardFailure] = useState(false)
  const [addCardDetails, setAddCardDetails] = useState(null)
  const [addCardErrtxt, setAddCardErrtxt] = useState(null)
  const [isWideScreen, setIsWideScreen] = useState(false)
  const cardNumberRef = useRef(null)
  const cardExpiryRef = useRef(null)
  const cardCvcRef = useRef(null)
  const referralRequestSeqRef = useRef(0)
  const isSubscribingRef = useRef(false) // Prevent duplicate subscription calls

  //check for button
  const [CardAdded, setCardAdded] = useState(false)
  const [CardExpiry, setCardExpiry] = useState(false)
  const [CVC, setCVC] = useState(false)

  //agree terms
  const [agreeTerms, setAgreeTerms] = useState(true)

  //disable continue btn after the card added
  const [disableContinue, setDisableContinue] = useState(false)

  // Autofocus the first field when the component mounts

  // referral code validation states
  const [referralStatus, setReferralStatus] = useState('idle') // idle | loading | valid | invalid
  const [referralMessage, setReferralMessage] = useState('')
  const [promoCodeDetails, setPromoCodeDetails] = useState(null) // Store promo code discount details
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640
    }
    return false
  })
  const [isMediumScreen, setIsMediumScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200
    }
    return false
  })
  const [isPreSelectedPlanTriggered, setIsPreSelectedPlanTriggered] =
    useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUserPlan, setCurrentUserPlan] = useState(null)

  useEffect(() => {
    // //console.log;
    if (cardNumberRef.current) {
      // //console.log;
      cardNumberRef.current.focus()
    }
    getCurrentUserPlan()
    
    // Check screen size on mount and resize
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsSmallScreen(width < 640)
      setIsMediumScreen(width < 1200)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
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

  useEffect(() => {
    if (!inviteCode || inviteCode.trim().length === 0) {
      setReferralStatus('idle')
      setReferralMessage('')
      setPromoCodeDetails(null)
      return
    }

    setReferralStatus('loading')
    setReferralMessage('')
    setPromoCodeDetails(null)
    referralRequestSeqRef.current += 1
    const currentSeq = referralRequestSeqRef.current

    const timer = setTimeout(async () => {
      try {
        // Include planId if a plan is selected for better discount calculation
        const planId = selectedPlan?.id || null

        const resp = await checkReferralCode(inviteCode.trim(), planId)

        // Check if this request is still current
        if (currentSeq !== referralRequestSeqRef.current) return

        if (resp && resp.status) {
          setReferralStatus('valid')
          setReferralMessage(resp.message || 'Code applied')

          // Store promo code details if it's a discount promo
          if (
            resp.data?.codeType === 'promo' &&
            resp.data?.promoType === 'discount'
          ) {
            setPromoCodeDetails(resp.data)
          } else {
            setPromoCodeDetails(null)
          }
        } else {
          setReferralStatus('invalid')
          setReferralMessage((resp && resp.message) || 'Invalid code')
          setPromoCodeDetails(null)
        }
      } catch (e) {
        // Check if this request is still current
        if (currentSeq !== referralRequestSeqRef.current) return
        setReferralStatus('invalid')
        setReferralMessage('Unable to validate code. Please try again.')
        setPromoCodeDetails(null)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [inviteCode, selectedPlan?.id])

  //handle agree terms toggle btn
  const handleToggleTermsClick = () => {
    setAgreeTerms(!agreeTerms)
  }

  // Handle field change to focus on the next input
  const handleFieldChange = (event, ref) => {
    if (event.complete && ref.current) {
      ref.current.focus()
    }
  }
  // const [selectedUserPlan, setSelectedUserPlan] = useState(null);

  if (!stripeReact || !elements) {
    ////console.log;
    ////console.log
    ////console.log
    return <div>Loading stripe</div>
  } else {
    ////console.log;
  }
  const handleBackClick = (e) => {
    e.preventDefault()
    handleBack()
  }
  const elementOptions = {
    style: {
      base: {
        backgroundColor: 'transparent',
        color: '#000000',
        fontSize: '18px',
        lineHeight: '40px',
        borderRadius: 10,
        padding: 10,
        '::placeholder': {
          color: '#00000050',
        },
      },
      invalid: {
        color: 'red',
      },
    },
  }

  //function to add card
  const handleAddCard = async (e) => {
    setAddCardLoader(true)
    setDisableContinue(true)
    if (stop) {
      stop(false)
      setDisableContinue(false)
    }
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    const LocalData = localStorage.getItem('User')
    const D = JSON.parse(LocalData)
    // //console.log;
    const AuthToken = D.token
    if (!stripeReact || !elements) {
      setDisableContinue(false)
      return
    } else {
      ////console.log;
    }

    const res = await fetch(Apis.createSetupIntent, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AuthToken}`,
      },
      body: JSON.stringify({ id: 123 }),
    })

    const data = await res.json()
    console.log('Setup intent response is ', data)

    const result = await stripeReact.confirmCardSetup(data.data, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: D.user.name,
        },
      },
    })

    console.log('Result confirm payment', result)

    if (result.error) {
      setAddCardLoader(false)
      console.log('Error confirm payment')
      setAddCardFailure(true)
      setAddCardErrtxt(
        result.error.message || 'Error confirming payment method',
      )
      setDisableContinue(false)
      // setStatus(`Error: ${result.error.message}`);
    } else {
      // console.log("Result", JSON.stringify(result.setupIntent));
      let id = result.setupIntent.payment_method
      // setStatus("Success! Card is ready for auto-payment.");
      // console.log("Payment method ID:", id);

      // Save paymentMethod ID to your server (for later cron charging)
      // Step 3: Send payment method ID to backend to attach to customer

      let requestBody = null
      if (fromAdmin) {
        requestBody = {
          source: id,
          inviteCode: inviteCode,
          userId: selectedUser.id,
        }
      } else {
        requestBody = {
          source: id,
          inviteCode: inviteCode,
        }
      }
      console.log('Request data sending in api is', requestBody)
      const addCardRes = await fetch(Apis.addCard, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result2 = await addCardRes.json()
      console.log('Result is ', result2)
      setAddCardLoader(false)
      if (result2.status) {
        setAddCardSuccess(true)
        if (!togglePlan) {
          // No plan to subscribe, just close
          handleClose(result)
        } else if (togglePlan && !isSubscribingRef.current) {
          // Only call subscribe if not already subscribing
          // handleSubscribePlan will call handleClose with subscriptionHandled flag
          handleSubscribePlan()
        }
      } else {
        setAddCardFailure(true)
        setAddCardErrtxt(result2.message)
        setDisableContinue(false)
      }
    }
  }

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    // Prevent duplicate calls
    if (isSubscribingRef.current) {
      console.log('⚠️ Subscription already in progress, skipping duplicate call')
      return
    }

    try {
      isSubscribingRef.current = true // Set flag to prevent duplicate calls
      
      let planType = null

      //// //console.log;

      if (togglePlan === 1) {
        planType = 'Plan30'
      } else if (togglePlan === 2) {
        planType = 'Plan120'
      } else if (togglePlan === 3) {
        planType = 'Plan360'
      } else if (togglePlan === 4) {
        planType = 'Plan720'
      }

      // //console.log;

      setAddCardLoader(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      // //console.log;

      const ApiData = {
        plan: planType,
      }

      // //console.log;

      const ApiPath = Apis.subscribePlan
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
          // Mark that subscription was handled to prevent duplicate calls
          const responseWithFlag = {
            ...response.data,
            subscriptionHandled: true,
          }
          handleClose(responseWithFlag)
          if (setAddPaymentSuccessPopUp) setAddPaymentSuccessPopUp(true)
        }
      }
    } catch (error) {
      console.error("Error occurred in subscribe plan api:", error)
    } finally {
      setAddCardLoader(false)
      isSubscribingRef.current = false // Reset flag after completion
    }
  }

  const scalePlanValue = () => {
    console.log('Scale plan value passed is', selectedPlan)
    if (!selectedPlan || !selectedPlan.originalPrice) {
      return '-'
    }
    if (selectedPlan.duration === 'monthly') {
      return '$' + formatFractional2(selectedPlan.originalPrice)
    } else if (selectedPlan.duration === 'quarterly') {
      return '$' + formatFractional2(selectedPlan.originalPrice * 3)
    } else if (selectedPlan.duration === 'yearly') {
      return '$' + formatFractional2(selectedPlan.originalPrice * 12)
    } else {
      return '-'
    }
  }

  const commitmentCalculation = () => {
    console.log('Scale plan value passed is', selectedPlan)
    if (!selectedPlan || !selectedPlan.originalPrice) {
      return '-'
    }
    if (selectedPlan.duration === 'monthly') {
      return '$' + formatDecimalValue(selectedPlan.originalPrice)
    } else if (selectedPlan.duration === 'quarterly') {
      return '$' + formatDecimalValue(selectedPlan.originalPrice * 3)
    } else if (selectedPlan.duration === 'yearly') {
      return '$' + (selectedPlan.originalPrice * 12).toLocaleString()
    } else {
      return '-'
    }
  }

  const timeCalculator = () => {
    const duration = selectedPlan?.duration
    const startDate = new Date()
    const endDate = new Date(startDate)
    console.log('End date is', endDate.setMonth(endDate.getMonth() + 1))
    if (duration === 'monthly') {
      return endDate.setMonth(endDate.getMonth() + 1)
    } else if (duration === 'quarterly') {
      return endDate.setMonth(endDate.getMonth() + 4)
    } else if (duration === 'yearly') {
      return endDate.setMonth(endDate.getMonth() + 12)
    } else {
      return '-'
    }
  }

  const getMonthsCount = () => {
    if (!selectedPlan) {
      return 1
    }
    return selectedPlan.duration === 'monthly'
      ? 1
      : selectedPlan.duration === 'quarterly'
        ? 3
        : 12
  }

  const GetMonthCountFronBillingCycle = (billingCycle) => {
    if (billingCycle === 'monthly') return 1
    if (billingCycle === 'quarterly') return 3
    if (billingCycle === 'yearly') return 12
    return 1
  }

  // Calculate discounted price based on promo code and billing cycle
  const calculateDiscountedPrice = (plan, promoDetails) => {
    if (!plan || !promoDetails || promoDetails.promoType !== 'discount') {
      return null
    }

    const monthlyPrice =
      plan.discountPrice || plan.discountedPrice || plan.originalPrice || 0
    const billingCycle = plan.billingCycle || plan.duration || 'monthly'
    const billingMonths = GetMonthCountFronBillingCycle(billingCycle)

    const discountType = promoDetails.discountType // 'percentage' or 'flat_amount'
    const discountValue = promoDetails.discountValue
    const discountDurationMonths = promoDetails.discountDurationMonths || 0

    // If no discount duration, it's a one-time discount
    if (!discountDurationMonths || discountDurationMonths === 0) {
      // One-time discount - apply to the billing cycle
      let discountAmount = 0
      const totalPrice = monthlyPrice * billingMonths

      if (discountType === 'percentage') {
        discountAmount = (totalPrice * discountValue) / 100
      } else if (discountType === 'flat_amount') {
        discountAmount = Math.min(discountValue, totalPrice)
      }

      return {
        originalPrice: totalPrice,
        discountAmount: discountAmount,
        finalPrice: totalPrice - discountAmount,
        discountMonths: 0,
        fullPriceMonths: billingMonths,
      }
    }

    // Duration-based discount
    // Calculate how many months get discount vs full price
    const discountMonths = Math.min(discountDurationMonths, billingMonths)
    const fullPriceMonths = Math.max(0, billingMonths - discountMonths)

    // Calculate discount per month
    let discountPerMonth = 0
    if (discountType === 'percentage') {
      discountPerMonth = (monthlyPrice * discountValue) / 100
    } else if (discountType === 'flat_amount') {
      discountPerMonth = Math.min(discountValue, monthlyPrice)
    }

    // Calculate total discount
    const totalDiscount = discountPerMonth * discountMonths

    // Calculate prices
    const discountedMonthsPrice =
      (monthlyPrice - discountPerMonth) * discountMonths
    const fullPriceMonthsPrice = monthlyPrice * fullPriceMonths
    const originalPrice = monthlyPrice * billingMonths
    const finalPrice = discountedMonthsPrice + fullPriceMonthsPrice

    return {
      originalPrice: originalPrice,
      discountAmount: totalDiscount,
      finalPrice: finalPrice,
      discountMonths: discountMonths,
      fullPriceMonths: fullPriceMonths,
      monthlyPrice: monthlyPrice,
      discountPerMonth: discountPerMonth,
    }
  }

  const PayAsYouGoPlanTypes = {
    Plan30Min: 'Plan30',
    Plan120Min: 'Plan120',
    Plan360Min: 'Plan360',
    Plan720Min: 'Plan720',
  }

  return (
    <div style={{ width: '100%' }}>
      <AgentSelectSnackMessage
        isVisible={credentialsErr}
        hide={() => setCredentialsErr(false)}
        message={addCardErrtxt}
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
        className={`w-full flex ${isSmallScreen ? 'flex-col' : 'flex-row'} items-start gap-6`}
        style={{ backgroundColor: 'transparent' }}
      >
        <div
          className={`${isSmallScreen ? 'w-full px-4 mt-0 pb-24' : 'relative flex-1'}`}
          style={
            isSmallScreen
              ? {}
              : {
                  minWidth: 0,
                  maxWidth: '720px',
                }
          }
        >
          {/* Orb */}
          {!isSmallScreen && (
            <div
              className="absolute left-0 top-[72%] -translate-y-1/2 flex justify-center items-center shrink-0"
              style={{
                width: isMediumScreen ? '150px' : '170px',
                height: isMediumScreen ? '150px' : '170px',
                marginLeft: '0px',
              }}
            >
              <Image
                alt="*"
                src={'/otherAssets/paymentCircle2.png'}
                height={isMediumScreen ? 170 : 190}
                width={isMediumScreen ? 170 : 190}
                style={{
                  borderTopRightRadius: '200px',
                  borderBottomRightRadius: '200px',
                  boxShadow: '0 0 40px 0 rgba(128, 90, 213, 0.5)', // purple shadow
                }}
              />
            </div>
          )}

          {/* Form */}
          <div
            className="flex flex-col justify-start flex-1 min-w-0"
            style={
              isSmallScreen
                ? {}
                : {
                    paddingLeft: isMediumScreen ? '160px' : '200px',
                  }
            }
          >
            {isSmallScreen ? (
              <div className="mb-6">
                <div style={{ fontWeight: '600', fontSize: 24 }}>
                  Continue to Payment
                </div>
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: 14,
                    color: '#4F5B76',
                    marginTop: 8,
                  }}
                >
                  Add your payment method to continue
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col items-start">
                <div style={{ fontWeight: '600', fontSize: 28 }}>
                  Continue to Payment
                </div>
              </div>
            )}

            <div className="flex w-full flex-col items-start mt-4">
              <div
                style={{
                  fontWeight: '400',
                  fontSize: 14,
                  color: '#4F5B76',
                }}
              >
                Card Number
              </div>

              <div
                className="mt-1 px-3 py-1 border relative flex items-center w-full"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                }}
              >
                <div className="flex-1 min-w-0 w-full">
                  <CardNumberElement
                    options={elementOptions}
                    autoFocus={true}
                    onChange={(event) => {
                      handleFieldChange(event, cardExpiryRef)
                      if (event.complete) {
                        setCardAdded(true)
                      } else {
                        setCardAdded(false)
                      }
                    }}
                    ref={cardNumberRef}
                    onReady={(element) => {
                      cardNumberRef.current = element
                      cardNumberRef.current.focus()
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <Image
                    src="/svgIcons/Visa.svg"
                    alt="Visa"
                    width={28}
                    height={18}
                  />
                  <Image
                    src="/svgIcons/Mastercard.svg"
                    alt="Mastercard"
                    width={28}
                    height={18}
                  />
                  <Image
                    src="/svgIcons/Amex.svg"
                    alt="American Express"
                    width={28}
                    height={18}
                  />
                  <Image
                    src="/svgIcons/Discover.svg"
                    alt="Discover"
                    width={28}
                    height={18}
                  />
                </div>
              </div>
            </div>

            <div
              className={`flex ${isSmallScreen ? 'flex-col' : 'flex-row'} gap-2 w-full mt-4`}
            >
              <div className={isSmallScreen ? 'w-full' : 'w-6/12'}>
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: 14,
                    color: '#4F5B76',
                  }}
                >
                  Exp Date
                </div>
                <div
                  className="mt-1 px-3 py-1 border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                  }}
                >
                  <CardExpiryElement
                    options={elementOptions}
                    style={{
                      width: '100%',
                      padding: '8px',
                      color: 'white',
                      fontSize: '22px',
                      border: '1px solid blue',
                      borderRadius: '4px',
                    }}
                    onChange={(event) => {
                      handleFieldChange(event, cardCvcRef)
                      if (event.complete) {
                        setCardExpiry(true)
                      } else {
                        setCardExpiry(false)
                      }
                    }}
                    ref={cardExpiryRef}
                    onReady={(element) => {
                      cardExpiryRef.current = element
                    }}
                  />
                </div>
              </div>
              <div className={isSmallScreen ? 'w-full' : 'w-6/12'}>
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: 14,
                    color: '#4F5B76',
                  }}
                >
                  CVV
                </div>
                <div
                  className="mt-1 px-3 py-1 border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                  }}
                >
                  <CardCvcElement
                    options={{
                      ...elementOptions,
                      placeholder: 'CVV',
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      color: 'white',
                      fontSize: '22px',
                      border: '1px solid blue',
                      borderRadius: '4px',
                    }}
                    ref={cardCvcRef}
                    onReady={(element) => {
                      cardCvcRef.current = element
                    }}
                    onChange={(event) => {
                      if (event.complete) {
                        setCVC(true)
                      } else {
                        setCVC(false)
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Optional input field for agent x invite code */}

            <div
              className="mt-4"
              style={{
                fontWeight: '400',
                fontSize: 14,
                color: '#4F5B76',
              }}
            >
              {`Promo or Referral code (optional)`}
            </div>

            <div className="mt-1">
              <input
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value)
                }}
                className="outline-none focus:ring-0 w-full h-[50px]"
                style={{
                  color: '#000000',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  border: '1px solid #00000020',
                  fontSize: 15,
                  fontWeight: '500',
                }}
                placeholder="Enter Promo or Referral code"
              />
              <style jsx>{`
                input::placeholder {
                  color: #00000050; /* Set placeholder text color to red */
                }
              `}</style>
            </div>
            {inviteCode ? (
              <div
                className="mt-2 flex items-center gap-2"
                style={{ minHeight: 24 }}
              >
                {referralStatus === 'loading' && (
                  <>
                    <div style={{ fontSize: 12, color: '#4F5B76' }}>
                      Validating code…
                    </div>
                  </>
                )}
                {referralStatus === 'invalid' && (
                  <div
                    style={{ fontSize: 12, color: '#D93025', fontWeight: 600 }}
                  >
                    {referralMessage || 'Invalid referral code'}
                  </div>
                )}
                {referralStatus === 'valid' && (
                  <div
                    style={{ fontSize: 12, color: '#34A853', fontWeight: 600 }}
                  >
                    {referralMessage || 'Code applied'}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Continue Button - Fixed at bottom */}
        {isSmallScreen && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
            <div className="max-w-md mx-auto px-4 py-4">
              <button
                onClick={handleAddCard}
                disabled={
                  !CardAdded ||
                  !CardExpiry ||
                  !CVC ||
                  addCardLoader ||
                  disableContinue ||
                  isSubscribingRef.current
                }
                className={`w-full h-[50px] rounded-xl font-bold text-white text-lg transition-all ${
                  !CardAdded ||
                  !CardExpiry ||
                  !CVC ||
                  addCardLoader ||
                  disableContinue ||
                  isSubscribingRef.current
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-brand-primary hover:opacity-90 shadow-lg active:scale-98'
                }`}
              >
                {addCardLoader ? (
                  <div className="flex items-center justify-center gap-2">
                    <CircularProgress size={20} color="inherit" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                By continuing you agree to{' '}
                <a
                  href="https://www.myagentx.com/terms-and-condition"
                  style={{
                    textDecoration: 'underline',
                    color: 'hsl(var(--brand-primary))',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold"
                >
                  Terms & Conditions
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Order Summary - Desktop only */}
        {!isSmallScreen && (
          <div
            className="w-[42%] flex flex-col justify-start items-center pe-4 rounded-lg"
            style={{ backgroundColor: 'transparent' }}
          >
          <div
            className=" rounded-lg p-4 w-[90%]"
            style={{ backgroundColor: '#ffffffcc' }}
          >
            <div style={{ fontSize: 22, fontWeight: '600' }}>Order Summary</div>
            <div className="flex flex-row items-start justify-between w-full mt-6">
              <div>
                <div style={{ fontWeight: '600', fontSize: 15 }}>
                  {selectedPlan?.title || 'No Plan Selected'}
                </div>
                {/*
                                    <div style={{ fontWeight: "400", fontSize: 13, marginTop: "" }}>{selectedPlan?.duration} subscription</div>
                                */}
                <div style={{ fontWeight: '400', fontSize: 13, marginTop: '' }}>
                  Total Annual Commitment: $
                  {(selectedPlan?.originalPrice * 12)?.toLocaleString()}
                </div>
              </div>
              <div style={{ fontWeight: '600', fontSize: 15 }}>
                ${formatFractional2(selectedPlan?.originalPrice)}
              </div>
            </div>

            {/* Calculate discount if promo code is applied */}
            {(() => {
              const discountCalculation = promoCodeDetails
                ? calculateDiscountedPrice(selectedPlan, promoCodeDetails)
                : null

              const billingMonths = GetMonthCountFronBillingCycle(
                selectedPlan?.billingCycle || selectedPlan?.duration,
              )
              const monthlyPrice =
                selectedPlan?.discountPrice ||
                selectedPlan?.discountedPrice ||
                selectedPlan?.originalPrice ||
                0
              const originalTotal = billingMonths * monthlyPrice
              const finalTotal = discountCalculation
                ? discountCalculation.finalPrice
                : originalTotal

              return (
                <>
                  {promoCodeDetails && (
                    <div className="flex flex-row items-start justify-between w-full mt-4">
                      <div>
                        <div
                          style={{
                            fontWeight: '600',
                            fontSize: 15,
                            color: 'hsl(var(--brand-primary))',
                          }}
                        >
                          Promo Code Applied
                        </div>
                        <div
                          style={{
                            fontWeight: '400',
                            fontSize: 13,
                            marginTop: '4px',
                          }}
                        >
                          {promoCodeDetails?.discountType === 'percentage'
                            ? `${promoCodeDetails?.discountValue}% off`
                            : `$${promoCodeDetails?.discountValue} off`}
                          {promoCodeDetails?.discountDurationMonths
                            ? ` for ${promoCodeDetails?.discountDurationMonths} month${promoCodeDetails?.discountDurationMonths > 1 ? 's' : ''}`
                            : ''}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: 15,
                          color: '#7902DF',
                        }}
                      >
                        -$
                        {formatFractional2(discountCalculation?.discountAmount)}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-row items-start justify-between w-full mt-6">
                    <div>
                      <div
                        className="capitalize"
                        style={{ fontWeight: '600', fontSize: 15 }}
                      >
                        {` Total Billed ${selectedPlan?.billingCycle || selectedPlan?.duration || 'No Plan Selected'}`}
                      </div>
                      <div
                        className=""
                        style={{
                          fontWeight: '400',
                          fontSize: 13,
                          marginTop: '',
                        }}
                      >
                        Next Charge Date {getNextChargeDate(selectedPlan)}
                      </div>
                    </div>
                    <div
                      className=""
                      style={{ fontWeight: '600', fontSize: 15 }}
                    >
                      {(() => {
                        // Check if plan has trial and user is subscribing for the first time
                        const hasTrial = selectedPlan?.hasTrial === true
                        const isFirstTimeSubscription = !currentUserPlan || currentUserPlan.planId === null
                        
                        // If plan has trial and user has no previous plan, show $0
                        if (hasTrial && isFirstTimeSubscription) {
                          return '$0'
                        }
                        
                        return discountCalculation
                          ? `$${formatFractional2(finalTotal)}`
                          : `$${formatFractional2(originalTotal)}`
                      })()}
                    </div>
                  </div>

                  {inviteCode && !promoCodeDetails && (
                    <div>
                      <div className="flex flex-row items-start justify-between w-full mt-6">
                        <div>
                          <div style={{ fontWeight: '600', fontSize: 15 }}>
                            Referral Code
                          </div>
                          <div
                            style={{
                              fontWeight: '400',
                              fontSize: 13,
                              marginTop: '',
                            }}
                          >
                            {referralMessage}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}

            {!inviteCode && !promoCodeDetails && (
              <div className="w-full h-10 mt-6"></div>
            )}

            <div className="mt-6 h-[1px] w-full bg-[#00000035]"></div>
            <div className="flex flex-row items-start justify-between w-full mt-6">
              <div style={{ fontWeight: '600', fontSize: 15 }}>Total:</div>
              <div className="flex flex-col items-end">
                <div style={{ fontWeight: '600', fontSize: 22 }}>
                  {(() => {
                    if (!selectedPlan) return '$0'

                    // Check if plan has trial and user is subscribing for the first time (no previous plan)
                    const hasTrial = selectedPlan?.hasTrial === true
                    const isFirstTimeSubscription = !currentUserPlan || currentUserPlan.planId === null
                    
                    // If plan has trial and user has no previous plan, show $0 (they won't be charged immediately)
                    if (hasTrial && isFirstTimeSubscription) {
                      return '$0'
                    }

                    const discountCalculation = promoCodeDetails
                      ? calculateDiscountedPrice(selectedPlan, promoCodeDetails)
                      : null

                    if (discountCalculation) {
                      return `$${formatFractional2(discountCalculation.finalPrice)}`
                    }

                    const billingMonths = GetMonthCountFronBillingCycle(
                      selectedPlan?.billingCycle || selectedPlan?.duration,
                    )
                    const monthlyPrice =
                      selectedPlan?.discountPrice ||
                      selectedPlan?.discountedPrice ||
                      selectedPlan?.originalPrice ||
                      0
                    return `$${formatFractional2(billingMonths * monthlyPrice)}`
                  })()}
                </div>
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: 13,
                    marginTop: '',
                    color: '#8A8A8A',
                  }}
                >
                  Due Today
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full mt-6 flex justify-center">
              {addCardLoader ? (
                <div className="flex flex-row justify-center items-center mt-8 w-full">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <div className="flex flex-row justify-end items-center mt-8 w-full">
                  {CardAdded && CardExpiry && CVC ? (
                    <button
                      onClick={handleAddCard}
                      disabled={addCardLoader || disableContinue || isSubscribingRef.current}
                      className="w-full h-[50px] rounded-xl px-8 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'hsl(var(--brand-primary))',
                        fontWeight: '600',
                        fontSize: 17,
                      }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      disabled={true}
                      className="bg-[#00000020] w-full h-[50px] rounded-xl px-8 text-[#000000] py-3"
                      style={{ fontWeight: '600', fontSize: 17 }}
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}
              {/*
                                <p className="text-[#15151580]">{textBelowContinue}</p>
                            */}
            </div>
            <div
              // className="flex flex-row items-center gap-2 w-full justify-center mt-2"
              className="mt-2 text-center"
              style={{
                fontWeight: '400',
                fontSize: 10,
              }}
            >
              By continuing you agree to our
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  const { termsUrl } = getPolicyUrls()
                  window.open(termsUrl, '_blank')
                }}
                style={{ textDecoration: 'underline', color: 'hsl(var(--brand-primary))', cursor: 'pointer' }} // Underline and color styling
                className="ms-1 me-1"
                rel="noopener noreferrer" // Security for external links
              >
                Terms & Conditions
              </a>
              and agree to a 12-month license term. Payments are billed{' '}
              {selectedPlan?.duration} as selected.
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default AgencyAddCard
