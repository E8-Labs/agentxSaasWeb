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
