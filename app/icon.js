import { cookies } from 'next/headers'
import { readFile } from 'fs/promises'
import path from 'path'

export const contentType = 'image/png'
export const size = { width: 32, height: 32 }

/**
 * Dynamic Favicon Route Handler
 *
 * Serves the appropriate favicon based on agency branding from cookies.
 * - If branding cookie exists with faviconUrl, fetches and returns that favicon
 * - Falls back to default AssignX favicon if no branding or fetch fails
 *
 * This runs server-side, eliminating the favicon flash that occurred
 * with client-side DOM manipulation in ThemeProvider.
 */
export default async function Icon() {
  const cookieStore = await cookies()
  const brandingCookie = cookieStore.get('agencyBranding')

  let faviconUrl = null

  if (brandingCookie?.value) {
    try {
      const branding = JSON.parse(decodeURIComponent(brandingCookie.value))
      faviconUrl = branding?.faviconUrl
    } catch (e) {
      // Invalid JSON in cookie, fall through to default
      console.log('[icon.js] Error parsing branding cookie:', e.message)
    }
  }

  // If custom favicon URL exists, fetch and return it
  if (faviconUrl && faviconUrl.trim() !== '') {
    try {
      const response = await fetch(faviconUrl, {
        next: { revalidate: 3600 } // Cache for 1 hour
      })

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        const contentTypeHeader = response.headers.get('content-type') || 'image/png'

        return new Response(arrayBuffer, {
          headers: {
            'Content-Type': contentTypeHeader,
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
          }
        })
      }
    } catch (e) {
      // Fetch failed, fall through to default
      console.log('[icon.js] Error fetching custom favicon:', e.message)
    }
  }

  // Return default favicon from app folder
  try {
    const defaultFaviconPath = path.join(process.cwd(), 'app', 'favicon.ico')
    const defaultFavicon = await readFile(defaultFaviconPath)

    return new Response(defaultFavicon, {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=86400'
      }
    })
  } catch (e) {
    console.error('[icon.js] Error reading default favicon:', e.message)
    // Return empty response if even default fails
    return new Response(null, { status: 404 })
  }
}
