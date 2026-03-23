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
import { AuthToken } from '../agency/plan/AuthDetails'
import CloseBtn from '../globalExtras/CloseBtn'

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
  hasExternalHeader = false,
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

  //user cards list
  const [cards, setCards] = useState([]);
  const [getCardsLoader, setGetCardsLoader] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null)
  const [isSubscribeButtonDisabled, setIsSubscribeButtonDisabled] = useState(false)
  const [makeDefaultCardLoader, setMakeDefaultCardLoader] = useState(false)
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  //function to get card image
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

  const fetchCardsList = async () => {
    try {
      setGetCardsLoader(true);
      // setGetCardLoader(true);
      let token = AuthToken()

      let ApiPath = Apis.getCardsList

      if (selectedUser) {
        ApiPath = `${ApiPath}?userId=${selectedUser.id}`
      }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('response of fetch cards list', response)

      if (response) {
        if (response.data.status === true) {
          const cards = response.data.data
          if (cards) {
            console.log('cards fetched in addcard', cards)
            setCards(cards);
            setShowAddCardForm(false)
            // setSelectedCard(cards[0])
          }
          setGetCardsLoader(false);
        }
      }
    } catch (error) {
      toast.error('Error fetching cards list')
      setGetCardsLoader(false);
    } finally {
      // //console.log;
      // setGetCardLoader(false);
    }
  }

  const makeDefaultCard = async (item) => {
    try {
      setSelectedCard(item)
      setIsSubscribeButtonDisabled(true)
      setMakeDefaultCardLoader(true)

      const localData = localStorage.getItem('User')
      let AuthToken = null

      if (localData) {
        const Data = JSON.parse(localData)
        AuthToken = Data.token
      }

      const ApiPath = Apis.makeDefaultCard
      const ApiData = {
        paymentMethodId: item.id,
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          // Update cards state to reflect the change
          setCards((prevCards) =>
            prevCards?.map((card) => ({
              ...card,
              isDefault: card.id === item.id,
            })),
          )
          setSelectedCard(item)
          setAddCardSuccess(true)
          setAddCardErrtxt('Card set as default successfully')
        } else {
          setAddCardFailure(true)
          setAddCardErrtxt(
            response.data.message || 'Failed to set default card',
          )
        }
      }
    } catch (error) {
      console.error('Error occurred in make default card api:', error)
      setAddCardFailure(true)
      setAddCardErrtxt('Error setting default card')
    } finally {
      setMakeDefaultCardLoader(false)
      setIsSubscribeButtonDisabled(false)
    }
  }

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

  //fetch cards list
  useEffect(() => {
    fetchCardsList()
  }, [selectedUser])
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

  // Stripe iframes do not resolve host-page CSS variables — hsl(var(--…)) becomes invalid and text can render invisible on white.
  const elementOptions = {
    style: {
      base: {
        backgroundColor: 'transparent',
        color: '#0f172a',
        fontSize: '16px',
        lineHeight: '42px',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#64748b',
        },
      },
      invalid: {
        color: '#dc2626',
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
        console.log('response of subscribe plan', response)
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
          // setAddCardLoader(false)
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
      setAddCardLoader(false)
      setDisableContinue(false)
    } finally {
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
    return { originalTotal, discountAmount, finalTotal: originalTotal }
  }
  const orderSummary = getOrderSummary();
  const orderSummaryAgencySubAccount = getOrderSummary(reduxUser)

  return (
    <div style={{ width: '100%' }}>
      {isSmallScreen ? (
        // Mobile Layout - Matching AgencyAddCard design
        <div className="flex flex-col items-center h-screen w-full overflow-y-auto bg-gray-100">
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
              <div className="relative flex items-center min-h-[42px] border border-border rounded-lg px-3 bg-white transition-[box-shadow,border-color] duration-150 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:outline-none">
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
                <div className="min-h-[42px] border border-border rounded-lg px-3 bg-white flex items-center transition-[box-shadow,border-color] duration-150 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:outline-none">
                  <div className="w-full min-w-0 flex-1">
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
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <div className="min-h-[42px] border border-border rounded-lg px-3 bg-white flex items-center transition-[box-shadow,border-color] duration-150 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:outline-none">
                  <div className="w-full min-w-0 flex-1">
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
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-lg border border-border bg-white text-foreground text-sm font-normal placeholder:text-muted-foreground outline-none transition-[box-shadow,border-color] duration-150 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                    placeholder="Enter Promo or Referral code"
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
                      Next Charge: {referralCodeDetails?.nextChargeDateFormatted || moment(getNextChargeDate(selectedPlan)).format('MMMM DD, YYYY')}
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
                      ${formatFractional2(orderSummary.finalTotal)}{/*orderSummary.dueToday*/}
                      ${formatFractional2(orderSummary.finalTotal)}{/*orderSummary.dueToday*/}
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
        </div>
      ) : (
        // Desktop Layout
        <div className="w-full flex flex-row items-start gap-2 pt-0 pb-3 min-w-0">
          <div className="relative w-1/2 min-w-0">
            {/* Form */}
            <div className="flex flex-col justify-start flex-1 min-w-0">
              {!isSmallScreen && !hasExternalHeader && (
                <div className="flex w-full flex-row items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-foreground">
                    Continue to Payment
                  </h2>
                  {
                    showAddCardForm && (
                      <button
                        className="text-brand-primary underline font-medium text-sm hover:opacity-80"
                        onClick={() => { setShowAddCardForm(false) }}
                      >
                        <CloseBtn />
                      </button>
                    )}
                </div>
              )}

              {
                !getCardsLoader && (cards.length === 0 || showAddCardForm) ? (
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex w-full flex-col items-start">
                      <label className="text-sm font-normal text-muted-foreground mb-1.5">
                        Card Number
                      </label>
                      <div className="w-full min-h-[42px] px-3 border border-border rounded-lg bg-white flex items-center transition-[box-shadow,border-color] duration-150 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:outline-none">
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
                      className={`flex ${isSmallScreen ? 'flex-col' : 'flex-row'} gap-3 w-full`}
                    >
                      <div className={isSmallScreen ? 'w-full' : 'flex-1 min-w-0'}>
                        <label className="text-sm font-normal text-muted-foreground mb-1.5 block">
                          Exp Date
                        </label>
                        <div className="min-h-[42px] px-3 border border-border rounded-lg bg-white flex items-center transition-[box-shadow,border-color] duration-150 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:outline-none">
                          <div className="w-full min-w-0 flex-1">
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
                      </div>
                      <div className={isSmallScreen ? 'w-full' : 'flex-1 min-w-0'}>
                        <label className="text-sm font-normal text-muted-foreground mb-1.5 block">
                          CVV
                        </label>
                        <div className="min-h-[42px] px-3 border border-border rounded-lg bg-white flex items-center transition-[box-shadow,border-color] duration-150 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:outline-none">
                          <div className="w-full min-w-0 flex-1">
                            <CardCvcElement
                              options={{
                                ...elementOptions,
                                placeholder: 'CVV',
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
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-normal text-muted-foreground mb-1.5">
                        Promo or Referral code (optional)
                      </label>
                      <input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="w-full h-[42px] px-3 rounded-lg border border-border bg-white text-foreground text-sm font-normal placeholder:text-muted-foreground outline-none transition-[box-shadow,border-color] duration-150 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                        placeholder="Enter Promo or Referral code"
                      />
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
                  </div>) : (
                  <div className="w-full min-h-[200px]">
                    {
                      getCardsLoader ? (
                        <div className="flex flex-row justify-center items-center py-8 w-full">
                          <CircularProgress size={30} />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="w-full flex flex-row items-center justify-between py-3">
                            <h3 className="text-[16px] font-semibold text-foreground">
                              Payment
                            </h3>
                            <button
                              onClick={() => setShowAddCardForm(true)}
                              className="text-sm font-medium text-brand-primary hover:opacity-80"
                            >
                              + Add Payment
                            </button>
                          </div>
                          {
                            cards?.length > 0 ? (
                              <div className="w-full max-h-[35vh] overflow-y-auto flex flex-col gap-3">
                                {
                                  cards?.map((item) => (
                                    <div className="w-full" key={item.id}>
                                      <button
                                        className="w-full outline-none"
                                        onClick={() => makeDefaultCard(item)}
                                        disabled={makeDefaultCardLoader}
                                      >
                                        <div
                                          className={`flex items-center justify-between w-full p-3 rounded-lg ${item.isDefault || selectedCard?.id === item.id ? 'border-2' : 'border'}`}
                                          style={{
                                            backgroundColor:
                                              item.isDefault ||
                                                selectedCard?.id === item.id
                                                ? '#4011FA05'
                                                : 'transparent',
                                            borderColor:
                                              item.isDefault ||
                                                selectedCard?.id === item.id
                                                ? 'hsl(var(--brand-primary, 270 75% 50%))'
                                                : '#15151510',
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={`w-5 h-5 rounded-full border border-brand-primary flex items-center justify-center`}
                                              style={{
                                                borderWidth:
                                                  item.isDefault ||
                                                    selectedCard?.id === item.id
                                                    ? 3
                                                    : 1,
                                              }}
                                            ></div>

                                            <Image
                                              src={
                                                getCardImage(item) ||
                                                '/svgIcons/Visa.svg'
                                              }
                                              alt="Card Logo"
                                              width={50}
                                              height={50}
                                            />

                                            <div className="text-sm font-normal">
                                              ****{item.last4}{' '}
                                              {item.isDefault && (
                                                <span className="px-2 py-1 text-brand-primary bg-brand-primary/10 rounded uppercase text-xs font-medium">{`(default)`}</span>
                                              )}
                                              {makeDefaultCardLoader &&
                                                selectedCard?.id === item.id && (
                                                  <CircularProgress
                                                    size={14}
                                                    style={{ marginLeft: '8px' }}
                                                  />
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                  ))
                                }
                              </div>
                            ) : (
                              <div>
                                No cards found
                              </div>
                            )
                          }
                        </div>
                      )
                    }
                  </div>
                )
              }

            </div>
          </div>
          {/* Order Summary - Desktop only */}
          {!isSmallScreen && (
            <div className="w-1/2 min-w-0 flex flex-col flex-shrink-0">
              <div className="rounded-xl border border-border bg-card p-3 w-full">
                <h3 className="text-[16px] font-semibold text-foreground mb-4">Order Summary</h3>
                <div className="flex flex-col gap-4 text-sm px-3 py-1 bg-black/[0.02] text-brand-primary rounded-lg ">
                  <div className="flex flex-row items-start justify-between w-full gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">
                        {selectedPlan?.title || selectedPlan?.name || 'No Plan Selected'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
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
                    <div className="text-sm font-semibold text-foreground flex-shrink-0">
                      ${formatFractional2(selectedPlan?.discountedPrice || selectedPlan?.discountPrice || selectedPlan?.originalPrice || 0)}
                    </div>
                  </div>

                  {/* Promo applied (when valid) - desktop */}
                  {orderSummary.discountAmount > 0 && referralCodeDetails && (
                    <div className="flex flex-row items-start justify-between w-full gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-brand-primary">
                          Promo Code Applied
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {referralCodeDetails.discountType === 'percentage'
                            ? `${referralCodeDetails.discountValue}% off`
                            : `$${referralCodeDetails.discountValue} off`}
                          {referralCodeDetails.discountDurationMonths
                            ? ` for ${referralCodeDetails.discountDurationMonths} month${referralCodeDetails.discountDurationMonths > 1 ? 's' : ''}`
                            : ''}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-brand-primary flex-shrink-0">
                        -${formatFractional2(orderSummary.discountAmount)}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-row items-start justify-between w-full gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground capitalize">
                        {`Total Billed ${selectedPlan?.billingCycle || selectedPlan?.duration || 'No Plan Selected'}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Next Charge: {referralCodeDetails?.nextChargeDateFormatted || moment(getNextChargeDate(selectedPlan)).format('MMMM DD, YYYY')}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-foreground flex-shrink-0">
                      ${formatFractional2(orderSummaryAgencySubAccount.finalTotal)}
                    </div>
                  </div>

                  {inviteCode && !(referralCodeDetails && referralCodeDetails.discountValue != null) && (
                    <div className="flex flex-row items-start justify-between w-full gap-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Referral Code</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{referralMessage}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-row items-start justify-between w-full gap-3">
                    <div className="text-sm font-semibold text-foreground">Total:</div>
                    <div className="flex flex-col items-end">
                      <div className="text-base font-semibold text-foreground">
                        ${formatFractional2(orderSummary.finalTotal)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Due Today
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-stretch w-full mt-5 gap-3">
                    {addCardLoader ? (
                      <div className="flex justify-center items-center py-4 w-full">
                        <CircularProgress size={28} />
                      </div>
                    ) : (
                      <div className="w-full">
                        {CardAdded && CardExpiry && CVC ? (
                          <button
                            onClick={handleAddCard}
                            disabled={addCardLoader || disableContinue || isSubscribingRef.current}
                            className="w-full h-[42px] rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                          >
                            Continue
                          </button>
                        ) : (cards?.length > 0 && !isSubscribeButtonDisabled && !showAddCardForm) ? (
                          <button
                            onClick={() => handleSubscribePlan()}
                            disabled={addCardLoader || disableContinue || isSubscribingRef.current}
                            className="w-full h-[42px] rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                          >
                            Subscribe
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full h-[42px] rounded-lg px-4 text-sm font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                          >
                            Continue
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                {!isSmallScreen && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    By continuing you agree to our
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault()
                        const { termsUrl } = await getPolicyUrls(selectedUser)
                        window.open(termsUrl, '_blank')
                      }}
                      className="text-brand-primary underline cursor-pointer mx-1 hover:opacity-90"
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
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserAddCard
