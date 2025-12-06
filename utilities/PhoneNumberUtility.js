import { Constants } from '@/constants/Constants'

/**
 * Gets the appropriate global phone number based on user type
 * - For subaccounts: Returns agency global number if available, otherwise env-based global number
 * - For regular users: Always returns env-based global number
 *
 * @param {Object} user - User object from Redux/localStorage
 * @returns {string} - Phone number string (e.g., "+16505403715")
 */
export const getGlobalPhoneNumber = (user) => {
  // Check if user is a subaccount
  if (user?.userRole === 'AgencySubAccount') {
    // Return agency global number if available, otherwise fallback to env
    return user?.agencyGlobalNumber?.phoneNumber || Constants.GlobalPhoneNumber
  }
  // Regular users always get env-based global number
  return Constants.GlobalPhoneNumber
}
