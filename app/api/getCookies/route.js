// app/api/getCookies/route.js
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic' // optional, avoids caching

export async function GET() {
  try {
    // In Next.js 15, cookies() needs to be awaited
    const cookieStore = await cookies()

    // HttpOnly cookies (can't be read in client JS)
    const accessToken = cookieStore.get('ghl_access_token')?.value
    const refreshToken = cookieStore.get('ghl_refresh_token')?.value

    console.log('[getCookies] Token check:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    })

    // ⚠️ Don't send sensitive tokens to the client
    return Response.json({ 
      accessToken: accessToken || null, 
      refreshToken: refreshToken || null 
    })
  } catch (error) {
    console.error('[getCookies] Error getting GHL cookies:', error)
    console.error('[getCookies] Error stack:', error.stack)
    return Response.json(
      { 
        error: 'Failed to get cookies',
        message: error.message,
        accessToken: null,
        refreshToken: null
      },
      { status: 500 }
    )
  }
}
