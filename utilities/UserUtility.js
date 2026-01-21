import { BatchStatus } from '@/components/constants/constants'
import { PersistanceKeys } from '@/constants/Constants'

export function GetCampaigneeNameIfAvailable(window) {
  if (typeof window !== 'undefined') {
    let name = localStorage.getItem(PersistanceKeys.LocalStorageCampaignee)
    return name
  }
  return null
}

export const getSupportUrlFor = (user) => {
  return PersistanceKeys.SupportWebinarUrl
}

/**
 * Clear the logout flag from sessionStorage
 * This should be called after successful login or registration
 * to allow the user to be authenticated
 */
export function clearLogoutFlag() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('_logout_flag')
  }
}

export function logout(reason = 'Unknown reason') {
  // Log the logout event with timestamp and reason
  const timestamp = new Date().toISOString()

  if (typeof document !== 'undefined') {
    // Preserve user location if needed
    let userLocation = localStorage.getItem(
      PersistanceKeys.LocalStorageUserLocation,
    )
    
    // CRITICAL: Clear Redux persist storage key (redux-persist stores data in localStorage)
    // This key is set by redux-persist configuration (usually 'persist:root')
    try {
      localStorage.removeItem('persist:root')
    } catch (error) {
      console.warn('Could not clear Redux persist storage:', error)
    }
    
    // Clear all localStorage (this will also clear any remaining User data)
    localStorage.clear()
    
    // Restore only user location (non-authentication data)
    if (userLocation) {
      localStorage.setItem(PersistanceKeys.LocalStorageUserLocation, userLocation)
    }
    
    // Clear all cookies related to authentication
    // Clear User cookie
    document.cookie = 'User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    // Clear cookie for all possible paths
    document.cookie = 'User=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    // Clear cookie without domain (for current domain)
    document.cookie = 'User=; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    // Clear agencyBranding cookie (used for server-side favicon/theming)
    document.cookie = 'agencyBranding=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'agencyBranding=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    // Clear sessionStorage as well
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
    }
    
    // CRITICAL: Set a persistent logout flag in sessionStorage
    // This flag persists for the browser session and prevents auto-login
    // even if localStorage gets repopulated by another script/tab/extension
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('_logout_flag', Date.now().toString())
    }
    
    // Force redirect to home page with logout parameter to prevent auto-login
    // The logout parameter will be checked by LoginComponent to skip auto-login
    window.location.href = '/?logout=' + Date.now()
  }
}

// Convert batch status to readable format
export function getReadableStatus(status) {
  switch (status) {
    case BatchStatus.Active:
      return 'Active'
    case BatchStatus.Paused:
      return 'Paused'
    case BatchStatus.PausedForNonPayment:
      return 'Paused (Non Payment)'
    case BatchStatus.PausedForUpdateCadence:
      return 'Paused (Cadence Updated)'
    case BatchStatus.PausedForNoPhoneNumber:
      return 'Paused (No Phone)'
    case BatchStatus.Completed:
      return 'Completed'
    case BatchStatus.Scheduled:
      return 'Scheduled'
    default:
      return status || 'Unknown'
  }
}
