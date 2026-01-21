import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/dialer/test-webhook
 * Simple test endpoint to verify the API route is accessible
 * Can be called from anywhere to test if routes are working
 */
export async function GET(req: NextRequest) {
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
  try {
    const formData = await req.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })
  } catch (error) {
    try {
      const json = await req.json()
    } catch (e) {}
  }

  return NextResponse.json({
    status: true,
    message: 'Next.js API route POST is accessible',
    timestamp: new Date().toISOString(),
    url: req.url,
  })
}

