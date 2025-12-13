import Apis from '@/components/apis/Apis'
import { hexToHsl, calculateIconFilter } from '@/utilities/colorUtils'
import { UserRole } from '@/constants/UserRole'

/**
 * Apply agency branding after registration or login
 * Extracts branding from response data, stores it, and dispatches event
 */
export const applyBrandingFromResponse = (responseData) => {
  if (typeof window === 'undefined') return false

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
      console.log('✅ [applyBranding] Found branding in response, applying...', agencyBranding)
      localStorage.setItem('agencyBranding', JSON.stringify(agencyBranding))
      
      // Apply branding immediately by directly setting CSS variables
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
          const primaryColor = agencyBranding.primaryColor || '#7902DF'
          const secondaryColor = agencyBranding.secondaryColor || '#8B5CF6'
          
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
          
          console.log('✅ [applyBranding] Applied branding CSS variables immediately')
        } catch (error) {
          console.error('Error applying branding CSS variables:', error)
        }
        
        // Dispatch event for any components listening for branding updates
        window.dispatchEvent(
          new CustomEvent('agencyBrandingUpdated', { detail: agencyBranding })
        )
        console.log('✅ [applyBranding] Dispatched agencyBrandingUpdated event')
      }
      
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
      console.log('ℹ️ [applyBranding] User is not subaccount/agency, skipping branding fetch. userRole:', userRole)
      return false // Not an agency or subaccount, no branding to apply
    }
    
    console.log('🔍 [applyBranding] User is subaccount/agency, fetching branding. userRole:', userRole)

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
        
        // Apply branding immediately by directly setting CSS variables
        if (typeof document !== 'undefined') {
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
            
            console.log('✅ [applyBranding] Applied branding CSS variables from API')
          } catch (error) {
            console.error('Error applying branding CSS variables from API:', error)
          }
        }
        
        // Dispatch event for any components listening for branding updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('agencyBrandingUpdated', { detail: branding })
          )
        }
        
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
  if (typeof window === 'undefined') return false

  try {
    // First try to get branding from response
    if (responseData) {
      const applied = applyBrandingFromResponse(responseData)
      if (applied) {
        return true
      }
    }

    // Small delay to ensure localStorage User is set before fetching
    await new Promise(resolve => setTimeout(resolve, 200))

    // If not in response, fetch from API
    const fetched = await fetchAndApplyBranding()
    return fetched
  } catch (error) {
    console.error('Error in forceApplyBranding:', error)
    return false
  }
}

