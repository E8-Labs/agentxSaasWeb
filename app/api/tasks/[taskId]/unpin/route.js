import { NextResponse } from 'next/server'
import Apis from '@/components/apis/Apis'

export async function PATCH(req, { params }) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { taskId } = await params
    const userId = req.nextUrl.searchParams.get('userId')

    const url = `${Apis.BasePath}api/tasks/${taskId}/unpin${userId ? `?userId=${userId}` : ''}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { status: data.status ?? false, message: data.message || 'Failed to unpin task' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in unpin task API route:', error)
    return NextResponse.json(
      { status: false, message: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
