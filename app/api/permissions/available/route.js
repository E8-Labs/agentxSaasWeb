import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Disable static generation for this dynamic route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * Get available permissions for current user's role
 * GET /api/permissions/available?context=agency
 */
export async function GET(req) {
  try {
    let token = null

    // Try to get token from Authorization header first
    const authHeader = req.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    // Fallback: Try to get token from User cookie
    if (!token) {
      try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get('User')
        if (userCookie) {
          const userData = JSON.parse(decodeURIComponent(userCookie.value))
          token = userData.token
        }
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }

    if (!token) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const context = searchParams.get('context')

    // Build backend URL
    let backendUrl = `${BASE_API_URL}api/permissions/available`
    if (context) {
      backendUrl += `?context=${context}`
    }

    // Proxy request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error in GET /api/permissions/available:', error)
    return NextResponse.json(
      {
        status: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
