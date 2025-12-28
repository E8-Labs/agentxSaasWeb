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

export function logout(reason = 'Unknown reason') {
  // Log the logout event with timestamp and reason
  const timestamp = new Date().toISOString()
  console.log(
    `🚪 USER LOGOUT TRIGGERED - Time: ${timestamp}, Reason: ${reason}`,
  )

  if (typeof document !== 'undefined') {
    // Preserve user location if needed
    let userLocation = localStorage.getItem(
      PersistanceKeys.LocalStorageUserLocation,
    )
    
    // Clear all localStorage
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
    
    // Force redirect to home page with cache busting
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
