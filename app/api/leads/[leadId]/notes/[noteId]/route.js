import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Apis from '@/components/apis/Apis'

// Disable static generation for this dynamic route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use the same base URL logic as Apis.js
// Don't use NEXT_PUBLIC_BASE_API_URL if it points to localhost
const getBackendBaseUrl = () => {
  const envUrl = Apis.BasePath
  const env = process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT
  return envUrl
  // If NEXT_PUBLIC_BASE_API_URL is set and not localhost, use it
//   if (envUrl && !envUrl.includes('localhost')) {
//     return envUrl
//   }
  
  // Otherwise use the standard backend URLs
//   return env === 'Production'
//     ? 'https://apimyagentx.com/agentx/'
//     : 'https://apimyagentx.com/agentxtest/'
}

const BASE_API_URL = getBackendBaseUrl()

console.log('[Next.js API] Base API URL:', BASE_API_URL)

/**
 * PUT /api/leads/[leadId]/notes/[noteId]
 * Update a lead note
 */
export async function PUT(req, { params }) {
  try {
    const { leadId, noteId } = await params
    const { note } = await req.json()

    if (!note || !note.trim()) {
      return NextResponse.json(
        { status: false, message: 'Note content is required' },
        { status: 400 },
      )
    }

    // Get authentication token
    let token = null
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
        { status: false, message: 'Not authenticated' },
        { status: 401 },
      )
    }

    // Call backend API to update note
    const backendUrl = `${BASE_API_URL}api/leads/updateLeadNote`
    const requestBody = {
      noteId: parseInt(noteId),
      note: note,
    }

    console.log('[Next.js API] Calling backend:', {
      url: backendUrl,
      method: 'PUT',
      noteId: parseInt(noteId),
      leadId: leadId,
    })

    let response
    try {
      response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })
    } catch (fetchError) {
      console.error('[Next.js API] Fetch error:', {
        message: fetchError.message,
        name: fetchError.name,
        cause: fetchError.cause,
        url: backendUrl,
      })
      throw fetchError
    }

    console.log('[Next.js API] Backend response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    })

    // Check content type before parsing
    const contentType = response.headers.get('content-type')
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error('[Next.js API] Non-JSON response:', text)
      return NextResponse.json(
        { status: false, message: 'Invalid response from backend', rawResponse: text },
        { status: response.status },
      )
    }

    console.log('[Next.js API] Backend response data:', data)

    if (!response.ok) {
      console.error('[Next.js API] Backend error:', {
        status: response.status,
        data: data,
      })
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Next.js API] Error in PUT /api/leads/[leadId]/notes/[noteId]:', error)
    console.error('[Next.js API] Error stack:', error.stack)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/leads/[leadId]/notes/[noteId]
 * Delete a lead note
 */
export async function DELETE(req, { params }) {
  try {
    const { leadId, noteId } = await params

    // Get authentication token
    let token = null
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
        { status: false, message: 'Not authenticated' },
        { status: 401 },
      )
    }

    // Call backend API to delete note
    const backendUrl = `${BASE_API_URL}api/leads/deleteLeadNote`
    const requestBody = {
      noteId: parseInt(noteId),
    }

    console.log('[Next.js API] Calling backend:', {
      url: backendUrl,
      method: 'DELETE',
      noteId: parseInt(noteId),
      leadId: leadId,
    })

    let response
    try {
      response = await fetch(backendUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })
    } catch (fetchError) {
      console.error('[Next.js API] Fetch error:', {
        message: fetchError.message,
        name: fetchError.name,
        cause: fetchError.cause,
        url: backendUrl,
      })
      throw fetchError
    }

    console.log('[Next.js API] Backend response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    })

    // Check content type before parsing
    const contentType = response.headers.get('content-type')
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error('[Next.js API] Non-JSON response:', text)
      return NextResponse.json(
        { status: false, message: 'Invalid response from backend', rawResponse: text },
        { status: response.status },
      )
    }

    console.log('[Next.js API] Backend response data:', data)

    if (!response.ok) {
      console.error('[Next.js API] Backend error:', {
        status: response.status,
        data: data,
      })
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Next.js API] Error in DELETE /api/leads/[leadId]/notes/[noteId]:', error)
    console.error('[Next.js API] Error stack:', error.stack)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

