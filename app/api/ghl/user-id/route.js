// app/api/ghl/user-id/route.js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const c = await cookies()
  const token = c.get('ghl_access_token')?.value
  const locationId = c.get('ghl_location_id')?.value

  if (!token || !locationId) {
    return NextResponse.json(
      {
        error: 'Not authorized',
        hasToken: !!token,
        hasLocationId: !!locationId,
      },
      { status: 401 },
    )
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    Version: '2021-07-28',
  }

  const candidates = [
    `https://services.leadconnectorhq.com/users/?locationId=${encodeURIComponent(locationId)}`, // query form
    `https://services.leadconnectorhq.com/locations/${encodeURIComponent(locationId)}/users/`, // path form
  ]

  for (const url of candidates) {
    const r = await fetch(url, { headers, cache: 'no-store' })
    const text = await r.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {}

    if (r.status === 403) {
      // Token lacks users.readonly -> re-run OAuth after updating scopes
      return NextResponse.json(
        { error: 'Missing users.readonly on token', url, body: text },
        { status: 403 },
      )
    }

    if (r.ok) {
      const users = (data?.users ?? data) || []
      if (Array.isArray(users) && users.length) {
        const picked = users.find((u) => u.role === 'admin') || users[0]
        const userId = String(picked.id)

        const res = NextResponse.json({
          userId,
          from: url,
          count: users.length,
        })
        res.cookies.set('ghl_user_id', userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        })
        return res
      }
    } else {
      // Bubble up what HL actually said so you can see it
      return NextResponse.json(
        { upstreamStatus: r.status, url, body: text },
        { status: r.status },
      )
    }
  }

  // Fallback: team member from calendars
  const calUrl = `https://services.leadconnectorhq.com/calendars/?locationId=${encodeURIComponent(locationId)}`
  const rc = await fetch(calUrl, { headers, cache: 'no-store' })
  const calText = await rc.text()
  let cal
  try {
    cal = JSON.parse(calText)
  } catch {}

  if (rc.ok) {
    const tm = cal?.calendars?.[0]?.teamMembers?.[0]?.id
    if (tm) {
      const userId = String(tm)
      const res = NextResponse.json({ userId, from: 'calendar.teamMembers' })
      res.cookies.set('ghl_user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
      return res
    }
  }

  return NextResponse.json(
    { error: 'No users found and no teamMembers on calendars' },
    { status: 404 },
  )
}
