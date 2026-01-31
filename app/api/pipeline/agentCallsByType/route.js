import { NextResponse } from 'next/server'

import Apis from '@/components/apis/Apis'

export async function GET(req) {
  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('agentId')
    const type = searchParams.get('type')
    const offset = searchParams.get('offset') ?? '0'
    const limit = searchParams.get('limit') ?? '20'

    if (!agentId || !type) {
      return NextResponse.json(
        {
          message: 'agentId and type are required',
          status: false,
          data: null,
        },
        { status: 400 },
      )
    }

    const url = `${Apis.getAgentCallsByType}?agentId=${agentId}&type=${type}&offset=${offset}&limit=${limit}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || 'Failed to fetch agent calls by type',
          status: false,
          data: null,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error', error: 'Internal server error' },
      { status: 500 },
    )
  }
}
