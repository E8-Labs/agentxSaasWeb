import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/templates/send-email
 * Send email to a lead using a template
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
    const { leadId, templateId } = body

    // Validate required fields
    if (!leadId || !templateId) {
      return NextResponse.json(
        { status: false, message: 'Missing required fields: leadId and templateId' },
        { status: 400 },
      )
    }

    // Call backend API
    const response = await fetch(`${BASE_API_URL}api/templates/send-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId,
        templateId,
      }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Failed to send email' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in POST /api/templates/send-email:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

