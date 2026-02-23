import { NextRequest, NextResponse } from 'next/server'

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
    ? 'https://apimyagentx.com/agentx/'
    : 'https://apimyagentx.com/agentxtest/')

/**
 * Catch-all API proxy. Handles any /api/* request that does not match
 * a more specific Route Handler. Forwards method, headers, body, and
 * query string to the backend.
 */
async function proxyRequest(
  req: NextRequest,
  path: string[]
) {
  const pathSegment = path.length ? path.join('/') : ''
  const url = new URL(req.url)
  const search = url.search
  const targetUrl = `${BASE_API_URL}api/${pathSegment}${search}`

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (
      lower === 'host' ||
      lower === 'connection' ||
      lower === 'content-length'
    ) {
      return
    }
    headers.set(key, value)
  })

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body || undefined,
      cache: 'no-store',
    })

    const responseHeaders = new Headers(response.headers)
    responseHeaders.delete('content-encoding')

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error: unknown) {
    console.error('API proxy error:', targetUrl, error)
    return NextResponse.json(
      {
        status: false,
        message: 'Backend unreachable',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(req, path)
}
