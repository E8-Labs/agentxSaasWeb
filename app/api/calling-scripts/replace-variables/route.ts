import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/calling-scripts/replace-variables
 * Replace variables in script content with lead data
 */
export async function POST(req: NextRequest) {
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

    // Get request body
    const body = await req.json()
    const { content, leadId } = body

    // Validate required fields
    if (!content || !leadId) {
      return NextResponse.json(
        { status: false, message: 'Missing required fields: content and leadId' },
        { status: 400 },
      )
    }

    // Call backend API
    const response = await fetch(`${BASE_API_URL}api/calling-scripts/replace-variables`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        leadId,
      }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Failed to replace variables' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in POST /api/calling-scripts/replace-variables:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

