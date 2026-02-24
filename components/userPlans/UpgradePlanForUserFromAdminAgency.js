import { Box, CircularProgress, Modal } from '@mui/material'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import { set } from 'draft-js/lib/DefaultDraftBlockRenderMap'
import Image from 'next/image'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'

import { PersistanceKeys } from '@/constants/Constants'
import { getPolicyUrls } from '@/utils/getPolicyUrls'
import { getPlanChangeDirection } from '@/utils/planComparison'

import AdminGetProfileDetails from '../admin/AdminGetProfileDetails'
import { formatFractional2 } from '../agency/plan/AgencyUtilities'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import getProfileDetails from '../apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
// import { duration } from '@/utilities/PlansService'
import CloseBtn from '../globalExtras/CloseBtn'
import { DurationView } from '../plan/DurationView'
import UserAddCard from './UserAddCardModal'
import AppLogo from '@/components/common/AppLogo'
import {
  calculatePlanPrice,
  checkReferralCode,
  getNextChargeDate,
  getUserLocalData,
  getUserPlans,
} from './UserPlanServices'
import { cn } from '@/lib/utils'

// Separate component for card form to isolate Stripe Elements
const CardForm = ({
  onCardAdded,
  onCardExpiry,
  onCVC,
  onFieldChange,
  cardNumberRef,
  cardExpiryRef,
  cardCvcRef,
  inviteCode,
  setInviteCode,
  referralStatus,
  referralMessage,
  addCardLoader,
  handleAddCard,
  onCancel,
  haveCards,
}) => {
  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      {haveCards ? (
        <div className="w-full flex justify-end">
          <CloseBtn onClick={onCancel} />
        </div>
      ) : null}
      <div className="w-full">
        <div
          className="px-3 py-[2px] relative flex items-center border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
          }}
        >
          <div className="flex-1 w-full">
            <CardNumberElement
              options={elementOptions}
              onReady={(element) => {
                cardNumberRef.current = element
              }}
              onChange={(event) => {
                onFieldChange(event, cardExpiryRef)
                if (event.complete) {
                  onCardAdded(true)
                } else {
                  onCardAdded(false)
                }
              }}
            />
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Image src="/svgIcons/Visa.svg" alt="Visa" width={32} height={20} />
            <Image
              src="/svgIcons/Mastercard.svg"
              alt="Mastercard"
              width={32}
              height={20}
            />
            <Image
              src="/svgIcons/Amex.svg"
              alt="American Express"
              width={32}
              height={20}
            />
            <Image
              src="/svgIcons/Discover.svg"
              alt="Discover"
              width={32}
              height={20}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2 w-full mt-2">
        <div className="w-6/12">
          <div
            className="px-3 py-[2px] border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
            }}
          >
            <CardExpiryElement
              options={elementOptions}
              onChange={(event) => {
                onFieldChange(event, cardCvcRef)
                if (event.complete) {
                  onCardExpiry(true)
                } else {
                  onCardExpiry(false)
                }
              }}
              onReady={(element) => {
                cardExpiryRef.current = element
              }}
            />
          </div>
        </div>
        <div className="w-6/12">
          <div
            className="px-3 py-[2px] border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
            }}
          >
            <CardCvcElement
              // options={elementOptions}
              options={{
                ...elementOptions,
                placeholder: 'CVV', // 👈 add this
              }}
              onReady={(element) => {
                cardCvcRef.current = element
              }}
              onChange={(event) => {
                if (event.complete) {
                  onCVC(true)
                } else {
                  onCVC(false)
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Referral Code Input */}
      <div className="mt-2">
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
        <div className="mt-2 flex items-center gap-2" style={{ minHeight: 24 }}>
          {referralStatus === 'loading' && (
            <>
              <div style={{ fontSize: 12, color: '#4F5B76' }}>
                Validating code…
              </div>
            </>
          )}
          {referralStatus === 'invalid' && (
            <div style={{ fontSize: 12, color: '#D93025', fontWeight: 600 }}>
              {referralMessage || 'Invalid referral code'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

/**
 * UpgradePlanContent - Internal component that handles the actual upgrade plan UI and logic
 * 
 * This is the main content component that contains all the business logic for plan selection,
 * payment method management, and subscription processing. It's wrapped by the UpgradePlanForUserFromAdminAgency
 * component which provides Stripe Elements context.
 * 
 * KEY DIFFERENCES FROM UpgradePlan's UpgradePlanContent:
 * - getPlans(): ALWAYS uses Apis.getSubAccountPlans?userId={selectedUser.id} when selectedUser is provided
 * - getCurrentUserPlan(): Fetches from API via AdminGetProfileDetails(selectedUser.id), NOT localStorage
 * - getCardsList(): Always includes ?userId={selectedUser.id} when selectedUser is provided
 * - handleAddCard(): Creates SetupIntent with ?userId={selectedUser.id} and includes userId in addCard request body
 * - handleSubscribePlan(): Always includes userId in subscription request body
 * - All operations target the selectedUser (subaccount), not the logged-in agency/admin user
 * 
 * KEY FUNCTIONS:
 * - getPlans(): Fetches available plans for subaccount using Apis.getSubAccountPlans?userId={selectedUser.id}
 * - getCurrentUserPlan(): Fetches subaccount's current plan via AdminGetProfileDetails(selectedUser.id)
 * - getCardsList(): Fetches subaccount's payment methods with ?userId={selectedUser.id}
 * - handleAddCard(): Adds payment method to subaccount's Stripe customer (includes userId in all requests)
 * - handleSubscribePlan(): Subscribes the subaccount to selected plan (includes userId in request)
 * - getButtonText(): Determines button label based on subaccount's current plan vs selected plan
 * - isPlanCurrent(): Checks if selected plan matches subaccount's current active plan
 */
function UpgradePlanContent({
  open,
  handleClose,
  plan,
  currentFullPlan,
  selectedPlan = null, // Pre-selected plan from previous screen
  setSelectedPlan = null,
  from,
  setShowSnackMsg = null,
  showSnackMsg = null,
  selectedUser,
}) {
  const stripeReact = useStripe()
  const elements = useElements()

  //plans durations view
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

  const [addCardErrtxt, setAddCardErrtxt] = useState(null)

  const [currentSelectedPlan, setCurrentSelectedPlan] = useState(null)
  const [hoverPlan, setHoverPlan] = useState(null)
  const [togglePlan, setTogglePlan] = useState(null)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [currentUserPlan, setCurrentUserPlan] = useState(null)
  const [hasRedeemedTrial, setHasRedeemedTrial] = useState(false)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(cards[0])

  const [showAddCard, setShowAddCard] = useState(false)
  const [forceShowCardForm, setForceShowCardForm] = useState(false)

  const [CardAdded, setCardAdded] = useState(false)
  const [CardExpiry, setCardExpiry] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const [addCardLoader, setAddCardLoader] = useState(false)
  const [credentialsErr, setCredentialsErr] = useState(false)
  const [addCardSuccess, setAddCardSuccess] = useState(false)
  const [addCardFailure, setAddCardFailure] = useState(false)
  const [subscribeLoader, setsubscribeLoader] = useState(false)
  const [makeDefaultCardLoader, setMakeDefaultCardLoader] = useState(false)

  const [CVC, setCVC] = useState(false)
  const [elementsCreated, setElementsCreated] = useState(false)

  // State to track if user is adding a new payment method
  const [isAddingNewPaymentMethod, setIsAddingNewPaymentMethod] =
    useState(false)

  const cardNumberRef = useRef(null)
  const cardExpiryRef = useRef(null)
  const cardCvcRef = useRef(null)
  const elementsRef = useRef(null)

  // referral code validation states
  const [referralStatus, setReferralStatus] = useState('idle') // idle | loading | valid | invalid
  const [referralMessage, setReferralMessage] = useState('')
  const referralRequestSeqRef = useRef(0)
  const [promoCodeDetails, setPromoCodeDetails] = useState(null) // Store promo code discount details
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isPreSelectedPlanTriggered, setIsPreSelectedPlanTriggered] =
    useState(false)
  const [loading, setLoading] = useState(false)
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('hsl(270, 75%, 50%)')

  let haveCards = cards && cards.length > 0 ? true : false

  // Determine if user is adding a new payment method
  const isUserAddingNewPaymentMethod = () => {
    // If user has no existing cards and is filling out card form
    if (!haveCards && (CardAdded || CardExpiry || CVC)) {
      return true
    }
    // If user has cards but is filling out new card form
    if (haveCards && (CardAdded || CardExpiry || CVC)) {
      return true
    }
    return false
  }

  useEffect(() => {
    console.log("currentSelectedPlan by hamza", currentSelectedPlan)
  }, [currentSelectedPlan])

  // Update the state when payment method fields change
  useEffect(() => {
    setIsAddingNewPaymentMethod(isUserAddingNewPaymentMethod())
  }, [CardAdded, CardExpiry, CVC, haveCards])

  // Function to determine if upgrade button should be enabled
  const isUpgradeButtonEnabled = () => {
    //disable if snack msg is visible
    if (showSnackMsg?.isVisible) {
      return false
    }

    // Must have a selected plan
    if (!currentSelectedPlan) {
      return false
    }

    // Check if selected plan is the current plan
    const isCurrent = isPlanCurrent(currentSelectedPlan)

    if (isCurrent) {
      return false
    }

    // If user is adding a new payment method, they must agree to terms
    if (isAddingNewPaymentMethod && !agreeTerms) {
      return false
    }

    // If user has existing payment methods and is not adding new ones, they can proceed
    if (haveCards && !isAddingNewPaymentMethod) {
      return true
    }

    // If user has no payment methods, they must be adding one
    if (!haveCards && isAddingNewPaymentMethod) {
      const canProceed = CardAdded && CardExpiry && CVC && agreeTerms
      return canProceed
    }

    // If user has payment methods and is adding new ones, they must complete the form
    if (haveCards && isAddingNewPaymentMethod) {
      const canProceed = CardAdded && CardExpiry && CVC && agreeTerms
      return canProceed
    }

    // Check if the selected plan is free
    const planPrice =
      currentSelectedPlan?.discountPrice ||
      currentSelectedPlan?.discountedPrice ||
      currentSelectedPlan?.price ||
      currentSelectedPlan?.originalPrice ||
      0
    const isFreePlan = planPrice === 0 || planPrice === null

    // If no cards and not adding new payment method
    if (!haveCards && !isAddingNewPaymentMethod) {
      // If it's a free plan, allow subscription without payment method
      if (isFreePlan) {
        return true
      }
      return false
    }

    return true
  }

  useEffect(() => { }, [plan])

  // useEffect(() => {
  //     console.log('currentSelectedPlan', currentSelectedPlan)
  //     console.log('setCurrentUserPlan', currentUserPlan)
  // }
  //     , [currentSelectedPlan, currentFullPlan])

  // Get brand primary color on mount and when modal opens
  useEffect(() => {
    const getBrandColor = () => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
          const brandColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--brand-primary')
            .trim()
          if (brandColor) {
            // Handle both formats: "270 75% 50%" or "hsl(270, 75%, 50%)"
            if (brandColor.startsWith('hsl')) {
              setBrandPrimaryColor(brandColor)
            } else {
              setBrandPrimaryColor(`hsl(${brandColor})`)
            }
          }
        } catch (error) { }
      }
    }
    getBrandColor()
    // Also listen for branding updates
    const handleBrandingUpdate = () => {
      getBrandColor()
    }
    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [open])

  // Handle pre-selected plan from previous screen
  useEffect(() => {
    if (open) {
      // Ensure currentUserPlan is set when modal opens
      // getCurrentUserPlan is now async, so we need to await it
      getCurrentUserPlan().then(() => {
        initializePlans()
      })
    }
  }, [open, selectedUser])

  useEffect(() => { }, [currentSelectedPlan])

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
    const timer = setTimeout(async () => {
      try {
        // Include planId if a plan is selected for better discount calculation
        const requestBody = {
          referralCode: inviteCode.trim(),
        }

        if (currentSelectedPlan?.id) {
          requestBody.planId = currentSelectedPlan.id
        }

        const resp = await checkReferralCode(
          inviteCode.trim(),
          requestBody.planId,
        )

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
        const currentSeq = referralRequestSeqRef.current
        if (currentSeq !== referralRequestSeqRef.current) return
        setReferralStatus('invalid')
        setReferralMessage('Unable to validate code. Please try again.')
        setPromoCodeDetails(null)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [inviteCode, currentSelectedPlan?.id])

  // Autofocus the first field when the component mounts
  useEffect(() => {
    // //console.log;
    if (cardNumberRef.current) {
      // //console.log;
      cardNumberRef.current.focus()
    }
  }, [])

  // Create elements only once when Stripe is ready
  useEffect(() => {
    if (stripeReact && elements && !elementsCreated) {
      setElementsCreated(true)
    }
  }, [stripeReact, elements, elementsCreated])

  // Handle field change to focus on the next input
  const handleFieldChange = (event, ref) => {
    if (event.complete && ref.current) {
      ref.current.focus()
    }
  }
  // const [selectedUserPlan, setSelectedUserPlan] = useState(null);

  useEffect(() => {
    // if (!open || currentSelectedPlan) return;
    // if (!plan && !currentFullPlan) {
    //     console.log("No plan or current full plan")
    //     return;
    // }
    if (open) {
    }
  }, [open])

  // Check screen height for scrolling behavior
  useEffect(() => {
    const checkScreenHeight = () => {
      setIsSmallScreen(window.innerHeight < 800)
    }

    checkScreenHeight()
    window.addEventListener('resize', checkScreenHeight)

    return () => window.removeEventListener('resize', checkScreenHeight)
  }, [])

  const initializePlans = async () => {
    if (open) {
      setLoading(true)
      // Load plans and wait for completion
      const plansData = await getPlans()
      getCardsList()
      // getCurrentUserPlan is now async and called in useEffect
      await getCurrentUserPlan()

      // Only proceed with plan selection if we have plans data and haven't triggered yet
      if (plansData && !isPreSelectedPlanTriggered) {
        setIsPreSelectedPlanTriggered(true)

        // Set selected duration based on the plan's billing cycle if selectedPlan is not null
        let planDuration = null

        if (selectedPlan) {
          planDuration = getDurationFromBillingCycle(selectedPlan?.billingCycle)
          if (planDuration) {
            setSelectedDuration(planDuration)
          }
        } else {
          // if selectedPlan is null then set selected duration of current plan
          if (currentUserPlan && currentUserPlan.billingCycle) {
            planDuration = getDurationFromBillingCycle(
              currentUserPlan.billingCycle,
            )
          } else {
            // Use the first available plan from the loaded data
            const firstPlan =
              plansData.monthly[0] ||
              plansData.quarterly[0] ||
              plansData.yearly[0]
            if (firstPlan) {
              planDuration = getDurationFromBillingCycle(firstPlan.billingCycle)
            }
          }
          if (planDuration) {
            setSelectedDuration(planDuration)
          }
        }

        // Wait a bit for selectedDuration to update, then find matching plan
        setTimeout(() => {
          // Get current plans based on the updated selectedDuration
          let currentPlans = []
          if (planDuration?.id === 1) currentPlans = plansData.monthly
          else if (planDuration?.id === 2) currentPlans = plansData.quarterly
          else if (planDuration?.id === 3) currentPlans = plansData.yearly

          const matchingPlan = currentPlans.find(
            (plan) =>
              // plan.name === selectedPlan?.name ||
              plan.id === selectedPlan?.id, //||
            // plan.planType === selectedPlan?.planType
          )

          if (matchingPlan) {
            setCurrentSelectedPlan(matchingPlan)
            const planIndex = currentPlans.findIndex(
              (plan) => plan.id === matchingPlan.id,
            )
            setSelectedPlanIndex(planIndex)
            setTogglePlan(matchingPlan.id)
          } else if (currentPlans.length > 0) {
            setCurrentSelectedPlan(currentPlans[0])
            setSelectedPlanIndex(0)
            setTogglePlan(currentPlans[0]?.id)
          }
          setLoading(false)
        }, 100)
      } else {
        setLoading(false)
      }
    }
  }

  const getCurrentUserPlan = async () => {
    // If selectedUser is provided, fetch their profile instead of using localStorage
    console.log("selectedUser in getCurrentUserPlan", selectedUser);
    if (selectedUser) {
      try {
        const user = await AdminGetProfileDetails(selectedUser.id)
        console.log("User data at checking user plan", user.plan)
        if (user) {
          setCurrentUserPlan(user.plan)
          setHasRedeemedTrial(user.hasRedeemedTrial === true)
          return
        }
      } catch (error) {
        console.error('Error fetching selectedUser profile:', error)
      }
    }

    // Fallback to localStorage for backward compatibility
    const localData = localStorage.getItem('User')
    if (localData) {
      const userData = JSON.parse(localData)
      const plan = userData.user?.plan
      setCurrentUserPlan(plan)
      setHasRedeemedTrial(userData.user?.hasRedeemedTrial === true)
      return
    }
    return null
  }

  useEffect(() => { }, [duration])

  const getPlans = async () => {
    // For agency viewing subaccount, always use getSubAccountPlans with userId
    let plansList = null
    if (selectedUser) {
      try {
        const token = AuthToken()
        const apiPath = `${Apis.getSubAccountPlans}?userId=${selectedUser.id}`
        const response = await axios.get(apiPath, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response && response.data && response.data.status === true) {
          plansList = response.data.data.monthlyPlans || response.data.data
        }
      } catch (error) {
        console.error('Error fetching plans for selectedUser:', error)
      }
    }

    // Fallback to original getUserPlans if no selectedUser or if fetch failed
    if (!plansList) {
      plansList = await getUserPlans(from, selectedUser)
    }

    if (plansList) {
      const monthly = []
      const quarterly = []
      const yearly = []
      let freePlan = null
      const UserLocalData = getUserLocalData()
      if (
        from === 'SubAccount' ||
        UserLocalData?.userRole === 'AgencySubAccount'
      ) {
        plansList?.forEach((plan) => {
          switch (plan.billingCycle) {
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
      } else {
        plansList.forEach((plan) => {
          switch (plan.billingCycle) {
            case 'monthly':
              monthly.push(plan)
              if (plan.discountedPrice === 0) {
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
      }

      if (freePlan) {
        quarterly.unshift({ ...freePlan, billingCycle: 'quarterly' })
        yearly.unshift({ ...freePlan, billingCycle: 'yearly' })
      }

      // setCurrentSelectedPlan(freePlan);
      setTogglePlan(freePlan?.id)

      setMonthlyPlans(monthly)
      setQuaterlyPlans(quarterly)
      setYearlyPlans(yearly)

      const emptyDurations = [monthly, quarterly, yearly].filter(
        (arr) => arr.length === 0,
      ).length
      // if (from === "SubAccount") {
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

      // Return the plans data for immediate use
      return { monthly, quarterly, yearly, freePlan }
    }
    return null
  }
  const getCurrentPlans = () => {
    // console.log("selected duration in get current plans is", selectedDuration)
    if (selectedDuration.id === 1) return monthlyPlans
    if (selectedDuration.id === 2) return quaterlyPlans
    if (selectedDuration.id === 3) return yearlyPlans
    // console.log("selected duration invalid", selectedDuration)
    return []
  }

  // Handler for duration change
  const handleDurationChange = (newDuration) => {
    setSelectedDuration(newDuration)

    // Get plans for the new duration
    let newDurationPlans = []
    if (newDuration.id === 1) newDurationPlans = monthlyPlans
    else if (newDuration.id === 2) newDurationPlans = quaterlyPlans
    else if (newDuration.id === 3) newDurationPlans = yearlyPlans

    // Check if current selected plan exists in the new duration's plans
    if (currentSelectedPlan && newDurationPlans.length > 0) {
      const matchingPlan = newDurationPlans.find(
        (plan) =>
          plan.id === currentSelectedPlan.id ||
          plan.name === currentSelectedPlan.name,
      )

      if (matchingPlan) {
        // Plan exists in new duration, keep it selected
        const planIndex = newDurationPlans.findIndex(
          (plan) =>
            plan.id === matchingPlan.id || plan.name === matchingPlan.name,
        )
        setCurrentSelectedPlan(matchingPlan)
        setSelectedPlanIndex(planIndex)
        setTogglePlan(matchingPlan.id)
      } else {
        // Plan doesn't exist in new duration, set to null
        setCurrentSelectedPlan(null)
        setSelectedPlanIndex(null)
        setTogglePlan(null)
      }
    } else {
      // No current plan or no plans available, set to null
      setCurrentSelectedPlan(null)
      setSelectedPlanIndex(null)
      setTogglePlan(null)
    }
  }

  const handleTogglePlanClick = (item, index) => {
    // Don't allow selection of current plan
    const isCurrentPlan = isPlanCurrent(item)
    if (isCurrentPlan) {
      return
    }
    // setSelectedPlan(item);
    // setSelectedPlanIndex(index);
    setTogglePlan(item.id)
    setCurrentSelectedPlan(item)
  }

  const isPlanCurrent = (item) => {
    if (!currentUserPlan || !item) {
      return false
    }

    // Compare by planId - currentUserPlan.planId is the database plan ID
    // item.id is the plan ID from the plans list
    // Convert both to numbers for strict comparison
    const itemPlanId = Number(item.id || item.planId)
    const currentPlanId = Number(currentUserPlan.planId)

    // Only log when there's a potential match to reduce noise
    if (
      itemPlanId === currentPlanId &&
      currentUserPlan.status !== 'cancelled'
    ) {
      return true
    }

    // Fallback comparison by name (if both have names)
    const itemName = item.name || item.title
    const currentPlanName = currentUserPlan.name
    if (itemName && currentPlanName && itemName === currentPlanName) {
      return true
    }

    // Not the current plan - don't log to reduce noise
    return false
  }

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

  // Function to get duration object from billing cycle
  const getDurationFromBillingCycle = (billingCycle) => {
    switch (billingCycle) {
      case 'monthly':
        return duration[0] // Monthly
      case 'quarterly':
        return duration[1] // Quarterly
      case 'yearly':
        return duration[2] // Yearly
      default:
        return duration[0] // Default to monthly
    }
  }

  //functiion to get cards list
  const getCardsList = async () => {
    try {
      // setGetCardLoader(true);
      let token = AuthToken()

      let ApiPath = Apis.getCardsList

      if (selectedUser) {
        ApiPath = `${ApiPath}?userId=${selectedUser.id}`
      }

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setCards(response.data.data)
        }
      }
    } catch (error) { } finally {
      // //console.log;
      // setGetCardLoader(false);
    }
  }

  const handleAddCard = async (e) => {
    setAddCardLoader(true)
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    const LocalData = localStorage.getItem('User')
    const D = JSON.parse(LocalData)
    const AuthToken = D.token

    if (!stripeReact || !elements) {
      setAddCardLoader(false)
      setAddCardFailure(true)
      setAddCardErrtxt('Stripe elements are not loaded correctly.')
      return
    }

    const cardElement = elements.getElement(CardNumberElement)
    if (!cardElement) {
      setAddCardLoader(false)
      setAddCardFailure(true)
      setAddCardErrtxt('Card element is not initialized.')
      return
    }

    // Include userId in query string if selectedUser is provided
    let setupIntentUrl = Apis.createSetupIntent
    if (selectedUser) {
      setupIntentUrl = `${Apis.createSetupIntent}?userId=${selectedUser.id}`
    }

    const res = await fetch(setupIntentUrl, {
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
        card: cardElement,
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
      return null
    } else {
      // Handle successful payment method addition
      const paymentMethodId = result.setupIntent.payment_method
      let requestBody = {
        source: paymentMethodId,
        inviteCode: inviteCode,
      }

      // Include userId if selectedUser is provided
      if (selectedUser) {
        requestBody.userId = selectedUser.id
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
      if (result2.status) {
        // Only show card success message if we're not in subscription flow
        if (!togglePlan) {
          setAddCardSuccess(true)
          setIsPreSelectedPlanTriggered(false)
          handleClose(result)
        } else {
          // In subscription flow, just update UI without showing success message
          setShowAddCard(false)
          getCardsList()
        }
        setAddCardLoader(false)
        return paymentMethodId // Return the payment method ID
      } else {
        setAddCardFailure(true)
        setAddCardErrtxt(result2.message)
        setAddCardLoader(false)
        return null
      }
    }
  }

  //function to make default cards api
  const makeDefaultCard = async (item) => {
    setSelectedCard(item)
    try {
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
    }
  }

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    // setShowSnackMsg({
    //     type: SnackbarTypes.Success,
    //     message: "Plan upgraded successfully",
    //     isVisible: true
    // })

    // setTimeout(() => {
    //     handleClose(true)
    // }, 3000)
    // return
    try {
      let planType = currentSelectedPlan?.planType

      setsubscribeLoader(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      const selectedUserLocalData = localStorage.getItem(
        PersistanceKeys.isFromAdminOrAgency,
      )
      // return
      // if (selectedUserLocalData !== "undefined" && selectedUserLocalData !== null) {
      //     selectedUser = JSON.parse(selectedUserLocalData);
      //     console.log("Selected user details are", selectedUser);
      // }

      // Handle payment method logic
      let paymentMethodId = null

      // If user is adding a new payment method, add it first
      if (isAddingNewPaymentMethod) {
        paymentMethodId = await handleAddCard()
        if (!paymentMethodId) {
          console.error('Failed to add payment method')
          setsubscribeLoader(false)
          return
        }
      } else if (haveCards && selectedCard) {
        // Use existing payment method
        paymentMethodId = selectedCard.id
      }

      const UserLocalData = getUserLocalData()
      let DataToSendInApi = null
      let ApiData = {
        plan: planType,
      }
      if (
        from === 'SubAccount' ||
        UserLocalData?.userRole === 'AgencySubAccount'
      ) {
        ApiData = {
          planId: currentSelectedPlan?.id,
        }
      } else if (from === 'agency') {
        ApiData = {
          planId: currentSelectedPlan?.id,
        }
      }

      // Add payment method ID if we have one
      if (paymentMethodId) {
        ApiData.paymentMethodId = paymentMethodId
      }

      if (selectedUser) {
        ApiData.userId = selectedUser?.id
      }
      DataToSendInApi = ApiData

      let ApiPath = Apis.subscribePlan
      if (UserLocalData?.userRole === 'AgencySubAccount') {
        ApiPath = Apis.subAgencyAndSubAccountPlans
      }
      if (from === 'SubAccount') {
        ApiPath = Apis.subAgencyAndSubAccountPlans
      } else if (from === 'agency') {
        ApiPath = Apis.subAgencyAndSubAccountPlans
      }

      //headers for api
      let headers = {
        Authorization: 'Bearer ' + AuthToken,
      }

      if (!(UserLocalData?.userRole === 'AgencySubAccount')) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await axios.post(ApiPath, DataToSendInApi, {
        headers: headers,
      })

      if (response) {
        setsubscribeLoader(false)

        // Call getProfileDetails to refresh the profile
        let user
        if (selectedUser) {
          user = await AdminGetProfileDetails(selectedUser?.id) // refresh admin profile
        } else {
          user = getProfileDetails()
        }

        // Pass true to indicate successful upgrade
        // handleClose(true)

        // Create a combined message if a new payment method was added
        let successMessage = response.data.message
        if (isAddingNewPaymentMethod) {
          successMessage = `Payment method added and ${response.data.message.toLowerCase()}`
        }

        setShowSnackMsg({
          type: SnackbarTypes.Success,
          message: successMessage,
          isVisible: true,
        })
        setTimeout(() => {
          setIsPreSelectedPlanTriggered(false)
          handleClose(true)
        }, 3000)
        return
      }
    } catch (error) {
      console.error('Error occurred in subscription:', error)
    } finally {
      setsubscribeLoader(false)
    }
  }

  // Function to get button text, checking for cancelled plan status first
  const getButtonText = () => {
    if (!currentSelectedPlan) return 'Select a Plan'

    // Check user's plan status from currentUserPlan state
    // When selectedUser is provided, currentUserPlan is set from AdminGetProfileDetails
    // Otherwise, it's from localStorage
    const planStatus = currentUserPlan?.status

    // If plan is cancelled, show "Subscribe" regardless of which plan is selected
    if (planStatus === 'cancelled') {
      return 'Subscribe'
    }

    // Check if the selected plan is the user's current plan
    // Compare by planId from currentUserPlan with id from currentSelectedPlan
    const isCurrentPlan =
      currentUserPlan &&
      (currentSelectedPlan.id === currentUserPlan.planId ||
        currentSelectedPlan.planId === currentUserPlan.planId)

    // If selected plan is the current plan, show "Cancel Subscription"
    if (isCurrentPlan) {
      //let's not return any title and disable the button
      return 'Cancel Subscription'
    }

    // If no current plan, show "Subscribe"
    if (!currentUserPlan) {
      return 'Subscribe'
    }

    // Subaccount plans: compare billing → price → plan id only (no name-based tier)
    const direction = getPlanChangeDirection(
      currentUserPlan,
      currentSelectedPlan,
      { skipTierFromName: true },
    )
    if (direction === 'upgrade') return 'Upgrade'
    if (direction === 'downgrade') return 'Downgrade'
    if (direction === 'same') return isCurrentPlan ? 'Cancel Subscription' : 'Upgrade'

    return 'Subscribe'
  }

  const comparePlans = (currentPlan, targetPlan) => {
    if (!currentPlan || !targetPlan) {
      return null // Changed from 'same' to null to indicate loading state
    }

    // If same plan (by ID), it's the same
    if (
      currentPlan.id === targetPlan.id ||
      currentPlan.planId === targetPlan.id
    ) {
      return 'same'
    }

    // Get billing cycle order (monthly < quarterly < yearly)
    const billingCycleOrder = {
      monthly: 1,
      quarterly: 2,
      yearly: 3,
    }

    const currentBillingOrder =
      billingCycleOrder[currentPlan.billingCycle] ||
      billingCycleOrder[currentPlan.duration] ||
      1
    const targetBillingOrder =
      billingCycleOrder[targetPlan.billingCycle] ||
      billingCycleOrder[targetPlan.duration] ||
      1

    // Define tier ranking: Starter < Growth < Scale
    const tierRanking = {
      Starter: 1,
      Growth: 2,
      Scale: 3,
    }

    // Get plan titles/names (try both fields)
    const currentTitle = (
      currentPlan.title ||
      currentPlan.name ||
      ''
    ).toLowerCase()
    const targetTitle = (
      targetPlan.title ||
      targetPlan.name ||
      ''
    ).toLowerCase()

    let currentTierRank = -1
    let targetTierRank = -1

    // Try to match tier from title/name
    for (const [tier, rank] of Object.entries(tierRanking)) {
      if (currentTitle.includes(tier.toLowerCase())) {
        currentTierRank = rank
      }
      if (targetTitle.includes(tier.toLowerCase())) {
        targetTierRank = rank
      }
    }

    // If we can determine tier ranks, compare them first
    // Rule: Scale > Growth > Starter (regardless of billing cycle)
    if (currentTierRank >= 0 && targetTierRank >= 0) {
      // Different tiers - tier comparison determines upgrade/downgrade
      if (targetTierRank > currentTierRank) {
        return 'upgrade'
      } else if (targetTierRank < currentTierRank) {
        return 'downgrade'
      }
      // Same tier - compare billing cycles
      if (targetBillingOrder > currentBillingOrder) {
        return 'upgrade'
      } else if (targetBillingOrder < currentBillingOrder) {
        return 'downgrade'
      } else {
        return 'same'
      }
    }

    // If tier can't be determined, compare billing cycles first
    // Longer billing cycle (yearly > quarterly > monthly) is generally an upgrade
    // This handles cases like "Malik's Plan" monthly -> yearly where tier detection fails
    if (targetBillingOrder > currentBillingOrder) {
      return 'upgrade'
    } else if (targetBillingOrder < currentBillingOrder) {
      return 'downgrade'
    }

    // Fall back to price comparison if billing cycles are the same
    const currentPrice =
      currentPlan.discountPrice ||
      currentPlan.discountedPrice ||
      currentPlan.price ||
      currentPlan.originalPrice ||
      0
    const targetPrice =
      targetPlan.discountPrice ||
      targetPlan.discountedPrice ||
      targetPlan.price ||
      targetPlan.originalPrice ||
      0

    // If target is free plan and current is paid, it's a downgrade
    if ((targetPlan.isFree || targetPrice === 0) && currentPrice > 0) {
      return 'downgrade'
    }

    // If current is free and target is paid, it's an upgrade
    if ((currentPlan.isFree || currentPrice === 0) && targetPrice > 0) {
      return 'upgrade'
    }

    // Compare prices
    if (targetPrice > currentPrice) {
      return 'upgrade'
    } else if (targetPrice < currentPrice) {
      return 'downgrade'
    } else {
      // Same price, same billing cycle - must be the same plan
      return 'same'
    }
  }

  // Function to determine button text and action
  const getButtonConfig = () => {
    // Compare plans based on price
    const planComparison = comparePlans(currentFullPlan, selectedPlan)

    // If still loading (currentFullPlan not ready), don't show any button
    if (planComparison === null) {
      return null // Will hide the button section while loading
    }

    // If it's an upgrade, show Upgrade button
    if (planComparison === 'upgrade') {
      return {
        text: 'Upgrade',
        action: () => handleSubscribePlan(),
        isLoading: subscribeLoader,
        className: 'rounded-xl w-full',
        style: {
          height: '50px',
          fontSize: 16,
          fontWeight: '700',
          flexShrink: 0,
          backgroundColor: 'hsl(var(--brand-primary, 270 75% 50%))',
          color: '#ffffff',
        },
      }
    }

    // Otherwise it's a downgrade
    return {
      text: 'Downgrade',

      action: () => handleSubscribePlan(),
      isLoading: subscribeLoader,
      className: 'rounded-xl w-full',
      style: {
        height: '50px',
        fontSize: 16,
        fontWeight: '700',
        flexShrink: 0,
        backgroundColor: 'hsl(var(--brand-primary, 270 75% 50%))',
        color: '#ffffff',
      },
    }
  }

  return (
    <Modal
      open={open}
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
        <div className="flex flex-col justify-center w-full h-full">
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
            message={addCardErrtxt || 'Card added successfully'}
          />
          <div
            className="w-full flex flex-col border-white"
            style={{
              backgroundColor: '#ffffff',
              padding: 0,
              borderRadius: '13px',
              maxHeight: '85vh',
              height: 'auto',
            }}
          >
            <div className="flex flex-row justify-end w-full h-full items-center pe-5 pt-5">
              <CloseBtn
                onClick={() => {
                  setIsPreSelectedPlanTriggered(false)
                  // setShowRenameAgentPopup(null);
                  handleClose()
                }}
              />
            </div>

            <div className="w-full flex flex-row items-stretch pb-4 content-div h-full overflow-hidden">
              {/* Left Logo */}
              <div
                className="flex flex-col LeftInnerDiv1 items-start justify-center w-[20%]"
                style={{
                  flexShrink: 0,
                }}
              >
                <Image
                  alt="*"
                  src={"/otherAssets/paymentCircle2.png"}
                  height={240}
                  width={190}
                  style={{
                    borderTopRightRadius: '200px',
                    borderBottomRightRadius: '200px',
                    boxShadow: '0 0 40px 0 rgba(128, 90, 213, 0.5)' // purple shadow
                  }}
                />
              </div>

              <div
                className="flex flex-col w-[75%] items-start flex-1 px-6 pb-4"
                style={{
                  scrollbarWidth: 'none',
                  maxHeight: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Header Section */}

                <div className="flex flex-row justify-between mt-2 w-full flex-shrink-0">
                  <div className="w-full ">
                    <h1 className="text-4xl font-bold mb-1">
                      Upgrade Your Plan
                    </h1>
                    <div className="text-[15px] font-semibold">
                      Upgrade for premium features and support
                    </div>
                  </div>

                  <div className="w-full flex flex-row items-end justify-end">
                    {!loading && (
                      <DurationView
                        selectedDuration={selectedDuration}
                        handleDurationChange={handleDurationChange}
                        from={from}
                        duration={duration}
                      />
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div
                  className="w-full flex flex-col items-start flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
                  style={{
                    scrollbarWidth: 'none',
                  }}
                >
                  <div className="text-lg font-semibold">Select Plan</div>

                  <div
                    className="w-full min-w-0 flex flex-row gap-3 mt-3 overflow-x-auto overflow-y-hidden"
                    style={{
                      scrollbarWidth: 'none',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    {loading ? (
                      <div className="w-full flex flex-row items-center justify-center h-[50px]">
                        <CircularProgress className="flex-shrink-0" size={24} />
                      </div>
                    ) : (
                      getCurrentPlans()?.map((item, index) => {
                        const isCurrentPlan = isPlanCurrent(item)
                        return (
                          <button
                            className={`w-3/12 flex flex-col items-start justify-between border-2 p-3 rounded-lg text-left transition-all duration-300
                                                        ${isCurrentPlan
                                ? `${currentSelectedPlan?.id === item.id ? 'border-brand-primary' : 'border-gray-300'} cursor-not-allowed opacity-60`
                                : currentSelectedPlan?.id ===
                                  item.id
                                  ? 'border-brand-primary shadow-md'
                                  : 'border-gray-200 hover:border-brand-primary hover:shadow-md'
                              }`}
                            key={item.id}
                            onClick={() => {
                              handleTogglePlanClick(item, index)
                              // console.log("Selected item billing cycle is", item.billingCycle)
                              // const planDuration = getDurationFromBillingCycle(item?.billingCycle);
                              // setSelectedDuration(planDuration)
                            }}
                            disabled={isCurrentPlan}
                          >
                            <div className="w-full flex flex-row items-center justify-between">
                              <div className="text-[15px] font-semibold">
                                {item.name || item.title}
                              </div>

                              <div className="text-[15px] font-semibold">
                                {`$${formatFractional2(item.discountPrice || item.discountedPrice || item.originalPrice)}`}
                              </div>
                            </div>

                            <div className="text-[13px] font-[500] mt-1">
                              {item.details || item.description}
                            </div>

                            <div
                              className={`py-2 mt-2 flex flex-col items-center justify-center w-full rounded-lg text-[13px] font-semibold
                                                        ${isCurrentPlan
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-brand-primary text-white'
                                }`}
                            >
                              {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>

                  <div className="flex flex-row items-start w-full gap-10 mt-2">
                    <div
                      className="w-[50%] flex flex-col items-start h-[33vh] overflow-y-auto"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {(cards.length === 0 && !showAddCard) ||
                        (showAddCard && cards.length > 0) ? (
                        <CardForm
                          onCardAdded={setCardAdded}
                          onCardExpiry={setCardExpiry}
                          onCVC={setCVC}
                          onFieldChange={handleFieldChange}
                          cardNumberRef={cardNumberRef}
                          cardExpiryRef={cardExpiryRef}
                          cardCvcRef={cardCvcRef}
                          inviteCode={inviteCode}
                          setInviteCode={setInviteCode}
                          referralStatus={referralStatus}
                          referralMessage={referralMessage}
                          addCardLoader={addCardLoader}
                          handleAddCard={handleAddCard}
                          onCancel={() => {
                            setShowAddCard(false)
                          }}
                          haveCards={haveCards}
                        />
                      ) : (
                        <div className="flex flex-col gap-2 mt-2 items-start w-full">
                          <div className="w-full flex flex-row items-center justify-between">
                            <div className="text-lg font-semibold flex flex-row items-start justify-between">
                              Payment
                            </div>

                            <button
                              onClick={() => {
                                setShowAddCard(true)
                              }}
                              className="text-xs font-medium mt-4 text-brand-primary hover:text-brand-primary/80"
                            >
                              + Add Payment
                            </button>
                          </div>
                          {cards?.map((item) => (
                            <div className="w-full" key={item.id}>
                              <button
                                className="w-full outline-none"
                                onClick={() => makeDefaultCard(item)}
                                disabled={makeDefaultCardLoader}
                              >
                                <div
                                  className={`flex items-center justify-between w-full px-2 py-1 border rounded-lg `}
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

                                    <div className="text-xs font-normal">
                                      ****{item.last4}{' '}
                                      {item.isDefault && (
                                        <span>{`(default)`}</span>
                                      )}
                                      {makeDefaultCardLoader &&
                                        selectedCard?.id === item.id && (
                                          <CircularProgress
                                            size={12}
                                            style={{ marginLeft: '8px' }}
                                          />
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Only show Order Summary if a plan is selected */}
                    {currentSelectedPlan && (
                      <div
                        className={`w-[50%] flex flex-col items-start ${haveCards || isAddingNewPaymentMethod ? 'text-black' : 'text-[#8a8a8a]'}`}
                      >
                        <div className="flex flex-row items-center justify-between w-full">
                          <div className=" text-xl font-semibold ">
                            Order Summary
                          </div>
                          <div>
                            {currentSelectedPlan?.hasTrial ? `${currentSelectedPlan?.trialValidForDays} ${currentSelectedPlan?.trialValidForDays > 1 ? 'Days' : 'Day'} free trial` : ''}
                          </div>
                        </div>
                        <div className="flex flex-row items-start justify-between w-full mt-6">
                          <div>
                            <div className=" text-lg font-semibold">
                              {currentSelectedPlan
                                ? `${currentSelectedPlan?.name || currentSelectedPlan?.title}`
                                : 'No Plan Selected'}
                            </div>
                            <div className=" text-xs font-regular capitalize">
                              {currentSelectedPlan
                                ? `${currentSelectedPlan?.billingCycle || currentSelectedPlan?.duration} subscription`
                                : ''}
                            </div>
                            {/*currentSelectedPlan?.billingCycle?.charAt(0).toUpperCase() + currentSelectedPlan?.billingCycle?.slice(1)*/}
                          </div>
                          <div
                            className=""
                            style={{ fontWeight: '600', fontSize: 15 }}
                          >
                            {currentSelectedPlan
                              ? `$${formatFractional2(currentSelectedPlan?.discountPrice || currentSelectedPlan?.discountedPrice || currentSelectedPlan?.originalPrice)}`
                              : ''}
                          </div>
                        </div>

                        {/* Total Billed = actual recurring amount; Due Today (below) = $0 when trial */}
                        {(() => {
                          const billingMonths = GetMonthCountFronBillingCycle(
                            currentSelectedPlan?.billingCycle ||
                            currentSelectedPlan?.duration,
                          )
                          const monthlyPrice =
                            currentSelectedPlan?.discountPrice ||
                            currentSelectedPlan?.discountedPrice ||
                            currentSelectedPlan?.originalPrice ||
                            0
                          const originalTotal = billingMonths * monthlyPrice
                          const discountCalculation = promoCodeDetails
                            ? calculateDiscountedPrice(
                              currentSelectedPlan,
                              promoCodeDetails,
                            )
                            : null

                          const finalTotal = discountCalculation
                            ? discountCalculation.finalPrice
                            : originalTotal

                          return (
                            <>
                              {discountCalculation && (
                                <div className="flex flex-row items-start justify-between w-full mt-4">
                                  <div>
                                    <div
                                      className="text-brand-primary"
                                      style={{
                                        fontWeight: '600',
                                        fontSize: 15,
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
                                      {promoCodeDetails.discountType ===
                                        'percentage'
                                        ? `${promoCodeDetails.discountValue}% off`
                                        : `$${promoCodeDetails.discountValue} off`}
                                      {promoCodeDetails.discountDurationMonths
                                        ? ` for ${promoCodeDetails.discountDurationMonths} month${promoCodeDetails.discountDurationMonths > 1 ? 's' : ''}`
                                        : ''}
                                    </div>
                                  </div>
                                  <div
                                    className="text-brand-primary"
                                    style={{
                                      fontWeight: '600',
                                      fontSize: 15,
                                    }}
                                  >
                                    -$
                                    {formatFractional2(
                                      discountCalculation.discountAmount,
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-row items-start justify-between w-full mt-6">
                                <div>
                                  <div
                                    className="capitalize"
                                    style={{ fontWeight: '600', fontSize: 15 }}
                                  >
                                    {` Total Billed ${currentSelectedPlan?.billingCycle || currentSelectedPlan?.duration}`}
                                  </div>
                                  <div
                                    className=""
                                    style={{
                                      fontWeight: '400',
                                      fontSize: 13,
                                      marginTop: '',
                                    }}
                                  >
                                    Next Charge Date{' '}
                                    {getNextChargeDate(currentSelectedPlan)}
                                  </div>
                                  {discountCalculation &&
                                    discountCalculation.discountMonths > 0 && (
                                      <div
                                        style={{
                                          fontWeight: '400',
                                          fontSize: 12,
                                          marginTop: '4px',
                                          color: '#666',
                                        }}
                                      >
                                        {discountCalculation.discountMonths}{' '}
                                        month
                                        {discountCalculation.discountMonths > 1
                                          ? 's'
                                          : ''}{' '}
                                        at{' '}
                                        {promoCodeDetails.discountType ===
                                          'percentage'
                                          ? `${promoCodeDetails.discountValue}%`
                                          : `$${promoCodeDetails.discountValue}`}{' '}
                                        off
                                        {discountCalculation.fullPriceMonths >
                                          0 &&
                                          `, ${discountCalculation.fullPriceMonths} month${discountCalculation.fullPriceMonths > 1 ? 's' : ''} at full price`}
                                      </div>
                                    )}
                                </div>
                                <div
                                  className=""
                                  style={{ fontWeight: '600', fontSize: 15 }}
                                >
                                  {discountCalculation
                                    ? `$${formatFractional2(finalTotal)}`
                                    : `$${formatFractional2(originalTotal)}`}
                                </div>
                              </div>

                              {inviteCode && !promoCodeDetails && (
                                <div>
                                  <div className="flex flex-row items-start justify-between w-full mt-6">
                                    <div>
                                      <div
                                        style={{
                                          fontWeight: '600',
                                          fontSize: 15,
                                        }}
                                      >
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

                        <div className="w-full h-[1px] bg-gray-200 my-2"></div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Terms and Conditions - Only show when adding new payment method */}

                {/* Upgrade Button Section - Fixed at bottom */}
                <div className="flex w-full flex-shrink-0 mt-4">
                  <div className="w-full">
                    {isAddingNewPaymentMethod && (
                      <div className="w-full">
                        <div className="w-full mb-4 flex flex-row items-center gap-3">
                          <button
                            className="outline-none border-none"
                            onClick={() => setAgreeTerms(!agreeTerms)}
                          >
                            {agreeTerms ? (
                              <div
                                className="bg-brand-primary flex flex-row items-center justify-center rounded"
                                style={{ height: '24px', width: '24px' }}
                              >
                                <Image
                                  src={'/assets/whiteTick.png'}
                                  height={8}
                                  width={10}
                                  alt="*"
                                />
                              </div>
                            ) : (
                              <div
                                className="bg-none border-2 border-gray-300 flex flex-row items-center justify-center rounded"
                                style={{ height: '24px', width: '24px' }}
                              ></div>
                            )}
                          </button>

                          <div
                            className="flex flex-row items-center gap-1"
                            style={{
                              fontWeight: '500',
                              fontSize: 15,
                            }}
                          >
                            <div>I agree to</div>
                            <a
                              href="#"
                              onClick={async (e) => {
                                e.preventDefault()
                                const { termsUrl } = await getPolicyUrls(selectedUser)
                                window.open(termsUrl, '_blank')
                              }}
                              className="text-brand-primary hover:text-brand-primary/80 underline transition-colors duration-200 cursor-pointer"
                              rel="noopener noreferrer"
                            >
                              Terms & Conditions
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row w-full justify-between items-center mt-1 ps-4">
                    <div className=" text-3xl font-semibold  ">Total:</div>
                    <div className=" text-3xl font-semibold  ">
                      {(() => {
                        if (!currentSelectedPlan) return '$0'

                        // Check if plan has trial and user is subscribing for the first time (no previous plan)
                        const hasTrial = currentSelectedPlan?.hasTrial === true
                        if (hasTrial && !hasRedeemedTrial) return '$0'

                        const discountCalculation = promoCodeDetails
                          ? calculateDiscountedPrice(
                            currentSelectedPlan,
                            promoCodeDetails,
                          )
                          : null

                        if (discountCalculation) {
                          return `$${formatFractional2(discountCalculation.finalPrice)}`
                        }

                        const billingMonths = GetMonthCountFronBillingCycle(
                          currentSelectedPlan?.billingCycle ||
                          currentSelectedPlan?.duration,
                        )
                        const monthlyPrice =
                          currentSelectedPlan?.discountPrice ||
                          currentSelectedPlan?.discountedPrice ||
                          currentSelectedPlan?.originalPrice ||
                          0
                        return `$${formatFractional2(billingMonths * monthlyPrice)}`
                      })()}
                    </div>
                  </div>
                </div>

                {/* Hide button if selected plan is the current plan */}
                {currentSelectedPlan && !isPlanCurrent(currentSelectedPlan) && getButtonText() !== 'Cancel Subscription' && (
                  <div className="w-full flex self-end flex-row items-end justify-end flex-shrink-0 mt-3">
                    <div className="w-1/2"></div>
                    <div className="w-1/2">
                      {subscribeLoader ? (
                        <div className="w-full flex flex-col items-center justify-center md:h-[53px] h-[42px]">
                          <CircularProgress size={25} />
                        </div>
                      ) : (
                        <button
                          className={cn("flex md:h-[53px] h-[42px] w-full rounded-lg items-center justify-center text-base sm:text-lg font-semibold text-white", isUpgradeButtonEnabled() ? 'bg-brand-primary cursor-pointer' : 'cursor-not-allowed opacity-60')}
                          onClick={() => {
                            if (isUpgradeButtonEnabled()) {
                              handleSubscribePlan()
                            }
                          }}
                        >{getButtonText()}</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

const styles = {
  paymentModal: {
    height: 'auto',
    maxHeight: '95vh',
    bgcolor: 'transparent',
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    outline: 'none',
    overflow: 'hidden',
  },
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

/**
 * UpgradePlanForUserFromAdminAgency Component
 * 
 * PURPOSE:
 * This component is specifically designed for agency users or admins managing subscriptions for their subaccounts.
 * It ensures that all API calls, plan fetching, and profile data are scoped to the selectedUser (subaccount),
 * not the logged-in agency/admin user.
 * 
 * WHEN TO USE:
 * - When an agency user is viewing/managing a subaccount's plans and payment screen
 * - When an admin is managing a subaccount's subscription
 * - When selectedUser prop is provided (indicating we're managing another user's subscription)
 * - When you need to ensure all operations target the subaccount, not the agency admin
 * 
 * WHERE IT'S USED:
 * - SubAccountPlansAndPayments.js (when selectedUser IS provided - agency viewing subaccount)
 * - AdminAgencyDetails.js (when managing subaccount subscriptions)
 * - Any admin/agency interface managing subaccount plans
 * 
 * KEY DIFFERENCES FROM UpgradePlan:
 * - ALWAYS uses Apis.getSubAccountPlans with userId query parameter when selectedUser is provided
 * - Fetches current plan from selectedUser's profile via AdminGetProfileDetails() API, not localStorage
 * - All payment method operations include userId parameter
 * - SetupIntent creation includes userId to ensure payment method is attached to correct customer
 * - Subscription API calls include userId to subscribe the subaccount, not the agency
 * 
 * PROPS:
 * @param {boolean} open - Controls the visibility of the modal. When true, modal is displayed.
 * @param {Function} handleClose - Callback function called when modal is closed. Receives upgradeResult (boolean) 
 *                                 indicating if subscription was successful. Parent should refresh subaccount profile.
 * @param {Object} plan - Legacy prop, the currently selected plan object (deprecated, use selectedPlan instead).
 * @param {Object} currentFullPlan - The selectedUser's current active plan details from the database. Used for 
 *                                   comparison to determine if selected plan is upgrade/downgrade/same.
 * @param {Object|null} selectedPlan - Pre-selected plan from previous screen. If provided, this plan will 
 *                                     be automatically selected when modal opens. Default: null.
 * @param {Function|null} setSelectedPlan - Callback to update the selected plan in parent component. Default: null.
 * @param {string} from - Context identifier. Typically 'SubAccount' when used for subaccount management.
 *                        Default: 'User'.
 * @param {Object} selectedUser - REQUIRED. The subaccount user object being managed. Must have an 'id' property.
 *                               All operations (plan fetching, payment methods, subscriptions) will target this user.
 *                               Structure: { id: number, name: string, email: string, ... }
 * 
 * DATA FLOW:
 * 1. Component opens -> initializePlans() fetches plans using Apis.getSubAccountPlans?userId={selectedUser.id}
 * 2. getCurrentUserPlan() fetches selectedUser's profile via AdminGetProfileDetails(selectedUser.id)
 * 3. getCardsList() fetches payment methods with ?userId={selectedUser.id}
 * 4. User selects plan and payment method
 * 5. handleAddCard() creates SetupIntent with ?userId={selectedUser.id} and adds card with userId in body
 * 6. handleSubscribePlan() processes subscription with userId in request body
 * 7. On success, handleClose(true) is called and parent should refresh subaccount profile
 * 
 * API ENDPOINTS USED:
 * - Apis.getSubAccountPlans?userId={selectedUser.id} -> Fetches plans available for the subaccount
 * - AdminGetProfileDetails(selectedUser.id) -> Fetches subaccount's current plan and profile
 * - Apis.getCardsList?userId={selectedUser.id} -> Fetches subaccount's payment methods
 * - Apis.createSetupIntent?userId={selectedUser.id} -> Creates Stripe setup intent for subaccount's customer
 * - Apis.addCard (with userId in body) -> Adds payment method to subaccount's Stripe customer
 * - Apis.subAgencyAndSubAccountPlans (with userId in body) -> Subscribes the subaccount to selected plan
 * 
 * STATE MANAGEMENT:
 * - Plans are fetched and stored in monthlyPlans, quaterlyPlans, yearlyPlans (for the subaccount)
 * - Current user plan is stored in currentUserPlan (from selectedUser's profile API, not localStorage)
 * - Selected plan is stored in currentSelectedPlan
 * - Payment methods are stored in cards array (subaccount's payment methods)
 * 
 * IMPORTANT NOTES:
 * - selectedUser prop is REQUIRED for this component to work correctly
 * - Never uses localStorage for current plan - always fetches from API
 * - All Stripe operations target the subaccount's customer, not the agency's customer
 * - Component ensures payment methods are attached to correct Stripe customer (subaccount's)
 */
function UpgradePlanForUserFromAdminAgency({
  open,
  handleClose,
  plan,
  currentFullPlan,
  selectedPlan = null, // Pre-selected plan from previous screen
  setSelectedPlan = null,
  from = 'User',
  selectedUser,
  // setShowSnackMsg = null
}) {
  const stripePromise = getStripe()

  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  return (
    <Elements stripe={stripePromise}>
      <AgentSelectSnackMessage
        message={showSnackMsg.message}
        type={showSnackMsg.type}
        isVisible={showSnackMsg.isVisible}
        hide={() =>
          setShowSnackMsg({ type: null, message: '', isVisible: false })
        }
      />
      <UpgradePlanContent
        open={open}
        handleClose={handleClose}
        plan={plan}
        currentFullPlan={currentFullPlan}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        from={from}
        setShowSnackMsg={setShowSnackMsg}
        showSnackMsg={showSnackMsg}
        selectedUser={selectedUser}
      />
    </Elements>
  )
}

export default UpgradePlanForUserFromAdminAgency
