import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const token = authHeader.split(' ')[1]
    const { id } = await params

    const response = await fetch(
      `${BASE_API_URL}api/pipeline/cadenceTemplates/${id}`,
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

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Failed to fetch cadence template' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in GET /api/pipeline/cadenceTemplates/[id]:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const token = authHeader.split(' ')[1]
    const { id } = await params
    const body = await req.json()

    const response = await fetch(
      `${BASE_API_URL}api/pipeline/cadenceTemplates/${id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Failed to update cadence template' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in PUT /api/pipeline/cadenceTemplates/[id]:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const token = authHeader.split(' ')[1]
    const { id } = await params

    const response = await fetch(
      `${BASE_API_URL}api/pipeline/cadenceTemplates/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Failed to delete cadence template' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in DELETE /api/pipeline/cadenceTemplates/[id]:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error', error: error.message },
      { status: 500 },
    )
  }
}
