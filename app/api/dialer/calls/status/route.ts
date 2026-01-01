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
  // Log immediately when endpoint is hit
  console.log('🔵 [NEXT.JS STATUS WEBHOOK] Endpoint hit at:', new Date().toISOString())
  console.log('🔵 [NEXT.JS STATUS WEBHOOK] URL:', req.url)
  console.log('🔵 [NEXT.JS STATUS WEBHOOK] Method:', req.method)
  
  try {
    const formData = await req.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    console.log('🔵 [NEXT.JS STATUS WEBHOOK] Body keys:', Object.keys(body))
    console.log('🔵 [NEXT.JS STATUS WEBHOOK] CallSid:', body.CallSid)
    console.log('🔵 [NEXT.JS STATUS WEBHOOK] CallStatus:', body.CallStatus)

    // Get signature from headers
    const signature = req.headers.get('x-twilio-signature') || ''
    console.log('🔵 [NEXT.JS STATUS WEBHOOK] Has signature:', !!signature)

    const backendUrl = `${BASE_API_URL}api/dialer/calls/status`
    console.log('🔵 [NEXT.JS STATUS WEBHOOK] Forwarding to backend:', backendUrl)

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

    console.log('🔵 [NEXT.JS STATUS WEBHOOK] Backend response status:', response.status)

    const twiml = await response.text()

    console.log('🔵 [NEXT.JS STATUS WEBHOOK] Returning response to Twilio')

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
