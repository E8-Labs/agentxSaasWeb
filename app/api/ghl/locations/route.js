// app/api/ghl/locations/route.js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ghl_access_token')?.value
  if (!token)
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  const url = new URL('https://services.leadconnectorhq.com/locations/')

  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28',
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  const text = await r.text()
  return new NextResponse(text, {
    status: r.ok ? 200 : r.status,
    headers: {
      'Content-Type': r.headers.get('content-type') || 'application/json',
    },
  })
}
