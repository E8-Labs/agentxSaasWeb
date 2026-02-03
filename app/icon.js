import { cookies, headers } from 'next/headers'
import { decodeBrandingHeader } from '@/lib/branding-transport'
import {
  getBrandingForMetadata,
  isAssignxDomain,
  isExcludedSubdomain,
} from '@/lib/getServerBranding'
import { readFile } from 'fs/promises'
import path from 'path'

export const contentType = 'image/png'
export const size = { width: 32, height: 32 }

/**
 * Dynamic Favicon Route Handler
 *
 * Serves the appropriate favicon based on agency branding from headers or cookies.
 * - First checks for branding in request headers (set by middleware in same request)
 * - Falls back to branding cookie (set by middleware in previous requests)
 * - Returns default AssignX favicon if no branding or fetch fails
 *
 * This runs server-side, eliminating the favicon flash that occurred
 * with client-side DOM manipulation in ThemeProvider.
 */
export default async function Icon() {
  let faviconUrl = null
  const decodeValue = (value) => {
    if (!value) return value
    try {
      return decodeURIComponent(value)
    } catch (err) {
      return value
    }
  }

  // First, try to read from request headers (set by middleware in the same request)
  // This is the primary source and prevents the "first visit" issue
  const headerStore = await headers()
  const brandingHeader = headerStore.get('x-agency-branding')
  const headerBranding = decodeBrandingHeader(brandingHeader)
  if (headerBranding) {
    faviconUrl = headerBranding?.faviconUrl || null
  }

  // Fallback: Try to read from cookies (set by middleware in previous requests)
  if (!faviconUrl) {
    const cookieStore = await cookies()
    const brandingCookie = cookieStore.get('agencyBranding')

    if (brandingCookie?.value) {
      try {
        const branding = JSON.parse(decodeValue(brandingCookie.value))
        faviconUrl = branding?.faviconUrl
      } catch (e) {
        // Invalid JSON in cookie, fall through to default
      }
    }
  }

  // Determine if this is a custom domain request
  const host = headerStore.get('host') || ''
  const isCustomDomain = !!host && !(isAssignxDomain(host) || isExcludedSubdomain(host))

  // First-visit quick fallback for custom domains: try a very short lookup
  if (!faviconUrl && isCustomDomain) {
    try {
      const quickBrand = await getBrandingForMetadata(host, 500)
      if (quickBrand?.faviconUrl) {
        faviconUrl = quickBrand.faviconUrl
      }
    } catch {}
  }

  // If custom favicon URL exists, fetch and return it
  if (faviconUrl && faviconUrl.trim() !== '') {
    try {
      const response = await fetch(faviconUrl, {
        next: { revalidate: 300 } // Cache for 5 minutes
      })

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        const contentTypeHeader = response.headers.get('content-type') || 'image/png'

        return new Response(arrayBuffer, {
          headers: {
            'Content-Type': contentTypeHeader,
            'Cache-Control': 'private, max-age=300, must-revalidate',
            'Vary': 'Host, Cookie',
          }
        })
      }
    } catch (e) {
      // Fetch failed, fall through to default
    }
  }

  // No favicon for custom domains without branding (never show default)
  if (isCustomDomain) {
    return new Response(null, {
      status: 204,
      headers: {
        'Cache-Control': 'private, max-age=120, must-revalidate',
        'Vary': 'Host, Cookie',
      },
    })
  }

  // Platform hosts: return default favicon from app folder
  try {
    const defaultFaviconPath = path.join(process.cwd(), 'app', 'default-favicon.ico')
    const defaultFavicon = await readFile(defaultFaviconPath)

    return new Response(defaultFavicon, {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'private, max-age=300, must-revalidate',
        'Vary': 'Host, Cookie',
      },
    })
  } catch (e) {
    // Return empty response if even default fails
    return new Response(null, { status: 404 })
  }
}
