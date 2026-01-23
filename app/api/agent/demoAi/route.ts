import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/agent/demoAI
 * Initiate a demo AI voice call using the default demo agent
 * Supports both JWT (Bearer token) and API Key (x-api-key header) authentication
 * 
 * @param req - Next.js request object
 */
export async function POST(req: NextRequest) {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.get('Authorization')
    // Check for API key in x-api-key header
    const apiKey = req.headers.get('x-api-key')

    // Validate that at least one authentication method is provided
    if (
      (!authHeader || !authHeader.startsWith('Bearer ')) &&
      !apiKey
    ) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized: JWT token or API key required' },
        { status: 401 },
      )
    }

    // Get request body
    const body = await req.json()

    // Build target URL without agentId (uses default demo agent)
    const targetUrl = `${BASE_API_URL}api/agent/demoAi`

    // Build headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add JWT token if provided
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headers['Authorization'] = authHeader
    }

    // Add API key if provided
    if (apiKey) {
      headers['x-api-key'] = apiKey
    }

    // Forward the request to backend
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Error in POST /api/agent/demoAI:', error)
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
