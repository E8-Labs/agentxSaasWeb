import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/dialer/calls/twiml
 * Generate TwiML for outbound call (called by Twilio)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    // Call backend API to generate TwiML
    const response = await fetch(`${BASE_API_URL}api/dialer/calls/twiml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const twiml = await response.text()

    return new Response(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error: any) {
    console.error('Error in POST /api/dialer/calls/twiml:', error)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred</Say></Response>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/xml' },
      },
    )
  }
}
