import { cookies } from 'next/headers'
import { readFile } from 'fs/promises'
import path from 'path'

export const contentType = 'image/png'
export const size = { width: 180, height: 180 }

/**
 * Dynamic Apple Touch Icon Route Handler
 *
 * Serves the appropriate apple-touch-icon based on agency branding from cookies.
 * Used by iOS devices when users add the site to their home screen.
 *
 * - If branding cookie exists with faviconUrl, fetches and returns that icon
 * - Falls back to default AssignX favicon if no branding or fetch fails
 */
export default async function AppleIcon() {
  const cookieStore = await cookies()
  const brandingCookie = cookieStore.get('agencyBranding')

  let faviconUrl = null

  if (brandingCookie?.value) {
    try {
      const branding = JSON.parse(decodeURIComponent(brandingCookie.value))
      faviconUrl = branding?.faviconUrl
    } catch (e) {
      // Invalid JSON in cookie, fall through to default
      console.log('[apple-icon.js] Error parsing branding cookie:', e.message)
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
      console.log('[apple-icon.js] Error fetching custom favicon:', e.message)
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
    console.error('[apple-icon.js] Error reading default favicon:', e.message)
    // Return empty response if even default fails
    return new Response(null, { status: 404 })
  }
}
