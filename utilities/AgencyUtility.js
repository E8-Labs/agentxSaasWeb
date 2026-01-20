import { PersistanceKeys } from '@/constants/Constants'

/**
 * Agency UUID Management Utilities
 * For handling agency onboarding links and subaccount registration
 */

/**
 * Extract agency UUID from URL path
 * Expected format: /onboarding/uuid
 * @param {string} pathname - The current URL pathname
 * @returns {string|null} - The extracted UUID or null if not found
 */
export const extractAgencyUUIDFromPath = (pathname) => {
  try {
    // Match pattern: /onboarding/{uuid}
    const match = pathname.match(/\/onboarding\/([^\/]+)/)
    return match ? match[1] : null
  } catch (error) {
    console.error('Error extracting agency UUID:', error)
    return null
  }
}

/**
 * Save agency UUID to localStorage
 * @param {string} uuid - The agency UUID to save
 */
export const saveAgencyUUID = (uuid) => {
  if (typeof window !== 'undefined' && uuid) {
    localStorage.setItem(PersistanceKeys.AgencyUUID, uuid)
  }
}

/**
 * Get saved agency UUID from localStorage
 * @returns {string|null} - The saved UUID or null if not found
 */
export const getAgencyUUID = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PersistanceKeys.AgencyUUID)
  }
  return null
}

/**
 * Remove agency UUID from localStorage
 * Called after successful registration to prevent reuse
 */
export const clearAgencyUUID = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PersistanceKeys.AgencyUUID)
  }
}

/**
 * Check if current session has an agency UUID
 * @returns {boolean} - True if agency UUID exists
 */
export const hasAgencyUUID = () => {
  return !!getAgencyUUID()
}

/**
 * Initialize agency UUID from current URL if present
 * Should be called on app load or route change
 * @param {string} pathname - Current pathname
 */
export const initializeAgencyUUID = (pathname) => {
  if (typeof window !== 'undefined') {
    const uuid = extractAgencyUUIDFromPath(pathname)
    if (uuid) {
      saveAgencyUUID(uuid)
      return uuid
    }
  }
  return null
}

/**
 * Get agency UUID for API calls
 * Returns the UUID if available, otherwise null
 * @returns {string|null} - UUID for API or null
 */
export const getAgencyUUIDForAPI = () => {
  const uuid = getAgencyUUID()
  if (uuid) {
    return uuid
  }
  return null
}
