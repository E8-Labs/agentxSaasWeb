import Apis from '@/components/apis/Apis'

/**
 * Apply agency branding after registration or login
 * Extracts branding from response data, stores it, and dispatches event
 */
export const applyBrandingFromResponse = (responseData) => {
  if (typeof window === 'undefined') return

  try {
    // Extract branding from various possible locations in response
    let agencyBranding =
      responseData?.agencyBranding ||
      responseData?.user?.agencyBranding ||
      responseData?.data?.agencyBranding ||
      responseData?.data?.user?.agencyBranding ||
      responseData?.data?.data?.agencyBranding

    // If branding found, store and dispatch
    if (agencyBranding) {
      console.log('✅ [applyBranding] Found branding in response, applying...')
      localStorage.setItem('agencyBranding', JSON.stringify(agencyBranding))
      
      // Dispatch event to trigger ThemeProvider update
      window.dispatchEvent(
        new CustomEvent('agencyBrandingUpdated', { detail: agencyBranding })
      )
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error applying branding from response:', error)
    return false
  }
}

/**
 * Fetch and apply agency branding from API
 * Used when branding is not in the response (e.g., during onboarding)
 */
export const fetchAndApplyBranding = async () => {
  if (typeof window === 'undefined') return false

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

    console.log('🔄 [applyBranding] Fetching branding from API...')
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
        console.log('✅ [applyBranding] Fetched branding from API, applying...')
        
        localStorage.setItem('agencyBranding', JSON.stringify(branding))
        
        // Dispatch event to trigger ThemeProvider update
        window.dispatchEvent(
          new CustomEvent('agencyBrandingUpdated', { detail: branding })
        )
        
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error fetching branding from API:', error)
    return false
  }
}

/**
 * Force apply branding - tries response first, then API
 * This is the main function to call after registration/login
 */
export const forceApplyBranding = async (responseData = null) => {
  if (typeof window === 'undefined') return

  // First try to get branding from response
  if (responseData) {
    const applied = applyBrandingFromResponse(responseData)
    if (applied) {
      return true
    }
  }

  // If not in response, fetch from API
  return await fetchAndApplyBranding()
}

