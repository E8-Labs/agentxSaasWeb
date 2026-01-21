import axios from 'axios'

import {
  isAgencyTeamMember,
  isSubaccountTeamMember,
  isTeamMember,
} from '@/constants/teamTypes/TeamTypes'

import { formatFractional2 } from '../agency/plan/AgencyUtilities'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import { planLogger, LOG_CATEGORIES } from '../../utils/planLogger'
import { X } from 'lucide-react'

//use the dynamic values here  @arslan

export const downgradeToStarterFeatures = [
  '10 AI Agents',
  'GHL Subaccount & Snapshots',
  '10,000 Contacts',
  'Priority Support ',
  'Ultra Priority Calling',
  '4 Team Seats',
  'Zoom Support Webinar',
  '450 AI Credits',
]

export const downgradeToGrowthFeatures = [
  'Unlimited AI Agents',
  '1000 AI Credits',
  'Unlimited Contacts',
  'Success Manager',
  'Unlimited Team Seats',
]

export const isLagecyPlan = (plan) => {
  if (
    plan?.features == null //||
    // plan?.planId == null ||
    // plan?.type == "Plan30" ||
    // plan?.type == "Plan120" ||
    // plan?.type == "Plan360" ||
    // plan?.type == "Plan720"
  ) {
    return true
  }

  return false
}

const PLANS_CACHE_KEY = 'userPlans_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export const isPlanActive = (plan) => {
  if (plan?.status === 'active') {
    return true
  }
  return false
}

const getCachedPlans = (from) => {
  try {
    const cacheKey = `${PLANS_CACHE_KEY}_${from || 'default'}`
    const cached = localStorage.getItem(cacheKey)

    if (!cached) {
      return null
    }

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    const age = now - timestamp

    return {
      data,
      isStale: age > CACHE_DURATION,
      age,
    }
  } catch (error) {
    return null
  }
}

const setCachedPlans = (data, from) => {
  try {
    const cacheKey = `${PLANS_CACHE_KEY}_${from || 'default'}`
    const cacheData = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) { }
}

/**
 * Determines the effective user whose plans should be fetched
 * 
 * Rules:
 * 1. If selectedUser is provided (admin viewing another user OR agency viewing subaccount), use selectedUser
 * 2. Otherwise, use logged-in user
 * 
 * @param {Object|null} selectedUser - The user being viewed (if any)
 * @param {Object|null} loggedInUser - The currently logged-in user
 * @returns {Object} Effective user object with metadata
 */
export const getEffectiveUser = (selectedUser, loggedInUser) => {
  console.log("selectedUser in UserPlanService", selectedUser)
  // If selectedUser is provided, that's the effective user (admin/agency viewing another user)
  if (selectedUser) {
    // Try multiple ways to extract userRole
    let userRole = selectedUser.userRole ||
      selectedUser.user?.userRole ||
      selectedUser.role

    // If userRole is still undefined, try to infer from other properties
    if (!userRole) {
      // Check if it's a subaccount by checking for subaccount-specific properties
      // Subaccounts typically have planCapabilities but might not have userRole set
      // If we have an ID and it's being viewed by admin/agency, we might need to check the API response
      // For now, we'll rely on the 'from' prop fallback in getPlanEndpoint
      planLogger.warn(LOG_CATEGORIES.USER_CONTEXT, 'selectedUser provided but userRole is undefined, will use from prop fallback', {
        selectedUserId: selectedUser.id || selectedUser.userId,
        selectedUserKeys: Object.keys(selectedUser),
        hasPlanCapabilities: !!selectedUser.planCapabilities,
      })
    }

    const effectiveUser = {
      id: selectedUser.id || selectedUser.userId || selectedUser.user?.id || selectedUser.user?.userId,
      userRole: userRole,
      isSelectedUser: true,
      source: 'selectedUser',
      // Store full selectedUser object for additional checks if needed
      _selectedUser: selectedUser,
    }

    planLogger.logEffectiveUser(effectiveUser, 'selectedUser provided')
    return effectiveUser
  }

  // Otherwise, use logged-in user (user viewing their own plans)
  const effectiveUser = {
    id: loggedInUser?.id,
    userRole: loggedInUser?.userRole,
    isSelectedUser: false,
    source: 'loggedInUser',
  }

  planLogger.logEffectiveUser(effectiveUser, 'using logged-in user')
  return effectiveUser
}

/**
 * Determines the correct API endpoint based on effective user's role
 * 
 * @param {Object} effectiveUser - The effective user object
 * @param {Object} loggedInUser - The logged-in user (for team member checks)
 * @param {string} from - Optional context prop (legacy support)
 * @returns {string} API endpoint path
 */
const getPlanEndpoint = (effectiveUser, loggedInUser, from = null) => {
  const effectiveRole = effectiveUser?.userRole

  // Priority 1: Effective user is a subaccount
  if (effectiveRole === 'AgencySubAccount') {
    planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using subaccount endpoint (effective user is subaccount)', {
      effectiveUserId: effectiveUser.id,
      effectiveRole,
    })
    return Apis.getSubAccountPlans
  }

  // Priority 2: Effective user is an agency
  if (effectiveRole === 'Agency') {
    planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using agency endpoint (effective user is agency)', {
      effectiveUserId: effectiveUser.id,
      effectiveRole,
    })
    return Apis.getPlansForAgency
  }

  // Priority 3: If effectiveUser is selectedUser but role is undefined, use 'from' prop as fallback
  if (effectiveUser?.isSelectedUser && !effectiveRole && from) {
    if (from === 'SubAccount' || from === 'subaccount') {
      planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using subaccount endpoint (from prop fallback - selectedUser without role)', {
        effectiveUserId: effectiveUser.id,
        from,
      })
      return Apis.getSubAccountPlans
    }
    if (from === 'agency' || from === 'Agency') {
      planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using agency endpoint (from prop fallback - selectedUser without role)', {
        effectiveUserId: effectiveUser.id,
        from,
      })
      return Apis.getPlansForAgency
    }
  }

  // Priority 4: Check logged-in user's team membership (for team members viewing on behalf)
  const isTeamAgency = isTeamMember(loggedInUser) && isAgencyTeamMember(loggedInUser)
  const isTeamSub = isTeamMember(loggedInUser) && isSubaccountTeamMember(loggedInUser)

  if (isTeamAgency) {
    planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using agency endpoint (team member is agency)', {
      effectiveUserId: effectiveUser.id,
    })
    return Apis.getPlansForAgency
  }

  if (isTeamSub) {
    planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using subaccount endpoint (team member is subaccount)', {
      effectiveUserId: effectiveUser.id,
    })
    return Apis.getSubAccountPlans
  }

  // Priority 5: Legacy 'from' prop support (for backward compatibility)
  if (from === 'agency' || from === 'Agency') {
    planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using agency endpoint (from prop)', {
      from,
    })
    return Apis.getPlansForAgency
  }

  if (from === 'SubAccount') {
    planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using subaccount endpoint (from prop)', {
      from,
    })
    return Apis.getSubAccountPlans
  }

  // Default: Regular user plans
  planLogger.debug(LOG_CATEGORIES.API_CALL, 'Using regular user endpoint', {
    effectiveUserId: effectiveUser.id,
    effectiveRole,
  })
  return Apis.getPlans
}

/**
 * Fetches plans for the effective user
 * 
 * Logic:
 * - If selectedUser is provided (admin viewing another user OR agency viewing subaccount), fetch that user's plans
 * - Otherwise, fetch logged-in user's plans
 * 
 * @param {string|null} from - Legacy context prop (optional, for backward compatibility)
 * @param {Object|null} selectedUser - The user being viewed (if any)
 * @returns {Promise<Object|null>} Plans data or null if error
 */
export const getUserPlans = async (from, selectedUser) => {
  try {
    const UserLocalData = getUserLocalData()

    // Determine effective user (selectedUser if provided, otherwise logged-in user)
    const effectiveUser = getEffectiveUser(selectedUser, UserLocalData)

    // Determine API endpoint based on effective user
    const basePath = getPlanEndpoint(effectiveUser, UserLocalData, from)

    // Build full API path with userId if needed
    let path = basePath
    const userId = effectiveUser.id

    // Append userId query param if:
    // 1. We have an effective userId AND
    // 2. Either: effective user is selectedUser (viewing another user) OR endpoint requires userId
    const requiresUserId = basePath === Apis.getSubAccountPlans || effectiveUser.isSelectedUser

    if (userId && requiresUserId) {
      const separator = path.includes('?') ? '&' : '?'
      path = `${path}${separator}userId=${userId}`
    } else if (requiresUserId && !userId) {
      // Critical: subaccount endpoint requires userId
      planLogger.error(LOG_CATEGORIES.API_CALL, 'CRITICAL: Subaccount endpoint requires userId but none found', {
        effectiveUser,
        selectedUser: selectedUser ? Object.keys(selectedUser) : null,
        basePath,
      })
      // Return null instead of making invalid API call
      return null
    }

    // Check cache (using effective user's role for cache key)
    const cacheKey = effectiveUser.userRole || from || 'default'
    const cached = getCachedPlans(cacheKey)

    // Get auth token
    const token = AuthToken()
    if (!token) {
      planLogger.warn(LOG_CATEGORIES.API_CALL, 'No auth token available', {})
      return cached?.data || null
    }

    // Log API call
    planLogger.logPlanFetch(path, userId, effectiveUser.userRole)

    // Make API call
    const response = await axios.get(path, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })

    if (response?.data?.status === true) {
      const plansData = response.data.data

      // Cache the fresh data
      setCachedPlans(plansData, cacheKey)

      // Log success
      const planCount = Array.isArray(plansData)
        ? plansData.length
        : (plansData?.monthlyPlans?.length || Object.keys(plansData).length)
      planLogger.logPlanFetchSuccess(path, planCount)

      // Return monthlyPlans if effective user is a subaccount
      if (effectiveUser.userRole === 'AgencySubAccount') {
        return plansData.monthlyPlans || plansData
      }

      return plansData
    } else {
      // API returned error status, try to use cached data
      if (cached?.data) {
        planLogger.warn(LOG_CATEGORIES.API_CALL, 'API returned error, using cached data', {
          path,
          apiStatus: response?.data?.status,
        })
        return cached.data
      }
      planLogger.error(LOG_CATEGORIES.API_CALL, 'API returned error and no cache available', {
        path,
        apiStatus: response?.data?.status,
      })
      return null
    }
  } catch (error) {
    // Log error
    const cacheKey = selectedUser?.userRole || from || 'default'
    planLogger.logPlanFetchError('unknown', error)

    // Try to return cached data as fallback
    const cached = getCachedPlans(cacheKey)
    if (cached?.data) {
      planLogger.warn(LOG_CATEGORIES.API_CALL, 'Using cached data after error', {
        error: error?.message,
      })
      return cached.data
    }

    return null
  }
}

//get user local details
export const getUserLocalData = () => {
  const Data = localStorage.getItem('User')
  if (Data) {
    const UD = JSON.parse(Data)
    const userData = UD.user
    return userData
  }
  return null
}

export const initiateCancellation = async (userId) => {
  try {
    let token = AuthToken()
    let path = Apis.initiateCancelation

    const requestBody = {}
    if (userId) {
      requestBody.userId = userId
    }

    const response = await axios.post(path, requestBody, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status == true) {
        return response.data.data
      } else {
        return null
      }
    }
  } catch (error) { }
}

export const pauseSubscription = async (selectedUser = null) => {
  try {
    let token = AuthToken()
    // console.log('token', token)

    let path = Apis.pauseSubscription

    const requestBody = {}
    if (selectedUser) {
      requestBody.userId = selectedUser.id
    }

    const response = await axios.post(path, requestBody, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) { }
}

export const claimGift = async (selectedUser = null) => {
  try {
    let token = AuthToken()
    // console.log('token', token)

    let path = Apis.claimGiftMins

    const requestBody = {}
    if (selectedUser) {
      requestBody.userId = selectedUser.id
    }

    const response = await axios.post(path, requestBody, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) { }
}

export const getDiscount = async () => {
  try {
    let token = AuthToken()

    const response = await axios.post(
      Apis.continueToDiscount,
      {},
      {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      },
    )

    if (response) {
      if (response.data.status == true) {
        return response.data.data
      } else {
        return null
      }
    }
  } catch (error) { }
}

export const completeCancelation = async (reason, selectedUser = null) => {
  try {
    let token = AuthToken()

    let path = Apis.completeCancelatiton

    const requestBody = {
      cancellationReason: reason,
    }
    if (selectedUser) {
      requestBody.userId = selectedUser.id
    }

    const response = await axios.post(path, requestBody, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) { }
}

export const purchaseMins = async (mins) => {
  try {
    let token = AuthToken()

    const response = await axios.post(
      Apis.purchaseDiscountedMins,
      {
        requestedMinutes: mins,
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      },
    )

    if (response) {
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) { }
}

export const checkReferralCode = async (code, planId = null) => {
  try {
    let token = AuthToken()

    const requestBody = {
      referralCode: code,
    }

    if (planId) {
      requestBody.planId = planId
    }

    const response = await axios.post(Apis.validateReferralCode, requestBody, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) { }
}

export const calculateDiscountedPrice = (discountValue, discountType, totalPrice) => {
  if (discountType === 'percentage') {
    return totalPrice - (totalPrice * discountValue) / 100
  } else if (discountType === 'flat_amount') {
    return Math.min(discountValue, totalPrice)
  } else {
    return totalPrice
  }
}

export const calculatePlanPrice = (selectedPlan) => {
  if (!selectedPlan) {
    return '-'
  }
  if (selectedPlan.billingCycle === 'monthly') {
    return '$' + 1 * selectedPlan.discountPrice
  } else if (selectedPlan.billingCycle === 'quarterly') {
    return '$' + (3 * selectedPlan.discountPrice).toFixed(2)
  } else if (selectedPlan.billingCycle === 'yearly') {
    return '$' + (12 * selectedPlan.discountPrice).toFixed(2)
  } else {
    return '-'
  }
}

export const getMonthlyPrice = (selectedPlan) => {
  if (!selectedPlan) {
    return 0
  }

  const price =
    selectedPlan.discountedPrice ||
    selectedPlan.discountPrice ||
    selectedPlan.originalPrice ||
    0
  const billingCycle = selectedPlan.billingCycle || selectedPlan.duration

  if (billingCycle === 'monthly') {
    return price
  } else if (billingCycle === 'quarterly') {
    return (price * 3) / 3 // Price per month for quarterly
  } else if (billingCycle === 'yearly') {
    return (price * 12) / 12 // Price per month for yearly
  } else {
    return price
  }
}

export const getTotalPrice = (selectedPlan) => {
  if (!selectedPlan) {
    return 0
  }

  let price =
    selectedPlan.discountedPrice ||
    selectedPlan.discountPrice ||
    selectedPlan.originalPrice ||
    0
  const billingCycle = selectedPlan.billingCycle || selectedPlan.duration

  if (billingCycle === 'monthly') {
    price = price * 1
  } else if (billingCycle === 'quarterly') {
    price = price * 3
  } else if (billingCycle === 'yearly') {
    price = price * 12
  } else {
    price = price
  }

  return formatFractional2(price)
}

// Returns a human-friendly next charge date string based on plan billing cycle
// monthly: +30 days, quarterly: +3 calendar months, yearly: +12 calendar months
// If plan has trial, adds trial days to the date
export const getNextChargeDate = (selectedPlan, fromDate = new Date()) => {
  const getTodayFormatted = () => {
    const today = new Date()
    return today.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  try {
    console.log('[getNextChargeDate] Starting calculation', {
      selectedPlan: selectedPlan ? { id: selectedPlan.id, billingCycle: selectedPlan.billingCycle, duration: selectedPlan.duration } : null,
      fromDate,
      fromDateType: typeof fromDate,
    })

    const billingCycle =
      (selectedPlan && (selectedPlan.billingCycle || selectedPlan.duration)) ||
      'monthly'

    console.log('[getNextChargeDate] Billing cycle determined:', {
      billingCycle,
      hasSelectedPlan: !!selectedPlan,
      planBillingCycle: selectedPlan?.billingCycle,
      planDuration: selectedPlan?.duration,
    })

    const baseDate = new Date(fromDate)
    
    // Validate baseDate
    if (isNaN(baseDate.getTime())) {
      console.error('[getNextChargeDate] Invalid fromDate parameter', {
        fromDate,
        fromDateType: typeof fromDate,
        baseDateValue: baseDate.toString(),
      })
      const todayFormatted = getTodayFormatted()
      console.log('[getNextChargeDate] Returning today\'s date as fallback:', todayFormatted)
      return todayFormatted
    }

    console.log('[getNextChargeDate] Base date created successfully', {
      baseDate: baseDate.toISOString(),
      baseDateValid: !isNaN(baseDate.getTime()),
    })

    const nextDate = new Date(baseDate)

    // Check if plan has trial and add trial days first
    const hasTrial = selectedPlan?.hasTrial === true
    const trialDays = selectedPlan?.trialValidForDays || 0

    console.log('[getNextChargeDate] Trial information', {
      hasTrial,
      trialDays,
    })

    if (hasTrial && trialDays > 0) {
      // Add trial days to the base date
      const beforeTrial = new Date(nextDate)
      nextDate.setDate(nextDate.getDate() + trialDays)
      console.log('[getNextChargeDate] Added trial days', {
        beforeTrial: beforeTrial.toISOString(),
        afterTrial: nextDate.toISOString(),
        trialDaysAdded: trialDays,
      })
    } else {
      // No trial, calculate based on billing cycle
      const beforeCalculation = new Date(nextDate)
      
      if (billingCycle === 'monthly') {
        // exactly 30 days from now as requested
        nextDate.setDate(nextDate.getDate() + 30)
        console.log('[getNextChargeDate] Applied monthly billing cycle', {
          before: beforeCalculation.toISOString(),
          after: nextDate.toISOString(),
          daysAdded: 30,
        })
      } else if (billingCycle === 'quarterly') {
        // add 3 calendar months
        const month = nextDate.getMonth()
        nextDate.setMonth(month + 3)
        console.log('[getNextChargeDate] Applied quarterly billing cycle', {
          before: beforeCalculation.toISOString(),
          after: nextDate.toISOString(),
          monthsAdded: 3,
        })
      } else if (billingCycle === 'yearly') {
        // add 12 calendar months
        const month = nextDate.getMonth()
        nextDate.setMonth(month + 12)
        console.log('[getNextChargeDate] Applied yearly billing cycle', {
          before: beforeCalculation.toISOString(),
          after: nextDate.toISOString(),
          monthsAdded: 12,
        })
      } else {
        // default to 30 days if unknown
        nextDate.setDate(nextDate.getDate() + 30)
        console.warn('[getNextChargeDate] Unknown billing cycle, defaulting to 30 days', {
          billingCycle,
          before: beforeCalculation.toISOString(),
          after: nextDate.toISOString(),
        })
      }
    }

    // Validate nextDate after calculations
    if (isNaN(nextDate.getTime())) {
      console.error('[getNextChargeDate] Invalid nextDate after calculations', {
        nextDateValue: nextDate.toString(),
        billingCycle,
        hasTrial,
        trialDays,
      })
      const todayFormatted = getTodayFormatted()
      console.log('[getNextChargeDate] Returning today\'s date as fallback:', todayFormatted)
      return todayFormatted
    }

    const formatted = nextDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Validate formatted string
    if (formatted === 'Invalid Date' || !formatted || formatted.trim() === '') {
      console.error('[getNextChargeDate] Invalid formatted date string', {
        formatted,
        nextDateISO: nextDate.toISOString(),
        nextDateValid: !isNaN(nextDate.getTime()),
      })
      const todayFormatted = getTodayFormatted()
      console.log('[getNextChargeDate] Returning today\'s date as fallback:', todayFormatted)
      return todayFormatted
    }

    console.log('[getNextChargeDate] Successfully calculated next charge date', {
      formatted,
      nextDateISO: nextDate.toISOString(),
    })

    return formatted
  } catch (e) {
    console.error('[getNextChargeDate] Error occurred during calculation', {
      error: e,
      errorMessage: e?.message,
      errorStack: e?.stack,
      selectedPlan: selectedPlan ? { id: selectedPlan.id, billingCycle: selectedPlan.billingCycle, duration: selectedPlan.duration } : null,
      fromDate,
      fromDateType: typeof fromDate,
    })
    const todayFormatted = getTodayFormatted()
    console.log('[getNextChargeDate] Returning today\'s date as fallback:', todayFormatted)
    return todayFormatted
  }
}