import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../dialer/auth-helper'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/calling-scripts/:id/set-default
 * Set a script as the default script for the user
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated' },
        { status: 401 },
      )
    }

    const { id } = await params

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

    // Call backend API
    const response = await fetch(
      `${BASE_API_URL}api/calling-scripts/${id}/set-default`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in POST /api/calling-scripts/[id]/set-default:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

