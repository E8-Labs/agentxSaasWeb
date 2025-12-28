import {
  agencyCancellationAndRefundUrl,
  agencyPrivacyPolicyUrl,
  agencyTermsAndConditionUrl,
  CancellationAndRefundUrl,
  privacyPollicyUrl,
  termsAndConditionUrl,
} from '@/constants/Constants'

/**
 * Get the appropriate terms, privacy, and cancellation URLs based on user role
 * 
 * Logic:
 * - Normal users (not Agency, not AgencySubAccount): Default URLs
 * - Agency users (userRole === 'Agency'): Static agency URLs (NOT agencyBranding)
 * - Subaccounts (userRole === 'AgencySubAccount'): Custom URLs from parent agency's agencyBranding
 * 
 * @returns {Object} Object containing termsUrl, privacyUrl, and cancellationUrl
 */
export const getPolicyUrls = () => {
  // Default URLs for normal users
  const defaultUrls = {
    termsUrl: termsAndConditionUrl,
    privacyUrl: privacyPollicyUrl,
    cancellationUrl: CancellationAndRefundUrl,
  }

  // Static agency URLs
  const agencyUrls = {
    termsUrl: agencyTermsAndConditionUrl,
    privacyUrl: agencyPrivacyPolicyUrl,
    cancellationUrl: agencyCancellationAndRefundUrl,
  }

  // Check if running on client
  if (typeof window === 'undefined') {
    return defaultUrls
  }

  try {
    const userData = localStorage.getItem('User')
    if (!userData) {
      return defaultUrls
    }

    const parsedUser = JSON.parse(userData)
    const user = parsedUser?.user || parsedUser
    const userRole = user?.userRole

    // For Agency users, return static agency URLs (NOT agencyBranding)
    if (userRole === 'Agency') {
      return agencyUrls
    }

    // For Subaccounts, use agencyBranding URLs from their parent agency
    if (userRole === 'AgencySubAccount') {
      // Get agencyBranding from multiple possible locations
      const agencyBranding =
        user?.agencyBranding ||
        parsedUser?.agencyBranding ||
        parsedUser?.user?.agencyBranding

      // If agencyBranding has URLs, use them
      if (
        agencyBranding?.termsUrl ||
        agencyBranding?.privacyUrl ||
        agencyBranding?.cancellationUrl
      ) {
        return {
          termsUrl:
            agencyBranding.termsUrl || defaultUrls.termsUrl,
          privacyUrl:
            agencyBranding.privacyUrl || defaultUrls.privacyUrl,
          cancellationUrl:
            agencyBranding.cancellationUrl || defaultUrls.cancellationUrl,
        }
      }
    }
  } catch (error) {
    console.error('Error getting policy URLs:', error)
  }

  // Fallback to defaults for normal users or errors
  return defaultUrls
}
