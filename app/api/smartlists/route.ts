import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const searchParams = new URL(req.url).searchParams
    const type = searchParams.get('type') || 'manual' // Default to 'manual' for backward compatibility
    const userId = searchParams.get('userId')
    
    // Build query string
    // If type is 'all', don't include type parameter (fetch all types)
    // Otherwise, include the type parameter (defaults to 'manual' for backward compatibility)
    let queryString = ''
    if (type !== 'all') {
      queryString = `type=${type}`
    }
    if (userId) {
      queryString += queryString ? `&userId=${userId}` : `userId=${userId}`
    }
    
    // Only append query string if we have parameters
    const targetUrl = queryString 
      ? `${BASE_API_URL}api/leads/getSheets?${queryString}`
      : `${BASE_API_URL}api/leads/getSheets`

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Error in GET /api/smartlists:', error)
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

