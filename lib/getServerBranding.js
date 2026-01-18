import { cookies, headers } from 'next/headers'
import { decodeBrandingHeader } from '@/lib/branding-transport'

/**
 * Server-side utility to read agency branding from headers or cookies
 *
 * IMPORTANT: This function first checks for branding in request headers
 * (set by middleware in the same request), then falls back to cookies
 * (set by middleware in previous requests).
 *
 * The branding is set by the middleware (proxy.js) when:
 * - A user visits a custom domain
 * - A user visits an AssignX subdomain (e.g., eric.assignx.ai)
 * - A logged-in agency/subaccount user accesses any route
 *
 * This function extracts and parses the branding data for use in
 * Server Components, enabling server-side rendering of brand colors.
 *
 * @returns {Promise<Object|null>} Parsed branding object or null if not available
 *
 * Branding object structure:
 * {
 *   primaryColor: string (hex, e.g., '#7902DF')
 *   secondaryColor: string (hex, e.g., '#8B5CF6')
 *   logoUrl: string | null
 *   faviconUrl: string | null
 *   companyName: string
 *   faviconText: string
 *   xbarTitle: string
 * }
 */
export async function getServerBranding() {
  try {
    const decodeValue = (value) => {
      if (!value) return value
      try {
        return decodeURIComponent(value)
      } catch (err) {
        return value
      }
    }

    // First, try to read from request headers (set by middleware in the same request)
    // This is the primary source and prevents the "first visit flash"
    const headerStore = await headers()
    const brandingHeader = headerStore.get('x-agency-branding')

    const headerBranding = decodeBrandingHeader(brandingHeader)
    if (headerBranding) {
      return headerBranding
    }

    // Fallback: Try to read from cookies (set by middleware in previous requests)
    const cookieStore = await cookies()
    const brandingCookie = cookieStore.get('agencyBranding')

    if (!brandingCookie?.value) {
      return null
    }

    const branding = JSON.parse(decodeValue(brandingCookie.value))

    // Validate that we got an object with expected fields
    if (!branding || typeof branding !== 'object') {
      return null
    }

    return branding
  } catch (e) {
    // Log error for debugging but don't throw - just return null for fallback
    console.log('[getServerBranding] Error reading branding:', e.message)
    return null
  }
}

/**
 * Check if a hostname is an AssignX platform domain (not custom domain)
 * @param {string} hostname
 * @returns {boolean}
 */
export function isAssignxDomain(hostname) {
  if (!hostname) return false
  return (
    hostname.includes('.assignx.ai') ||
    hostname === 'assignx.ai' ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1')
  )
}

/**
 * Check if a hostname is an excluded subdomain that should use default branding
 * @param {string} hostname
 * @returns {boolean}
 */
export function isExcludedSubdomain(hostname) {
  return hostname === 'app.assignx.ai' || hostname === 'dev.assignx.ai'
}

/**
 * Get branding directly from API for metadata generation
 * This function calls the API directly instead of relying on middleware headers,
 * ensuring branding is always available for social media crawlers and Open Graph meta tags.
 * 
 * @param {string} hostname - The hostname to lookup (e.g., 'app.teamthrive.io')
 * @returns {Promise<Object|null>} Parsed branding object or null if not available
 */
export async function getBrandingForMetadata(hostname) {
  if (!hostname || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null
  }

  // Skip lookup for default AssignX domains
  if (isExcludedSubdomain(hostname) || isAssignxDomain(hostname)) {
    return null
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL ||
      (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
        ? 'https://apimyagentx.com/agentx/'
        : 'https://apimyagentx.com/agentxtest/')

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    try {
      const lookupResponse = await fetch(
        `${baseUrl}api/agency/lookup-by-domain`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customDomain: hostname }),
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId)

      if (lookupResponse.ok) {
        const lookupData = await lookupResponse.json()
        if (lookupData?.status && lookupData?.data?.branding) {
          return lookupData.data.branding
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      // Silently fail on timeout or network error - will use defaults
      if (fetchError.name !== 'AbortError') {
        console.log('[getBrandingForMetadata] API lookup error:', fetchError.message)
      }
    }
  } catch (error) {
    // Silently fail - will use default branding
    console.log('[getBrandingForMetadata] Error:', error.message)
  }

  return null
}
