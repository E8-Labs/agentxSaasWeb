import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, type AuthUser } from '../../auth-helper'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/dialer/calls/token
 * Mint Twilio Voice Access Token
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from request first (before getAuthUser which might fail)
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null

    if (!token) {
      return NextResponse.json(
        { status: false, message: 'No token provided' },
        { status: 401 },
      )
    }

    // Try to get user, but don't fail if it errors
    let user: AuthUser | null = null
    try {
      user = await getAuthUser(req)
    } catch (authError) {
      console.warn('getAuthUser failed, continuing with token:', authError)
      // Continue anyway - backend will verify the token
    }

    let body: any = {}
    let metadata = null
    try {
      body = await req.json()
      metadata = body.metadata
    } catch (parseError) {
      console.warn('Failed to parse request body, continuing without metadata:', parseError)
      // Continue without metadata
    }

    const backendBody: { metadata?: any; userId?: number } = { metadata }
    if (body.userId != null) backendBody.userId = body.userId
    const response = await fetch(`${BASE_API_URL}api/dialer/calls/token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
      cache: 'no-store',
    })

    // Check content-type before parsing
    const contentType = response.headers.get('content-type')
    let data: any = {}
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Error parsing JSON response from backend:', parseError)
        const text = await response.text()
        console.error('Response text:', text.substring(0, 200))
        return NextResponse.json(
          { status: false, message: 'Invalid response from backend', error: 'Failed to parse JSON' },
          { status: 500 }
        )
      }
    } else {
      // Backend returned non-JSON (likely HTML error page)
      const text = await response.text()
      console.error('Backend returned non-JSON response:', text.substring(0, 200))
      return NextResponse.json(
        { status: false, message: `Backend error: ${response.status} ${response.statusText}`, error: 'Invalid response format' },
        { status: response.status || 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in POST /api/dialer/calls/token:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}
