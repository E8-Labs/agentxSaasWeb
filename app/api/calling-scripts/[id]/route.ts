import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../dialer/auth-helper'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * GET /api/calling-scripts/:id
 * Get a specific calling script by ID
 */
export async function GET(
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

    const { id } = await params

    // Call backend API
    const response = await fetch(`${BASE_API_URL}api/calling-scripts/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in GET /api/calling-scripts/[id]:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/calling-scripts/:id
 * Update an existing calling script
 */
export async function PUT(
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

    const body = await req.json()
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
    const response = await fetch(`${BASE_API_URL}api/calling-scripts/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in PUT /api/calling-scripts/[id]:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/calling-scripts/:id
 * Delete a calling script
 */
export async function DELETE(
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
    const response = await fetch(`${BASE_API_URL}api/calling-scripts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in DELETE /api/calling-scripts/[id]:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

