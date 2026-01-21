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
 * Get agency subaccounts with pagination and search
 * GET /api/agency/subaccounts?offset=0&limit=50&search=term&planId=123&profile_status=active&minSpent=0&maxSpent=1000&minBalance=0&maxBalance=10000&userId=456
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
    const offset = searchParams.get('offset') || '0'
    const limit = searchParams.get('limit') || '50'
    const search = searchParams.get('search')
    const planId = searchParams.get('planId')
    const profile_status = searchParams.get('profile_status')
    const minSpent = searchParams.get('minSpent')
    const maxSpent = searchParams.get('maxSpent')
    const minBalance = searchParams.get('minBalance')
    const maxBalance = searchParams.get('maxBalance')
    const userId = searchParams.get('userId')

    // Build backend URL with query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('offset', offset)
    queryParams.append('limit', limit)
    
    if (search) queryParams.append('search', search)
    if (planId) queryParams.append('planId', planId)
    if (profile_status) queryParams.append('profile_status', profile_status)
    if (minSpent) queryParams.append('minSpent', minSpent)
    if (maxSpent) queryParams.append('maxSpent', maxSpent)
    if (minBalance) queryParams.append('minBalance', minBalance)
    if (maxBalance) queryParams.append('maxBalance', maxBalance)
    if (userId) queryParams.append('userId', userId)

    const backendUrl = `${BASE_API_URL}api/agency/getSubAccounts?${queryParams.toString()}`

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
    console.error('Error in GET /api/agency/subaccounts:', error)
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
