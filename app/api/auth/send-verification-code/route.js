import { NextResponse } from 'next/server'

import Apis from '@/components/apis/Apis'

/** Proxy sendVerificationCode to backend to avoid CORS when frontend calls from browser */
export async function POST(req) {
  try {
    const body = await req.json()
    const { phone, login = true } = body

    if (!phone) {
      return NextResponse.json(
        { status: false, message: 'Phone number required', data: null },
        { status: 400 },
      )
    }

    const response = await fetch(Apis.sendVerificationCode, {
      method: 'POST',
      body: JSON.stringify({ phone, login }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json().catch(() => ({ status: false, message: 'Invalid response' }))

    return NextResponse.json(data, { status: response.ok ? 200 : response.status })
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        message: error.message || 'Internal Server Error',
        data: null,
      },
      { status: 500 },
    )
  }
}
