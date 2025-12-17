import Apis from '@/components/apis/Apis'
import { hexToHsl, calculateIconFilter } from '@/utilities/colorUtils'
import { UserRole } from '@/constants/UserRole'

/**
 * Check if server already applied branding via SSR
 * Returns true if we should skip client-side branding application
 */
const isServerBrandingApplied = () => {
  if (typeof document === 'undefined') return false
  return document.documentElement.dataset.brandingApplied === 'server'
}

/**
 * Set branding cookie for server-side access
 * This ensures middleware can read branding on subsequent requests
 */
export const setBrandingCookie = (branding) => {
  if (typeof document === 'undefined') return
  try {
    const value = encodeURIComponent(JSON.stringify(branding))
    document.cookie = `agencyBranding=${value}; path=/; max-age=${60 * 60 * 24}; samesite=lax`
    console.log('🍪 [setBrandingCookie] Cookie updated with branding')
  } catch (e) {
    console.error('❌ [setBrandingCookie] Error setting cookie:', e)
    // Silent fail - cookie setting is best effort
  }
}

/**
 * Apply branding styles to the document
 * Sets CSS variables for colors and icon filter
 */
const applyBrandingStyles = (branding) => {
  if (typeof document === 'undefined') return
  try {
    const primaryColor = branding.primaryColor || '#7902DF'
    const secondaryColor = branding.secondaryColor || '#8B5CF6'

    // Convert hex to HSL
    const primaryHsl = hexToHsl(primaryColor)
    const secondaryHsl = hexToHsl(secondaryColor)

    // Set CSS variables immediately
    document.documentElement.style.setProperty('--brand-primary', primaryHsl)
    document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
    document.documentElement.style.setProperty('--primary', primaryHsl)
    document.documentElement.style.setProperty('--secondary', secondaryHsl)

    // Calculate and set icon filter
    const iconFilter = calculateIconFilter(primaryColor)
    document.documentElement.style.setProperty('--icon-filter', iconFilter)
    
    console.log('✅ [applyBrandingStyles] Branding styles applied:', {
      primaryColor,
      secondaryColor,
    })
  } catch (error) {
    console.error('❌ [applyBrandingStyles] Error applying styles:', error)
  }
}

/**
 * Update branding cookie and apply branding immediately
 * This is the main function to call when branding is updated
 * @param {Object} branding - The branding object to apply
 * @param {boolean} skipServerCheck - If true, skip server branding check
 * @returns {boolean} - Returns true if branding was applied
 */
export const updateBrandingCookieAndApply = (branding, skipServerCheck = false) => {
  if (typeof window === 'undefined') return false

  // Skip if server already applied branding (unless explicitly skipped)
  if (!skipServerCheck && isServerBrandingApplied()) {
    console.log('✅ [updateBrandingCookieAndApply] Server already applied branding, skipping client-side application')
    // Still update cookie for consistency
    setBrandingCookie(branding)
    return true
  }

  if (!branding || typeof branding !== 'object' || Object.keys(branding).length === 0) {
    console.warn('⚠️ [updateBrandingCookieAndApply] Invalid branding object')
    return false
  }

  try {
    // Update localStorage
    localStorage.setItem('agencyBranding', JSON.stringify(branding))
    console.log('💾 [updateBrandingCookieAndApply] Updated localStorage with branding')

    // Update cookie
    setBrandingCookie(branding)

    // Apply branding styles immediately
    applyBrandingStyles(branding)

    // Dispatch event for any components listening for branding updates
    window.dispatchEvent(
      new CustomEvent('agencyBrandingUpdated', { detail: branding })
    )
    console.log('📢 [updateBrandingCookieAndApply] Dispatched agencyBrandingUpdated event')

    return true
  } catch (error) {
    console.error('❌ [updateBrandingCookieAndApply] Error updating branding:', error)
    return false
  }
}

/**
 * Apply agency branding after registration or login
 * Extracts branding from response data, stores it, and dispatches event
 */
export const applyBrandingFromResponse = (responseData) => {
  if (typeof window === 'undefined') return false

  // Skip if server already applied branding
  if (isServerBrandingApplied()) {
    console.log('✅ [applyBranding] Server already applied branding, skipping client-side application')
    return true
  }

  try {
    // Extract branding from various possible locations in response
    // Registration response structure: response.data.data.agencyBranding (from userProfileFullResource)
    // Login response structure: response.data.data.user.agencyBranding or response.data.data.agencyBranding
    let agencyBranding =
      responseData?.agencyBranding ||
      responseData?.user?.agencyBranding ||
      responseData?.data?.agencyBranding ||
      responseData?.data?.user?.agencyBranding ||
      responseData?.data?.data?.agencyBranding ||
      responseData?.data?.data?.user?.agencyBranding

    // If branding found, store and dispatch
    if (agencyBranding && typeof agencyBranding === 'object' && Object.keys(agencyBranding).length > 0) {
      // Use the centralized function to update cookie and apply branding
      return updateBrandingCookieAndApply(agencyBranding)
    }
    
    return false
  } catch (error) {
    return false
  }
}

/**
 * Fetch and apply agency branding from API
 * Used when branding is not in the response (e.g., during onboarding)
 */
export const fetchAndApplyBranding = async () => {
  if (typeof window === 'undefined') return false

  // Skip if server already applied branding
  if (isServerBrandingApplied()) {
    return true
  }

  try {
    const userData = localStorage.getItem('User')
    if (!userData) return false

    const parsedUser = JSON.parse(userData)
    const authToken = parsedUser?.token || parsedUser?.user?.token
    if (!authToken) return false

    // Check if user is subaccount or agency
    const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
    const isSubaccount = userRole === 'AgencySubAccount'
    const isAgency = userRole === 'Agency'

    if (!isSubaccount && !isAgency) {
      return false // Not an agency or subaccount, no branding to apply
    }

    const response = await fetch(Apis.getAgencyBranding, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data?.status === true && data?.data?.branding) {
        const branding = data.data.branding
        // Use the centralized function to update cookie and apply branding
        return updateBrandingCookieAndApply(branding)
      }
    }

    return false
  } catch (error) {
    return false
  }
}

/**
 * Force apply branding - tries response first, then API
 * This is the main function to call after registration/login
 */
export const forceApplyBranding = async (responseData = null) => {
  if (typeof window === 'undefined') return false

  try {
    // First try to get branding from response
    if (responseData) {
      const applied = applyBrandingFromResponse(responseData)
      if (applied) {
        return true
      }
    }

    // If not in response, fetch from API
    const fetched = await fetchAndApplyBranding()
    return fetched
  } catch (error) {
    return false
  }
}

