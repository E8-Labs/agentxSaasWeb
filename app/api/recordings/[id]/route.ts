import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { status: false, error: 'Call ID is required' },
        { status: 400 }
      )
    }

    // Call the public endpoint that doesn't require authentication
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}api/leads/getCallPublic/${id}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          status: false, 
          error: errorData.error || 'Failed to fetch recording' 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching recording:', error)
    return NextResponse.json(
      { status: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
