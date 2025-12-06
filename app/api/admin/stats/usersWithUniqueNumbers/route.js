import { NextResponse } from 'next/server'

import Apis from '@/components/apis/Apis'

export async function GET(req) {
  try {
    // Extract token from request headers (sent from the frontend)
    const authHeader = req.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Fetch admin stats from backend API
    const response = await fetch(Apis.adminUsersWithUniquePhoneNumbers, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch users' },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, stats: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
