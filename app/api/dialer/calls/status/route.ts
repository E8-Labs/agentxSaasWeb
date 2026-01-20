import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/dialer/calls/status
 * Handle Twilio status callbacks
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    // Get signature from headers
    const signature = req.headers.get('x-twilio-signature') || ''

    const backendUrl = `${BASE_API_URL}api/dialer/calls/status`

    // Call backend API to handle status callback
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-twilio-signature': signature,
      },
      body: new URLSearchParams(body),
      cache: 'no-store',
    })

    const twiml = await response.text()

    return new Response(twiml, {
      status: response.status,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error: any) {
    console.error('🔵 [NEXT.JS STATUS WEBHOOK] Error:', error)
    console.error('🔵 [NEXT.JS STATUS WEBHOOK] Error stack:', error.stack)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      },
    )
  }
}
