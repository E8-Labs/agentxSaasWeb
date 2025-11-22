import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Subdomain and custom domain detection
  let agencyId = null
  let agencySubdomain = null
  let isCustomDomain = false
  let agencyBranding = null

  // Check if it's a subdomain of assignx.ai
  if (hostname.includes('.assignx.ai')) {
    // Extract subdomain: {uuid}.assignx.ai
    const subdomainParts = hostname.split('.')
    if (subdomainParts.length >= 3) {
      agencySubdomain = hostname // Full subdomain
      const subdomainValue = subdomainParts[0] // Just the UUID part

      try {
        // Call lookup API
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_API_URL ||
          (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
            ? 'https://apimyagentx.com/agentx/'
            : 'https://apimyagentx.com/agentxtest/')

        const lookupResponse = await fetch(
          `${baseUrl}api/agency/lookup-by-domain`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subdomain: subdomainValue }),
          },
        )

        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          if (lookupData.status && lookupData.data) {
            agencyId = lookupData.data.agencyId
            // Store branding for later use
            if (lookupData.data.branding) {
              agencyBranding = lookupData.data.branding
            }
          }
        }
      } catch (error) {
        console.error('Error looking up subdomain:', error)
      }
    }
  } else if (
    hostname &&
    !hostname.includes('localhost') &&
    !hostname.includes('127.0.0.1')
  ) {
    // Check if it's a custom domain (not localhost and not assignx.ai)
    isCustomDomain = true

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL ||
        (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
          ? 'https://apimyagentx.com/agentx/'
          : 'https://apimyagentx.com/agentxtest/')

      const lookupResponse = await fetch(
        `${baseUrl}api/agency/lookup-by-domain`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customDomain: hostname }),
        },
      )

      if (lookupResponse.ok) {
        const lookupData = await lookupResponse.json()
        if (lookupData.status && lookupData.data) {
          agencyId = lookupData.data.agencyId
          // Store branding for later use
          if (lookupData.data.branding) {
            agencyBranding = lookupData.data.branding
          }
        }
      }
    } catch (error) {
      console.error('Error looking up custom domain:', error)
    }
  }

  // Grab User cookie early (needed for /agency redirect too)
  const userCookie = request.cookies.get('User')
  let user = null

  if (user === null) {
    console.log('not found user')
  }

  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value))
    } catch (err) {
      console.error(
        '🍪 COOKIE PARSING ERROR - Time:',
        new Date().toISOString(),
        'Error:',
        err,
      )
      console.error('🍪 Cookie value that failed to parse:', userCookie.value)
      // Don't immediately logout on parsing errors - could be temporary corruption
      user = null
    }
  }

  // ---- Redirect ONLY /agency (and /agency/) ----
  if (pathname === '/agency' || pathname === '/agency/') {
    if (user) {
      // Logged-in agency user → dashboard
      const redirectResponse = NextResponse.redirect(
        new URL('/agency/dashboard', request.url),
      )
      if (agencyId) {
        redirectResponse.headers.set('x-agency-id', agencyId.toString())
        redirectResponse.headers.set('x-agency-domain', hostname)
        if (agencySubdomain) {
          redirectResponse.headers.set('x-agency-subdomain', agencySubdomain)
        }
        redirectResponse.cookies.set('agencyId', agencyId.toString(), {
          httpOnly: false,
          sameSite: 'lax',
        })
        if (agencyBranding) {
          redirectResponse.cookies.set(
            'agencyBranding',
            JSON.stringify(agencyBranding),
            {
              httpOnly: false,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24,
            },
          )
        }
      }
      return redirectResponse
    }
    // Not logged in → send home
    const redirectResponse = NextResponse.redirect(new URL('/', request.url))
    if (agencyId) {
      redirectResponse.headers.set('x-agency-id', agencyId.toString())
      redirectResponse.headers.set('x-agency-domain', hostname)
      if (agencySubdomain) {
        redirectResponse.headers.set('x-agency-subdomain', agencySubdomain)
      }
      redirectResponse.cookies.set('agencyId', agencyId.toString(), {
        httpOnly: false,
        sameSite: 'lax',
      })
    }
    return redirectResponse
  }

  // ---- Security headers for embed ----
  if (pathname.startsWith('/embed/vapi')) {
    const res = NextResponse.next()
    res.headers.set('X-Frame-Options', 'ALLOWALL')
    res.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'none'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        'frame-ancestors *',
      ].join('; '),
    )
    if (agencyId) {
      res.headers.set('x-agency-id', agencyId.toString())
      res.headers.set('x-agency-domain', hostname)
      if (agencySubdomain) {
        res.headers.set('x-agency-subdomain', agencySubdomain)
      }
      res.cookies.set('agencyId', agencyId.toString(), {
        httpOnly: false,
        sameSite: 'lax',
      })
      if (agencyBranding) {
        res.cookies.set('agencyBranding', JSON.stringify(agencyBranding), {
          httpOnly: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
        })
      }
    }
    return res
  }

  // ---- Public paths ----
  if (
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname === '/onboarding/WaitList' ||
    pathname.startsWith('/onboarding/') || // allows /onboarding/[uuid]
    pathname.startsWith('/agency/onboarding') ||
    pathname.startsWith('/agency/verify') ||
    (pathname.startsWith('/agency/') &&
      (pathname.includes('/privacy') || pathname.includes('/terms'))) || // allows /agency/[agencyUUID]/privacy and /agency/[agencyUUID]/terms
    pathname.startsWith('/recordings/')
  ) {
    const publicResponse = NextResponse.next()
    if (agencyId) {
      publicResponse.headers.set('x-agency-id', agencyId.toString())
      publicResponse.headers.set('x-agency-domain', hostname)
      if (agencySubdomain) {
        publicResponse.headers.set('x-agency-subdomain', agencySubdomain)
      }
      publicResponse.cookies.set('agencyId', agencyId.toString(), {
        httpOnly: false,
        sameSite: 'lax',
      })
      if (agencyBranding) {
        publicResponse.cookies.set(
          'agencyBranding',
          JSON.stringify(agencyBranding),
          {
            httpOnly: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
          },
        )
      }
    }
    return publicResponse
  }

  // ---- Require login for everything else ----
  if (!user) {
    // Not logged in → always send home
    console.log(
      '🔄 MIDDLEWARE REDIRECT - Time:',
      new Date().toISOString(),
      'Reason: No user found',
      'Path:',
      pathname,
    )
    const redirectResponse = NextResponse.redirect(new URL('/', request.url))
    if (agencyId) {
      redirectResponse.headers.set('x-agency-id', agencyId.toString())
      redirectResponse.headers.set('x-agency-domain', hostname)
      if (agencySubdomain) {
        redirectResponse.headers.set('x-agency-subdomain', agencySubdomain)
      }
      redirectResponse.cookies.set('agencyId', agencyId.toString(), {
        httpOnly: false,
        sameSite: 'lax',
      })
    }
    return redirectResponse
  }

  // 🚨 Force re-login if cookie is outdated (missing userRole or userType)
  // if (!user.userRole || !user.userType) {
  //   // Allow request to proceed without deleting cookie to avoid instant logout on fresh login
  //   return NextResponse.next();
  // }
  console.log('User data is', user)
  // ---- Centralized redirect rule ----
  let expectedPath = null

  if (user.userType === 'admin') {
    expectedPath = '/admin'
  } else if (user.userRole === 'AgencySubAccount') {
    expectedPath = '/dashboard'
  } else if (user.userRole === 'Agency' || user.agencyTeammember === true) {
    expectedPath = '/agency/dashboard'
  } else {
    expectedPath = '/dashboard'
  }

  // ✅ UPDATE: Skip redirect enforcement for certain paths
  if (
    pathname.startsWith('/createagent') ||
    pathname.startsWith('/pipeline') ||
    pathname.startsWith('/plan') ||
    pathname.startsWith('/web-agent')
  ) {
    return NextResponse.next()
  }

  // ---- Prevent redirect loops ----
  const isExactMatch = pathname === expectedPath
  const isSubPath = pathname.startsWith(expectedPath + '/')

  console.log(
    '🔍 MIDDLEWARE DEBUG - Path:',
    pathname,
    'Expected:',
    expectedPath,
    'IsExact:',
    isExactMatch,
    'IsSubPath:',
    isSubPath,
    'UserType:',
    user.userType,
    'UserRole:',
    user.userRole,
  )

  if (
    pathname !== expectedPath && // exact base mismatch
    !pathname.startsWith(expectedPath + '/') // allow deeper subpaths
  ) {
    console.log('Path mismatch detected')
    if (pathname === '/createagent' && user.userType === 'admin') {
      // allowed createagent for admin
      console.log('Accessing /createagent as admin, allowing')
      const adminResponse = NextResponse.next()
      if (agencyId) {
        adminResponse.headers.set('x-agency-id', agencyId.toString())
        adminResponse.headers.set('x-agency-domain', hostname)
        if (agencySubdomain) {
          adminResponse.headers.set('x-agency-subdomain', agencySubdomain)
        }
        adminResponse.cookies.set('agencyId', agencyId.toString(), {
          httpOnly: false,
          sameSite: 'lax',
        })
        if (agencyBranding) {
          adminResponse.cookies.set(
            'agencyBranding',
            JSON.stringify(agencyBranding),
            {
              httpOnly: false,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24,
            },
          )
        }
      }
      return adminResponse
    }
    console.log(
      '🔄 MIDDLEWARE REDIRECT - Time:',
      new Date().toISOString(),
      'Reason: Path mismatch',
      'Current:',
      pathname,
      'Expected:',
      expectedPath,
      'UserType:',
      user.userType,
      'UserRole:',
      user.userRole,
    )
    const redirectResponse = NextResponse.redirect(
      new URL(expectedPath, request.url),
    )
    // Inject agency headers if found
    if (agencyId) {
      redirectResponse.headers.set('x-agency-id', agencyId.toString())
      redirectResponse.headers.set('x-agency-domain', hostname)
      if (agencySubdomain) {
        redirectResponse.headers.set('x-agency-subdomain', agencySubdomain)
      }
      redirectResponse.cookies.set('agencyId', agencyId.toString(), {
        httpOnly: false,
        sameSite: 'lax',
      })
      if (agencyBranding) {
        redirectResponse.cookies.set(
          'agencyBranding',
          JSON.stringify(agencyBranding),
          {
            httpOnly: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
          },
        )
      }
    }
    return redirectResponse
  }

  const response = NextResponse.next()
  // Inject agency headers if found
  if (agencyId) {
    response.headers.set('x-agency-id', agencyId.toString())
    response.headers.set('x-agency-domain', hostname)
    if (agencySubdomain) {
      response.headers.set('x-agency-subdomain', agencySubdomain)
    }
    response.cookies.set('agencyId', agencyId.toString(), {
      httpOnly: false,
      sameSite: 'lax',
    })
    // Store branding in cookie for client-side access
    if (agencyBranding) {
      response.cookies.set('agencyBranding', JSON.stringify(agencyBranding), {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      })
    }
  }
  return response
}

export const config = {
  matcher: [
    '/agency', // exact /agency
    '/createagent/:path*',
    '/pipeline/:path*',
    '/sellerkycquestions/:path*',
    '/buyerkycquestions/:path*',
    '/dashboard/:path*',
    '/onboarding',
    '/plan',
    '/onboarding/:path*',
    '/admin/:path*',
    '/embedCalendar/:path*',
    '/agency/dashboard/:path*', // subpaths processed normally
  ],
}
