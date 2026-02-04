import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../auth-helper'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * GET /api/dialer/phone-numbers
 * List phone numbers for the authenticated user/agency
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated dialer/phone-numbers/route.ts' },
        { status: 401 },
      )
    }

    // Get token from request
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

    const userIdParam = req.nextUrl.searchParams.get('userId')
    const backendUrl = userIdParam
      ? `${BASE_API_URL}api/dialer/phone-numbers?userId=${userIdParam}`
      : `${BASE_API_URL}api/dialer/phone-numbers`
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in GET /api/dialer/phone-numbers:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

/**
 * POST /api/dialer/phone-numbers
 * Set a phone number as internal dialer number
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated dialer/phone-numbers/route.ts' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { phoneNumberId, userId } = body

    if (!phoneNumberId) {
      return NextResponse.json(
        { status: false, message: 'phoneNumberId is required' },
        { status: 400 },
      )
    }

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

    const postBody: { phoneNumberId: number; userId?: number } = { phoneNumberId }
    if (userId != null) postBody.userId = userId
    const response = await fetch(`${BASE_API_URL}api/dialer/phone-numbers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postBody),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in POST /api/dialer/phone-numbers:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}
