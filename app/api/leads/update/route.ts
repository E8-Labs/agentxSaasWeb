import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * PUT /api/leads/update
 * Update a lead
 */
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const targetUrl = `${BASE_API_URL}api/leads/updateLead`

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Error in PUT /api/leads/update:', error)
    return NextResponse.json(
      {
        status: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 },
    )
  }
}
