import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * POST /api/dialer/calls/incoming
 * Handle incoming calls to internal dialer number (called by Twilio)
 * Returns TwiML to dial the user's registered device
 */
export async function POST(req: NextRequest) {
  // Log immediately when endpoint is hit
  console.log('🔵 [NEXT.JS INCOMING WEBHOOK] ========================================')
  console.log('🔵 [NEXT.JS INCOMING WEBHOOK] Endpoint hit at:', new Date().toISOString())
  console.log('🔵 [NEXT.JS INCOMING WEBHOOK] URL:', req.url)
  console.log('🔵 [NEXT.JS INCOMING WEBHOOK] Method:', req.method)
  console.log('🔵 [NEXT.JS INCOMING WEBHOOK] Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2))
  
  try {
    const formData = await req.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] Body keys:', Object.keys(body))
    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] From:', body.From || body.from)
    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] To:', body.To || body.to)
    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] CallSid:', body.CallSid || body.callSid)
    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] Forwarding to backend:', `${BASE_API_URL}api/dialer/calls/incoming`)

    // Call backend API to handle incoming call
    const response = await fetch(`${BASE_API_URL}api/dialer/calls/incoming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body),
      cache: 'no-store',
    })

    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔵 [NEXT.JS INCOMING WEBHOOK] Backend error:', errorText)
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const twiml = await response.text()
    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] TwiML received from backend:', twiml.substring(0, 200))
    console.log('🔵 [NEXT.JS INCOMING WEBHOOK] Returning TwiML to Twilio')

    return new Response(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error: any) {
    console.error('🔵 [NEXT.JS INCOMING WEBHOOK] Error:', error)
    console.error('🔵 [NEXT.JS INCOMING WEBHOOK] Error stack:', error.stack)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred</Say><Hangup /></Response>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/xml' },
      },
    )
  }
}

