import { Constants } from '@/constants/Constants'

/**
 * Gets the appropriate global phone number based on user type
 * - For subaccounts: Returns agency global number if available, otherwise null (don't show AssignX number)
 * - For regular users: Always returns env-based global number
 *
 * @param {Object} user - User object from Redux/localStorage
 * @returns {string|null} - Phone number string (e.g., "+16505403715") or null for subaccounts without agency global number
 */
export const getGlobalPhoneNumber = (user) => {
  // Check if user is a subaccount
  if (user?.userRole === 'AgencySubAccount') {
    // Return agency global number if available, otherwise null (don't show AssignX number to subaccounts)
    return user?.agencyGlobalNumber?.phoneNumber || null
  }
  // Regular users always get env-based global number
  return Constants.GlobalPhoneNumber
}
