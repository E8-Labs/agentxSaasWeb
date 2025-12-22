import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Next.js API route to get agency custom domain
 * This proxies the backend API call to hide the backend URL
 */
export async function GET(req) {
  try {
    let token = null

    // Try to get token from User cookie (same as middleware)
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('User')
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.value))
        token = userData.token
      } catch (error) {
        console.error('Error parsing user cookie:', error)
      }
    }

    // Fallback: Try to get token from Authorization header
    if (!token) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }

    if (!token) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated custom-domain frontend route.js' },
        { status: 401 }
      )
    }

    // Get base API URL
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL ||
      (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
        ? 'https://apimyagentx.com/agentx/'
        : 'https://apimyagentx.com/agentxtest/')

    // Call the backend API
    const response = await fetch(`${baseUrl}api/agency/branding/custom-domain`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache this request
    })

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      return NextResponse.json(
        { status: false, message: 'Failed to get custom domain' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in custom-domain API route:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

