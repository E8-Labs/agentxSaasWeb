import { cookies, headers } from 'next/headers'
import { decodeBrandingHeader } from '@/lib/branding-transport'
import { readFile } from 'fs/promises'
import path from 'path'

export const contentType = 'image/png'
export const size = { width: 180, height: 180 }

/**
 * Dynamic Apple Touch Icon Route Handler
 *
 * Serves the appropriate apple-touch-icon based on agency branding from headers or cookies.
 * Used by iOS devices when users add the site to their home screen.
 *
 * - First checks for branding in request headers (set by middleware in same request)
 * - Falls back to branding cookie (set by middleware in previous requests)
 * - Returns default AssignX favicon if no branding or fetch fails
 */
export default async function AppleIcon() {
  let faviconUrl = null

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
        const branding = JSON.parse(decodeURIComponent(brandingCookie.value))
        faviconUrl = branding?.faviconUrl
      } catch (e) {
        // Invalid JSON in cookie, fall through to default
      }
    }
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
            'Vary': 'Cookie'
          }
        })
      }
    } catch (e) {
      // Fetch failed, fall through to default
    }
  }

  // Return default favicon from app folder
  try {
    const defaultFaviconPath = path.join(process.cwd(), 'app', 'default-favicon.ico')
    const defaultFavicon = await readFile(defaultFaviconPath)

    return new Response(defaultFavicon, {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'private, max-age=300, must-revalidate',
        'Vary': 'Cookie'
      }
    })
  } catch (e) {
    // Return empty response if even default fails
    return new Response(null, { status: 404 })
  }
}
