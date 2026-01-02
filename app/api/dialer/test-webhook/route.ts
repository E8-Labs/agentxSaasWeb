import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/dialer/test-webhook
 * Simple test endpoint to verify the API route is accessible
 * Can be called from anywhere to test if routes are working
 */
export async function GET(req: NextRequest) {
  console.log('🔵 [NEXT.JS TEST WEBHOOK] GET request received at:', new Date().toISOString())
  console.log('🔵 [NEXT.JS TEST WEBHOOK] URL:', req.url)
  console.log('🔵 [NEXT.JS TEST WEBHOOK] Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2))
  
  return NextResponse.json({
    status: true,
    message: 'Next.js API route is accessible',
    timestamp: new Date().toISOString(),
    url: req.url,
  })
}

/**
 * POST /api/dialer/test-webhook
 * Test POST endpoint to verify webhook-style requests work
 */
export async function POST(req: NextRequest) {
  console.log('🔵 [NEXT.JS TEST WEBHOOK] POST request received at:', new Date().toISOString())
  console.log('🔵 [NEXT.JS TEST WEBHOOK] URL:', req.url)
  console.log('🔵 [NEXT.JS TEST WEBHOOK] Method:', req.method)
  console.log('🔵 [NEXT.JS TEST WEBHOOK] Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2))
  
  try {
    const formData = await req.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })
    console.log('🔵 [NEXT.JS TEST WEBHOOK] Body:', JSON.stringify(body, null, 2))
  } catch (error) {
    try {
      const json = await req.json()
      console.log('🔵 [NEXT.JS TEST WEBHOOK] JSON Body:', JSON.stringify(json, null, 2))
    } catch (e) {
      console.log('🔵 [NEXT.JS TEST WEBHOOK] Could not parse body')
    }
  }
  
  return NextResponse.json({
    status: true,
    message: 'Next.js API route POST is accessible',
    timestamp: new Date().toISOString(),
    url: req.url,
  })
}

