import axios from 'axios'

import {
  isAgencyTeamMember,
  isSubaccountTeamMember,
  isTeamMember,
} from '@/constants/teamTypes/TeamTypes'

import { formatFractional2 } from '../agency/plan/AgencyUtilities'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'

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
    console.log('error reading cached plans', error)
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
  } catch (error) {
    console.log('error caching plans', error)
  }
}

export const getUserPlans = async (from, selectedUser) => {

  console.log('from passed in get user plans is', from)

  try {
    const cached = getCachedPlans(from)
    const UserLocalData = getUserLocalData()
    // console.log("Selected user passed in get plans in details view", selectedUser)

    // If cache exists and is fresh (< 5 minutes), return cached data
    // if (UserLocalData?.userRole === "AgencySubAccount") {
    //     if (cached && !cached.isStale) {
    //         console.log(`Returning cached plans (${Math.floor(cached.age / 1000)}s old)`);
    //         return cached.data;
    //     }
    // }

    // If cache is stale or doesn't exist, make API call
    let token = AuthToken()

    // If no auth token, avoid hitting protected endpoints
    if (!token) {
      console.log('⚠️ [getUserPlans] No auth token found, skipping plan fetch')
      return null
    }

    let path = Apis.getPlans
    // When selectedUser is provided (agency viewing another user), use selectedUser's role to determine endpoint
    // Otherwise, use logged-in user's role
    const effectiveRole = selectedUser?.userRole || UserLocalData?.userRole
    const role = UserLocalData?.userRole
    const isAgency = role === 'Agency'
    const isSubAccount = role === 'AgencySubAccount'
    const effectiveIsSubAccount = effectiveRole === 'AgencySubAccount'
    const teamAgency =
      isTeamMember(UserLocalData) && isAgencyTeamMember(UserLocalData)
    const teamSub =
      isTeamMember(UserLocalData) && isSubaccountTeamMember(UserLocalData)

    console.log('🔍 [getUserPlans] Debug info:', {
      from,
      selectedUser: selectedUser ? { id: selectedUser.id, role: selectedUser.userRole } : null,
      loggedInUserRole: role,
      effectiveRole,
      effectiveIsSubAccount,
      isAgency,
      isSubAccount,
    })

    // Priority 1: Check if explicitly set via 'from' prop
    if (from === 'agency' || from === 'Agency') {
      console.log('✅ Using agency endpoint (from prop)')
      path = Apis.getPlansForAgency
    } else if (from === 'SubAccount' || from === 'subaccount') {
      console.log('✅ Using subaccount endpoint (from prop)')
      path = Apis.getSubAccountPlans
    }
    // Priority 2: Check if selectedUser is a subaccount (agency viewing subaccount)
    else if (selectedUser && (selectedUser.userRole === 'AgencySubAccount' || selectedUser?.user?.userRole === 'AgencySubAccount')) {
      console.log('✅ Using subaccount endpoint (selectedUser is subaccount)')
      path = Apis.getSubAccountPlans
    }
    // Priority 3: Check logged-in user's role
    else if (isAgency || teamAgency) {
      console.log('✅ Using agency endpoint (logged-in user is agency)')
      path = Apis.getPlansForAgency
    } else if (isSubAccount || teamSub) {
      console.log('✅ Using subaccount endpoint (logged-in user is subaccount)')
      path = Apis.getSubAccountPlans
    } else {
      console.log('✅ Using regular user endpoint')
      path = Apis.getPlans
    }

    console.log('📋 [getUserPlans] Base path:', path)
    console.log('📋 [getUserPlans] selectedUser:', selectedUser ? { 
      id: selectedUser.id, 
      userId: selectedUser.userId,
      role: selectedUser.userRole || selectedUser.role,
      hasId: !!selectedUser.id,
      hasUserId: !!selectedUser.userId,
      idType: typeof selectedUser.id,
      idValue: selectedUser.id,
      allKeys: Object.keys(selectedUser).slice(0, 10) // First 10 keys
    } : 'null/undefined')

    // Always append userId query param if selectedUser is provided
    // CRITICAL: For subaccount endpoint, we MUST have userId when selectedUser is provided
    // Try multiple ways to get the userId
    const userId = selectedUser?.id || selectedUser?.userId || selectedUser?.user?.id || selectedUser?.user?.userId
    
    if (userId) {
      // Check if path already has query params
      const separator = path.includes('?') ? '&' : '?'
      path = `${path}${separator}userId=${userId}`
      console.log('✅ [getUserPlans] Final path with userId:', path)
    } else if (path === Apis.getSubAccountPlans) {
      // If using subaccount endpoint but no userId, log warning
      console.error('❌ [getUserPlans] CRITICAL: Using subaccount endpoint but no userId found!', {
        selectedUser: selectedUser ? 'exists but no id' : 'null/undefined',
        selectedUserKeys: selectedUser ? Object.keys(selectedUser) : [],
        selectedUserId: selectedUser?.id,
        selectedUserUserId: selectedUser?.userId,
        nestedUserId: selectedUser?.user?.id
      })
      // Don't proceed without userId for subaccount endpoint - this will cause empty results
    } else {
      console.log('ℹ️ [getUserPlans] No userId needed for this endpoint')
    }
    let response

    response = await axios.get(path, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })

    if (response) {
      console.log('user plans are', response.data)
      if (response.data.status == true) {
        const plansData = response.data.data

        // Cache the fresh data
        setCachedPlans(plansData, from)
        // Return monthlyPlans if the effective user (selectedUser or logged-in user) is a subaccount
        const effectiveRole = selectedUser?.userRole || UserLocalData?.userRole
        if (effectiveRole === 'AgencySubAccount') {
          return response.data.data.monthlyPlans || response.data.data
        }
        return plansData
      } else {
        // If API fails but we have stale cache, return it
        if (cached) {
          console.log('API failed, returning stale cached plans')
          return cached.data
        }
        return null
      }
    }
  } catch (error) {
    console.log('error in get plans api', error)

    // If API fails but we have cached data (even if stale), return it
    const cached = getCachedPlans(from)
    if (cached) {
      console.log('API error, returning cached plans as fallback')
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
        console.log('response of initiate cancelation', response.data)
        return response.data.data
      } else {
        return null
      }
    }
  } catch (error) {
    console.log('error initiate api', error)
  }
}

export const pauseSubscription = async (selectedUser = null) => {
  try {
    let token = AuthToken()
    // console.log('token', token)

    let path = Apis.pauseSubscription

    console.log('path of pause subscription', path)

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
      console.log('response of puase cancelation', response.data)
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) {
    console.log('error in pause api', error)
  }
}

export const claimGift = async (selectedUser = null) => {
  try {
    let token = AuthToken()
    // console.log('token', token)

    let path = Apis.claimGiftMins

    console.log('path of claim gift', path)

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
      console.log('response of claimGiftMins', response.data)
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) {
    console.log('error claimGiftMins api', error)
  }
}

export const getDiscount = async () => {
  try {
    let token = AuthToken()

    console.log('trying to obtain offer')

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
      console.log('response of discount', response.data)
      if (response.data.status == true) {
        return response.data.data
      } else {
        return null
      }
    }
  } catch (error) {
    console.log('error discount api', error)
  }
}

export const completeCancelation = async (reason, selectedUser = null) => {
  try {
    let token = AuthToken()

    let path = Apis.completeCancelatiton

    console.log('path of complete cancelation', path)

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
      console.log('response of completeCancelatiton', response.data)
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) {
    console.log('error completeCancelatiton api', error)
  }
}

export const purchaseMins = async (mins) => {
  try {
    let token = AuthToken()

    console.log('trying to obtain offer')

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
      console.log('response of completeCancelatiton', response.data)
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) {
    console.log('error completeCancelatiton api', error)
  }
}

export const checkReferralCode = async (code, planId = null) => {
  try {
    let token = AuthToken()

    console.log('trying to obtain offer')

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
      console.log('response of referral code validations', response.data)
      if (response.data.status == true) {
        return response.data
      } else {
        return response.data
      }
    }
  } catch (error) {
    console.log('error referral code validations api', error)
  }
}

export const calculateDiscountedPrice = (discountValue, discountType, totalPrice) => {
  if (discountType === 'percentage') {
    return totalPrice - (totalPrice * discountValue) / 100
  } else if (discountType === 'flat_amount') {
    return Math.min(discountValue, totalPrice)
  }else{
    return totalPrice
  }
}

export const calculatePlanPrice = (selectedPlan) => {
  console.log('Scale plan value passed is', selectedPlan)
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

  console.log('selected plan in monthly plan func is', selectedPlan)

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
  console.log('Selected plan for pricing:', selectedPlan)
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
  try {
    const billingCycle =
      (selectedPlan && (selectedPlan.billingCycle || selectedPlan.duration)) ||
      'monthly'

    const baseDate = new Date(fromDate)
    const nextDate = new Date(baseDate)

    // Check if plan has trial and add trial days first
    const hasTrial = selectedPlan?.hasTrial === true
    const trialDays = selectedPlan?.trialValidForDays || 0

    if (hasTrial && trialDays > 0) {
      // Add trial days to the base date
      nextDate.setDate(nextDate.getDate() + trialDays)
    } else {
      // No trial, calculate based on billing cycle
      if (billingCycle === 'monthly') {
        // exactly 30 days from now as requested
        nextDate.setDate(nextDate.getDate() + 30)
      } else if (billingCycle === 'quarterly') {
        // add 3 calendar months
        const month = nextDate.getMonth()
        nextDate.setMonth(month + 3)
      } else if (billingCycle === 'yearly') {
        // add 12 calendar months
        const month = nextDate.getMonth()
        nextDate.setMonth(month + 12)
      } else {
        // default to 30 days if unknown
        nextDate.setDate(nextDate.getDate() + 30)
      }
    }

    const formatted = nextDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return formatted
  } catch (e) {
    return ''
  }
}
