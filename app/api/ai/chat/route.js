import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Extract auth token from request headers or cookies
 */
async function getToken(req) {
  let token = null

  const authHeader = req.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

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

  return token
}

/**
 * Send AI chat message
 * POST /api/ai/chat -> backend POST /api/mail/ai-chat
 */
export async function POST(req) {
  try {
    const token = await getToken(req)

    if (!token) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated' },
        { status: 401 },
      )
    }

    const body = await req.json()

    const response = await fetch(`${BASE_API_URL}api/mail/ai-chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error in POST /api/ai/chat:', error)
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

/**
 * Get AI chat messages for a parent message
 * GET /api/ai/chat?parentMessageId=123 -> backend GET /api/mail/ai-chat/123/messages
 */
export async function GET(req) {
  try {
    const token = await getToken(req)

    if (!token) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(req.url)
    const parentMessageId = searchParams.get('parentMessageId')

    if (!parentMessageId) {
      return NextResponse.json(
        { status: false, message: 'parentMessageId is required' },
        { status: 400 },
      )
    }

    const response = await fetch(
      `${BASE_API_URL}api/mail/ai-chat/${encodeURIComponent(parentMessageId)}/messages`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error in GET /api/ai/chat:', error)
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
