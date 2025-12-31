import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * GET /api/templates
 * Get email/SMS templates
 */
export async function GET(req: NextRequest) {
  try {
    // Extract token from request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const token = authHeader.split(' ')[1]

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const communicationType = searchParams.get('communicationType') // 'email' or 'sms'
    const userId = searchParams.get('userId')

    // Build URL with query params
    let url = `${BASE_API_URL}api/templates`
    const queryParams = new URLSearchParams()
    if (communicationType) {
      queryParams.append('communicationType', communicationType)
    }
    if (userId) {
      queryParams.append('userId', userId)
    }
    if (queryParams.toString()) {
      url += '?' + queryParams.toString()
    }

    // Call backend API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Failed to fetch templates' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in GET /api/templates:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

