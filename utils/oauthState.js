/**
 * OAuth State Utility
 * 
 * Encodes and decodes OAuth state parameters with agency/subaccount information
 * for custom domain redirect handling.
 */

/**
 * Generate OAuth state parameter with agency info
 * @param {Object} params - State parameters
 * @param {number|null} params.agencyId - Agency ID
 * @param {string|null} params.customDomain - Custom domain (e.g., 'estate.developers.com')
 * @param {string} params.provider - OAuth provider ('google' or 'ghl')
 * @param {number|null} params.subaccountId - Subaccount ID (optional)
 * @param {string|null} params.originalRedirectUri - Original redirect URI (for GHL)
 * @returns {string} Base64-encoded state parameter
 */
export function generateOAuthState({
  agencyId,
  customDomain,
  provider,
  subaccountId = null,
  originalRedirectUri = null,
}) {
  const stateData = {
    agencyId: agencyId || null,
    customDomain: customDomain || null,
    provider, // 'google' or 'ghl'
    subaccountId: subaccountId || null,
    originalRedirectUri: originalRedirectUri || null,
    timestamp: Date.now(),
  }

  // Encode as base64 for URL safety
  try {
    return Buffer.from(JSON.stringify(stateData)).toString('base64')
  } catch (error) {
    console.error('Error encoding OAuth state:', error)
    // Return empty string if encoding fails (will trigger fallback behavior)
    return ''
  }
}

/**
 * Parse OAuth state parameter
 * @param {string} state - Base64-encoded state parameter
 * @returns {Object|null} Parsed state object or null if invalid
 */
export function parseOAuthState(state) {
  if (!state || typeof state !== 'string') {
    return null
  }

  try {
    const decoded = Buffer.from(state, 'base64').toString('utf-8')
    const parsed = JSON.parse(decoded)
    
    // Validate required fields
    if (parsed && typeof parsed === 'object' && parsed.provider) {
      return parsed
    }
    
    return null
  } catch (error) {
    // Silently fail - this is expected for backward compatibility
    // Invalid state will trigger fallback to existing callback paths
    console.debug('Error parsing OAuth state (this is OK for backward compatibility):', error)
    return null
  }
}

