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
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from '@/utils/toast'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { useUser } from '@/hooks/redux-hooks'
import { getPolicyUrls } from '@/utils/getPolicyUrls'

import { formatFractional2 } from '../agency/plan/AgencyUtilities'
// import Apis from '../Apis/Apis';
import getProfileDetails from '../apis/GetProfile'
import {
  calculateDiscountedPrice,
  calculatePlanPrice,
  checkReferralCode,
  getMonthlyPrice,
  getNextChargeDate,
  getTotalPrice,
} from './UserPlanServices'
import SignupHeaderMobile from '../onboarding/mobileUI/SignupHeaderMobile'
import { Checkbox } from '../ui/checkbox'
import moment from 'moment'

const UserAddCard = ({
  handleBack,
  handleClose,
  togglePlan,
  setAddPaymentSuccessPopUp,
  isFrom,
  selectedUser,
  fromAdmin = false,
  selectedPlan,
  setAddCardFailure,
  setAddCardSuccess,
  setAddCardErrtxt,
  addCardFailure,
  addCardSuccess,
  addCardErrtxt,
  hasRedeemedTrial: hasRedeemedTrialProp,
}) => {
  const stripeReact = useStripe()
  const elements = useElements()
  ////console.log
  ////console.log
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  // For subaccount: show Due today $0 when plan has trial and user has not redeemed trial (from profile or prop when managing another user)
  const hasRedeemedTrial =
    hasRedeemedTrialProp === true ||
    reduxUser?.hasRedeemedTrial === true ||
    (typeof window !== 'undefined' &&
      (() => {
        try {
          const u = localStorage.getItem('User')
          if (!u) return false
          return JSON.parse(u)?.user?.hasRedeemedTrial === true
        } catch {
          return false
        }
      })())
  const [inviteCode, setInviteCode] = useState('')
  // referral code validation states
  const [referralStatus, setReferralStatus] = useState('idle') // idle | loading | valid | invalid
  const [referralMessage, setReferralMessage] = useState('')
  const referralRequestSeqRef = useRef(0)
  const [referralCodeDetails, setReferralCodeDetails] = useState(null)

  const [addCardLoader, setAddCardLoader] = useState(false)
  const [addCardDetails, setAddCardDetails] = useState(null)
  const [isWideScreen, setIsWideScreen] = useState(false)
  const cardNumberRef = useRef(null)
  const cardExpiryRef = useRef(null)
  const cardCvcRef = useRef(null)
  const isSubscribingRef = useRef(false) // Prevent duplicate subscription calls
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [hasAgencyLogo, setHasAgencyLogo] = useState(false)

  //check for button
  const [CardAdded, setCardAdded] = useState(false)
  const [CardExpiry, setCardExpiry] = useState(false)
  const [CVC, setCVC] = useState(false)

  //agree terms
  const [agreeTerms, setAgreeTerms] = useState(true)

  //disable continue btn after the card added
  const [disableContinue, setDisableContinue] = useState(false)
  const [currentUserPlan, setCurrentUserPlan] = useState(null)



  // Check if user is subaccount and if agency has branding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        let isSub = false
        let hasLogo = false

        if (userData) {
          const parsedUser = JSON.parse(userData)
          isSub =
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
            parsedUser?.userRole === 'AgencySubAccount'
          setIsSubaccount(isSub)
        }

        // Check if agency has branding logo
        let branding = null
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            branding = JSON.parse(storedBranding)
          } catch (error) { }
        }

        // Also check user data for agencyBranding
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              branding = parsedUser.user.agency.agencyBranding
            }
          } catch (error) { }
        }

        hasLogo = !!branding?.logoUrl
        setHasAgencyLogo(hasLogo)
      } catch (error) { }
    }
  }, [])

  // Autofocus the first field when the component mounts
  useEffect(() => {
    // //console.log;
    if (cardNumberRef.current) {
      // //console.log;
      cardNumberRef.current.focus()
    }
    getCurrentUserPlan()
  }, [])

  const getCurrentUserPlan = () => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const userData = JSON.parse(localData)
      const plan = userData.user?.plan
      setCurrentUserPlan(plan)
      return plan
    }
    return null
  }

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
  // Debounced referral code validation (500 ms)
  useEffect(() => {
    if (!inviteCode || inviteCode.trim().length === 0) {
      setReferralStatus('idle')
      setReferralMessage('')
      return
    }

    setReferralStatus('loading')
    setReferralMessage('')
    const currentSeq = ++referralRequestSeqRef.current
    const timer = setTimeout(async () => {
      try {
        // Check if this is still the latest request
        if (currentSeq !== referralRequestSeqRef.current) return

        const planId = selectedPlan?.id ?? null
        const resp = await checkReferralCode(inviteCode.trim(), planId)

        setReferralCodeDetails(resp?.data != null ? resp.data : resp)

        // Double-check after async call
        if (currentSeq !== referralRequestSeqRef.current) return

        if (resp && resp.status) {
          setReferralStatus('valid')
          setReferralMessage(resp.message || 'Referral code applied')
        } else {
          setReferralStatus('invalid')
          setReferralMessage((resp && resp.message) || 'Invalid referral code')
        }
      } catch (e) {
        if (currentSeq !== referralRequestSeqRef.current) return
        setReferralStatus('invalid')
        setReferralMessage('Unable to validate code. Please try again.')
      }
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [inviteCode, selectedPlan?.id])

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

    const result = await stripeReact.confirmCardSetup(data.data, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: D.user.name,
        },
      },
    })

    if (result.error) {
      setAddCardLoader(false)
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
      const addCardRes = await fetch(Apis.addCard, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result2 = await addCardRes.json()
      setAddCardLoader(false)
      if (result2.status) {
        setAddCardSuccess(true)
        if (!selectedPlan) {
          handleClose(result)
        } else if (selectedPlan && !isSubscribingRef.current) {
          // Only call subscribe if not already subscribing
          handleSubscribePlan()
        }
      } else {
        setAddCardFailure(true)
        setAddCardErrtxt(result2.message)
        setDisableContinue(false)
      }
    }
  }

  //build err fix issue
  const GetMonthCountFronBillingCycle = (billingCycle) => {
    if (billingCycle === 'monthly') return 1
    if (billingCycle === 'quarterly') return 3
    if (billingCycle === 'yearly') return 12
    return 1
  }

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
    // Prevent duplicate calls
    if (isSubscribingRef.current) {
      return
    }

    try {
      isSubscribingRef.current = true // Set flag to prevent duplicate calls

      let planType = selectedPlan?.planType

      // return

      setAddCardLoader(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      // //console.log;

      let ApiData = {
        plan: planType,
      }

      // Get user's actual role to verify before making API call
      let userRole = null
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        userRole = LocalDetails?.user?.userRole || LocalDetails?.userRole
      }
      const reduxUserRole = reduxUser?.userRole || reduxUser?.user?.userRole
      const actualUserRole = userRole || reduxUserRole

      // Only use agency API if user is actually an agency or subaccount
      const isActuallySubAccount = actualUserRole === 'AgencySubAccount'
      const isActuallyAgency = actualUserRole === 'Agency'
      const shouldUseAgencyAPI = (isFrom === 'SubAccount' && isActuallySubAccount) ||
        (isFrom === 'Agency' && isActuallyAgency)

      if (shouldUseAgencyAPI) {
        ApiData = {
          planId: selectedPlan.id,
        }
        // Add userId to body if subscribing for a subaccount (fromAdmin or selectedUser)
        if (fromAdmin && selectedUser) {
          ApiData.userId = selectedUser.id
        }
      }

      // //console.log;

      let ApiPath = Apis.subscribePlan
      // Only call agency API if user is actually an agency or subaccount
      if (isFrom === 'SubAccount' && isActuallySubAccount) {
        ApiPath = Apis.subAgencyAndSubAccountPlans
      } else if (isFrom === 'Agency' && isActuallyAgency) {
        ApiPath = Apis.subAgencyAndSubAccountPlans
      } else {
        // Default to normal user subscription API
        ApiPath = Apis.subscribePlan
      }
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          //refresh user data from redux
          refreshUserData()
          handleClose(response.data, true) // Pass true to indicate subscription already happened
          if (setAddPaymentSuccessPopUp) setAddPaymentSuccessPopUp(true)
        } else if (response.data.status === false) {
          // Handle subscription failure - display error message
          const errorMessage = response.data.message || 'Subscription failed. Please try again.'
          setAddCardFailure(true)
          setAddCardErrtxt(errorMessage)
          setDisableContinue(false)
          setAddCardLoader(false)
        }
      }
    } catch (error) {
      console.error(
        'Error occurred in subscribe plan api on user add card is:',
        error,
      )
      // Display error message to user
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'An error occurred while subscribing to the plan. Please try again.'
      setAddCardFailure(true)
      setAddCardErrtxt(errorMessage)
      setDisableContinue(false)
    } finally {
      setAddCardLoader(false)
      isSubscribingRef.current = false // Reset flag after completion
    }
  }

  const getMonthsCount = () => {
    if (!selectedPlan) {
      return 1
    }

    const billingCycle = selectedPlan.billingCycle || selectedPlan.duration

    if (billingCycle === 'monthly') {
      return 1
    } else if (billingCycle === 'quarterly') {
      return 3
    } else if (billingCycle === 'yearly') {
      return 12
    } else {
      return 1
    }
  }

  const PayAsYouGoPlanTypes = {
    Plan30Min: 'Plan30',
    Plan120Min: 'Plan120',
    Plan360Min: 'Plan360',
    Plan720Min: 'Plan720',
  }

  // Detect screen sizes
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

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsSmallScreen(width < 640)
      setIsMediumScreen(width < 1200)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  if (!stripeReact || !elements) {
    return <div>Loading stripe</div>
  }


  const calculateTotalPrice = (selectedPlan) => {
    const hasTrial = selectedPlan?.hasTrial === true
    if (hasTrial && !hasRedeemedTrial) return '$0'

    const billingMonths = GetMonthCountFronBillingCycle(
      selectedPlan?.billingCycle || selectedPlan?.duration,
    )
    const monthlyPrice =
      selectedPlan?.discountPrice ||
      selectedPlan?.discountedPrice ||
      selectedPlan?.originalPrice ||
      0

    const originalTotal = billingMonths * monthlyPrice
    let finalTotal = originalTotal
    if (referralStatus === 'valid' && referralCodeDetails?.discountValue != null) {
      const est = referralCodeDetails?.estimatedDiscount
      const apiFinal = est?.finalPrice != null ? Number(est.finalPrice) : NaN
      if (est != null && !Number.isNaN(apiFinal)) {
        finalTotal = apiFinal
      } else {
        finalTotal = calculateDiscountedPrice(
          referralCodeDetails.discountValue,
          referralCodeDetails.discountType,
          originalTotal,
        )
      }
    }
    return `$${formatFractional2(finalTotal)}`
  }

  // Order summary with promo applied. Use API estimatedDiscount when present (prorates yearly correctly).
  const getOrderSummary = (reduxUser) => {
    // console.log("reduxUser pssed in prdersummary is n", reduxUser)
    if (!selectedPlan) return { originalTotal: 0, discountAmount: 0, finalTotal: 0 }
    const hasTrial = selectedPlan?.hasTrial === true
    const isFirstTimeSubscription = !currentUserPlan || currentUserPlan.planId === null
    if (reduxUser?.userRole !== 'AgencySubAccount') {
      if (hasTrial && isFirstTimeSubscription) return { originalTotal: 0, discountAmount: 0, finalTotal: 0 }
    }
    const billingMonths = GetMonthCountFronBillingCycle(
      selectedPlan?.billingCycle || selectedPlan?.duration,  //reduxUser?.userRole !== 'AgencySubAccount' && 
    )
    const monthlyPrice =
      selectedPlan?.discountPrice ||
      selectedPlan?.discountedPrice ||
      selectedPlan?.originalPrice ||
      0
    const originalTotal = billingMonths * monthlyPrice
    let finalTotal = originalTotal
    let discountAmount = 0
    if (referralStatus === 'valid' && referralCodeDetails?.discountValue != null) {
      const est = referralCodeDetails?.estimatedDiscount
      const apiFinal = est?.finalPrice != null ? Number(est.finalPrice) : NaN
      if (est != null && !Number.isNaN(apiFinal)) {
        finalTotal = apiFinal
        discountAmount = Number(est.discountAmount) || 0
      } else {
        finalTotal = calculateDiscountedPrice(
          referralCodeDetails.discountValue,
          referralCodeDetails.discountType,
          originalTotal,
        )
        discountAmount = originalTotal - finalTotal
      }
    }
    return { originalTotal, discountAmount: 0, finalTotal: originalTotal }
  }
  const orderSummary = getOrderSummary();
  const orderSummaryAgencySubAccount = getOrderSummary(reduxUser)

  return (
    <div style={{ width: '100%' }}>
      {isSmallScreen ? (
        // Mobile Layout - Matching AgencyAddCard design
        (<div className="flex flex-col items-center h-screen w-full overflow-y-auto bg-gray-100">
          <SignupHeaderMobile
            title={reduxUser?.userRole == 'Agency' ? "Get an AI AaaS Agency" : "Grow Your Business"}
            description={reduxUser?.userRole == 'Agency' || reduxUser?.userRole == 'AgencySubAccount' ? "Gets more done than coffee. Cheaper too.😉" : "Gets more done than coffee. Cheaper too. Cancel anytime.😉"}
          />
          {/* White Card Container */}
          <div
            className="w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-6 mt-4"
            style={{
              position: 'absolute',
              top: '28vh',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <h1 className="text-2xl font-bold text-black mb-6">Payment Method</h1>

            {/* Card Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card number
              </label>
              <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white">
                <div className="flex-1 min-w-0">
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

            {/* Expiry and CVC */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry
                </label>
                <div className="border rounded-lg px-3 py-2 bg-white">
                  <CardExpiryElement
                    options={elementOptions}
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
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <div className="border rounded-lg px-3 py-2 bg-white">
                  <CardCvcElement
                    options={{
                      ...elementOptions,
                      placeholder: 'CVC',
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

            {/* Promo Code */}
            {
              reduxUser?.userRole !== 'AgencySubAccount' && (

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <input
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value)
                    }}
                    className="w-full h-[50px] px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
                    style={{
                      color: '#000000',
                      backgroundColor: 'white',
                      fontSize: 15,
                      fontWeight: '500',
                    }}
                    placeholder=""
                  />
                  {inviteCode && (
                    <div className="mt-2 flex items-center gap-2" style={{ minHeight: 24 }}>
                      {referralStatus === 'loading' && (
                        <div style={{ fontSize: 12, color: '#4F5B76' }}>
                          Validating code…
                        </div>
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
                  )}
                </div>
              )
            }

            {/* Order Summary Section */}
            {selectedPlan && (
              <div className="mb-6 pt-4 border-t border-gray-200">
                <h2 className="text-lg font-bold text-black mb-4">Order Summary</h2>

                {/* Plan Title and Monthly Price */}
                <div className="flex flex-row items-start justify-between w-full mb-4">
                  <div>
                    <div style={{ fontWeight: '600', fontSize: 15 }}>
                      {selectedPlan?.title || selectedPlan?.name || 'No Plan Selected'}
                    </div>
                    <div style={{ fontWeight: '400', fontSize: 13, marginTop: 4 }}>
                      {(() => {
                        const billingCycle = selectedPlan?.billingCycle || selectedPlan?.duration || 'monthly'
                        const cycleLabel = billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1) + ' subscription'
                        return cycleLabel
                      })()}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: 15 }}>
                    ${formatFractional2(selectedPlan?.discountedPrice || selectedPlan?.discountPrice || selectedPlan?.originalPrice || 0)}
                  </div>
                </div>

                {/* Promo applied (when valid) */}
                {orderSummary.discountAmount > 0 && referralCodeDetails && (
                  <div className="flex flex-row items-start justify-between w-full mb-4">
                    <div>
                      <div style={{ fontWeight: '600', fontSize: 15, color: 'var(--brand-primary, #6366f1)' }}>
                        Promo Code Applied
                      </div>
                      <div style={{ fontWeight: '400', fontSize: 13, marginTop: 4 }}>
                        {referralCodeDetails.discountType === 'percentage'
                          ? `${referralCodeDetails.discountValue}% off`
                          : `$${referralCodeDetails.discountValue} off`}
                        {referralCodeDetails.discountDurationMonths
                          ? ` for ${referralCodeDetails.discountDurationMonths} month${referralCodeDetails.discountDurationMonths > 1 ? 's' : ''}`
                          : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: 15, color: 'var(--brand-primary, #6366f1)' }}>
                      -${formatFractional2(orderSummary.discountAmount)}
                    </div>
                  </div>
                )}

                {/* Total Billed */}
                <div className="flex flex-row items-start justify-between w-full mb-4">
                  <div>
                    <div
                      className="capitalize"
                      style={{ fontWeight: '600', fontSize: 15 }}
                    >
                      {`Total Billed ${selectedPlan?.billingCycle || selectedPlan?.duration || 'monthly'}`}
                    </div>
                    <div
                      style={{
                        fontWeight: '400',
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      Next Charge: {referralCodeDetails?.nextChargeDateFormatted || moment(getNextChargeDate(selectedPlan)).format('MMMM DD,YYYY')}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: 15 }}>
                    {/*${formatFractional2(orderSummary.finalTotal)}
                    ${formatFractional2(reduxUser?.userRole === 'AgencySubAccount' ? (selectedPlan?.originalPrice * GetMonthCountFronBillingCycle(selectedPlan?.billingCycle || selectedPlan?.duration)) : orderSummary.finalTotal || 0)}*/}
                    ${formatFractional2(selectedPlan?.originalPrice * GetMonthCountFronBillingCycle(selectedPlan?.billingCycle || selectedPlan?.duration))}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-4 h-[1px] w-full bg-[#00000035]"></div>

                {/* Total / Due Today - $0 when trial, else full amount */}
                <div className="flex flex-row items-start justify-between w-full">
                  <div style={{ fontWeight: '600', fontSize: 15 }}>Total:</div>
                  <div className="flex flex-col items-end">
                    <div style={{ fontWeight: '600', fontSize: 22 }}>
                      ${formatFractional2(orderSummary.dueToday)}
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
            )}

            <div className="flex items-center gap-2 mb-6">
              <Checkbox
                checked={agreeTerms}
                onCheckedChange={setAgreeTerms}
                className="h-5 w-5"
              />
              <label className="text-sm text-gray-700">
                I agree to the{' '}
                <a
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault()
                    const { termsUrl } = await getPolicyUrls(selectedUser)
                    window.open(termsUrl, '_blank')
                  }}
                  className="text-brand-primary underline font-semibold"
                  rel="noopener noreferrer"
                >
                  Terms & Condition
                </a>
              </label>
            </div>


            <div className="flex flex-row justify-between items-center mt-8 w-full">
              <button
                onClick={handleBack}
                className=" text-brand-primary px-4 font-semibold py-4 rounded-xl text-lg hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Back
              </button>

              {/* Continue Button */}
              <button
                onClick={handleAddCard}
                disabled={
                  !CardAdded ||
                  !CardExpiry ||
                  !CVC ||
                  addCardLoader ||
                  disableContinue ||
                  isSubscribingRef.current ||
                  !agreeTerms
                }
                className={`w-1/2 h-[50px] rounded-xl font-bold text-white text-lg transition-all ${!CardAdded ||
                  !CardExpiry ||
                  !CVC ||
                  addCardLoader ||
                  disableContinue ||
                  isSubscribingRef.current ||
                  !agreeTerms
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
            </div>
          </div>
        </div>)
      ) : (
        // Desktop Layout
        (<div
          className={`w-full flex flex-row items-start gap-6`}
          style={{ backgroundColor: 'transparent' }}
        >
          <div
            className="relative flex-1"
            style={{
              minWidth: 0,
              maxWidth: '720px',
            }}
          >
            {/* Orb */}
            <div
              className="absolute left-0 top-[75%] -translate-y-1/2 flex justify-center items-center shrink-0"
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
              {!isSmallScreen && (
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
                  className="mt-1 px-3 py-1 border relative flex items-center  w-full"
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
                  color: #00000050;
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
                      {selectedPlan?.title || selectedPlan?.name || 'No Plan Selected'}
                    </div>
                    <div style={{ fontWeight: '400', fontSize: 13, marginTop: '' }}>
                      {(() => {
                        const billingCycle = selectedPlan?.billingCycle || selectedPlan?.duration || 'monthly'
                        const cycleLabel = billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1) + ' subscription'
                        return cycleLabel
                      })()}: $
                      {(() => {
                        const price = selectedPlan?.discountedPrice ||
                          selectedPlan?.discountPrice ||
                          selectedPlan?.originalPrice ||
                          0
                        return formatFractional2(price)
                      })()}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: 15 }}>
                    ${formatFractional2(selectedPlan?.discountedPrice || selectedPlan?.discountPrice || selectedPlan?.originalPrice || 0)}
                  </div>
                </div>

                {/* Promo applied (when valid) - desktop */}
                {orderSummary.discountAmount > 0 && referralCodeDetails && (
                  <div className="flex flex-row items-start justify-between w-full mt-6">
                    <div>
                      <div style={{ fontWeight: '600', fontSize: 15, color: 'var(--brand-primary, #6366f1)' }}>
                        Promo Code Applied
                      </div>
                      <div style={{ fontWeight: '400', fontSize: 13, marginTop: '' }}>
                        {referralCodeDetails.discountType === 'percentage'
                          ? `${referralCodeDetails.discountValue}% off`
                          : `$${referralCodeDetails.discountValue} off`}
                        {referralCodeDetails.discountDurationMonths
                          ? ` for ${referralCodeDetails.discountDurationMonths} month${referralCodeDetails.discountDurationMonths > 1 ? 's' : ''}`
                          : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: 15, color: 'var(--brand-primary, #6366f1)' }}>
                      -${formatFractional2(orderSummary.discountAmount)}
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
                      Next Charge: {referralCodeDetails?.nextChargeDateFormatted || moment(getNextChargeDate(selectedPlan)).format('MMMM DD,YYYY')}
                    </div>
                  </div>
                  <div
                    className=""
                    style={{ fontWeight: '600', fontSize: 15 }}
                  >
                    ${formatFractional2(orderSummaryAgencySubAccount.finalTotal)}
                  </div>
                </div>

                {inviteCode && !(referralCodeDetails && referralCodeDetails.discountValue != null) && (
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

                {!inviteCode && (
                  <div className="w-full h-10 mt-6"></div>
                )}

                <div className="mt-6 h-[1px] w-full bg-[#00000035]"></div>

                <div className="flex flex-row items-start justify-between w-full mt-6">
                  <div style={{ fontWeight: '600', fontSize: 15 }}>Total:</div>
                  <div className="flex flex-col items-end">
                    <div style={{ fontWeight: '600', fontSize: 22 }}>
                      ${formatFractional2(orderSummary.dueToday)}
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

                {!isSmallScreen && (
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
                  </div>
                )}
                {!isSmallScreen && (
                  <div
                    className="mt-2 text-center"
                    style={{
                      fontWeight: '400',
                      fontSize: 10,
                    }}
                  >
                    By continuing you agree to our
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault()
                        const { termsUrl } = await getPolicyUrls(selectedUser)
                        window.open(termsUrl, '_blank')
                      }}
                      style={{ textDecoration: 'underline', color: 'hsl(var(--brand-primary))', cursor: 'pointer' }}
                      className="ms-1 me-1"
                      rel="noopener noreferrer"
                    >
                      Terms & Conditions
                    </a>
                    {
                      reduxUser?.userRole === "Agency" && (
                        <>
                          and agree to a 12-months license terms. Payments are billed yearly as selected.
                        </>
                      )
                    }
                    and agree to a 12-month license term. Payments are billed{' '}
                    {selectedPlan?.duration} as selected.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>)
      )}
    </div>
  );
}

export default UserAddCard
