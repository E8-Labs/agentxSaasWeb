import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

// Disable static generation for this dynamic route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Check if current user has a specific permission
 * GET /api/permissions/check?permissionKey=agency.subaccounts.view&contextUserId=123
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
        { status: false, message: 'Not authenticated', hasPermission: false },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const permissionKey = searchParams.get('permissionKey')
    const contextUserId = searchParams.get('contextUserId')

    if (!permissionKey) {
      return NextResponse.json(
        { status: false, message: 'permissionKey is required', hasPermission: false },
        { status: 400 }
      )
    }

    // Build backend URL
    let backendUrl = `${BASE_API_URL}api/permissions/check?permissionKey=${encodeURIComponent(permissionKey)}`
    if (contextUserId) {
      backendUrl += `&contextUserId=${contextUserId}`
    }

    // Call backend API to check permission
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
    console.error('Error in GET /api/permissions/check:', error)
    return NextResponse.json(
      {
        status: false,
        message: 'Internal server error',
        error: error.message,
        hasPermission: false,
      },
      { status: 500 }
    )
  }
}
