import { NextResponse } from 'next/server'
import { parseOAuthState } from '@/utils/oauthState'

/**
 * Creates a NextResponse.next() with branding data passed via request headers.
 * This ensures getServerBranding() can read branding in the same request cycle
 * (not just on subsequent requests via cookies).
 *
 * @param {Request} request - The incoming request
 * @param {Object|null} agencyBranding - The branding data to pass
 * @returns {NextResponse} Response with modified request headers
 */
function createResponseWithBrandingHeaders(request, agencyBranding) {
  if (agencyBranding) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-agency-branding', JSON.stringify(agencyBranding))
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  return NextResponse.next()
}

export async function proxy(request) {
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

  // For logged-in agency/subaccount users, ensure branding is available
  // First check cookie cache, then fetch from API if needed
  if (user && !agencyBranding) {
    const userRole = user.userRole
    if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
      // First check if branding cookie exists (cache)
      const brandingCookie = request.cookies.get('agencyBranding')
      if (brandingCookie?.value) {
        try {
          agencyBranding = JSON.parse(decodeURIComponent(brandingCookie.value))
        } catch (e) {
          // Invalid cookie, will fetch fresh
        }
      }

      // If no cached branding, fetch from API with timeout
      if (!agencyBranding) {
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_API_URL ||
            (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
              ? 'https://apimyagentx.com/agentx/'
              : 'https://apimyagentx.com/agentxtest/')

          const tokenCookie = request.cookies.get('token')
          const authToken = tokenCookie?.value || user.token
          if (authToken) {
            // Add timeout to prevent slow API from blocking page load
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)

            try {
              const response = await fetch(`${baseUrl}api/agency/branding`, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
                signal: controller.signal,
              })
              clearTimeout(timeoutId)

              if (response.ok) {
                const data = await response.json()
                if (data?.status && data?.data?.branding) {
                  agencyBranding = data.data.branding
                }
              }
            } catch (fetchError) {
              clearTimeout(timeoutId)
              // Silent fail on timeout or network error
            }
          }
        } catch (error) {
          // Silent fail, will use default branding
        }
      }
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
    // Create response with branding in request headers (for immediate access by getServerBranding)
    const res = createResponseWithBrandingHeaders(request, agencyBranding)
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
    // Create response with branding in request headers (for immediate access by getServerBranding)
    const publicResponse = createResponseWithBrandingHeaders(
      request,
      agencyBranding,
    )
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
        // Also set cookie for future requests
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

  // ---- Handle OAuth callbacks before user check ----
  // If this is an OAuth callback (has code or error param), handle redirect directly
  const searchParams = request.nextUrl.searchParams
  const oauthCode = searchParams.get('code')
  const oauthState = searchParams.get('state')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')
  const redirectUri = searchParams.get('redirect_uri')

  if (oauthCode || oauthError) {
    console.log('🔄 OAuth callback detected in middleware')
    
    // Parse state to determine if we need to redirect to custom domain
    const stateData = oauthState ? parseOAuthState(oauthState) : null
    const provider = stateData?.provider || (oauthCode ? 'google' : 'ghl')
    
    // If state has customDomain, redirect to custom domain
    if (stateData?.customDomain) {
      const { customDomain } = stateData
      
      // Check if custom domain is the same as current hostname
      // If so, redirect to exchange route on same domain (preserves popup context better)
      if (customDomain === hostname) {
        console.log('🔄 Custom domain matches current hostname - redirecting to exchange on same domain (preserving popup context)')
        // Still redirect to exchange route, but on same domain
        // The exchange route returns HTML (not a redirect), which preserves window.opener
        const baseUrl = new URL(request.url).origin
        const exchangeUrl = new URL('/api/ghl/exchange', baseUrl)
        exchangeUrl.searchParams.set('code', oauthCode)
        if (oauthState) {
          exchangeUrl.searchParams.set('state', oauthState)
        }
        if (redirectUri) {
          exchangeUrl.searchParams.set('redirect_uri', redirectUri)
        }
        if (provider === 'ghl' && stateData.originalRedirectUri) {
          exchangeUrl.searchParams.set('redirect_uri', stateData.originalRedirectUri)
        }
        console.log('🔄 Redirecting to exchange on same domain:', exchangeUrl.toString())
        return NextResponse.redirect(exchangeUrl.toString())
      } else {
        // Cross-domain redirect (existing logic)
        console.log('🔄 Redirecting OAuth callback to custom domain:', customDomain)
        
        // Determine protocol (http for localhost, https for production)
        const isLocalhost = customDomain.includes('localhost') || customDomain.includes('127.0.0.1')
        const protocol = isLocalhost ? 'http' : 'https'
        
        // Build redirect URL to custom domain
        let callbackPath = '/oauth/callback'
        if (provider === 'google') {
          callbackPath = '/google-auth/callback'
        } else if (provider === 'ghl') {
          callbackPath = '/api/ghl/exchange'
        }
        
        const redirectUrl = new URL(callbackPath, `${protocol}://${customDomain}`)
        
        // Preserve all OAuth parameters
        if (oauthCode) redirectUrl.searchParams.set('code', oauthCode)
        if (oauthState) redirectUrl.searchParams.set('state', oauthState)
        if (oauthError) redirectUrl.searchParams.set('error', oauthError)
        if (oauthErrorDescription) redirectUrl.searchParams.set('error_description', oauthErrorDescription)
        if (redirectUri) redirectUrl.searchParams.set('redirect_uri', redirectUri)
        
        // For GHL, preserve originalRedirectUri from state
        if (provider === 'ghl' && stateData.originalRedirectUri) {
          redirectUrl.searchParams.set('redirect_uri', stateData.originalRedirectUri)
        }
        
        console.log('🔄 Redirecting to:', redirectUrl.toString())
        return NextResponse.redirect(redirectUrl.toString())
      }
    }
    
    // No custom domain in state - redirect to callback on same domain
    console.log('🔄 No custom domain in state - redirecting to callback on same domain')
    const baseUrl = new URL(request.url).origin
    
    if (oauthError) {
      // Handle OAuth errors
      const errorUrl = new URL('/google-auth/callback', baseUrl)
      errorUrl.searchParams.set('error', oauthError)
      if (oauthErrorDescription) {
        errorUrl.searchParams.set('error_description', oauthErrorDescription)
      }
      if (oauthState) {
        errorUrl.searchParams.set('state', oauthState)
      }
      return NextResponse.redirect(errorUrl.toString())
    }
    
    // Handle success - redirect to appropriate callback
    if (provider === 'google') {
      const callbackUrl = new URL('/google-auth/callback', baseUrl)
      callbackUrl.searchParams.set('code', oauthCode)
      if (oauthState) {
        callbackUrl.searchParams.set('state', oauthState)
      }
      return NextResponse.redirect(callbackUrl.toString())
    } else if (provider === 'ghl') {
      const exchangeUrl = new URL('/api/ghl/exchange', baseUrl)
      exchangeUrl.searchParams.set('code', oauthCode)
      if (redirectUri) {
        exchangeUrl.searchParams.set('redirect_uri', redirectUri)
      }
      if (oauthState) {
        exchangeUrl.searchParams.set('state', oauthState)
      }
      return NextResponse.redirect(exchangeUrl.toString())
    }
    
    // Default fallback
    const callbackUrl = new URL('/google-auth/callback', baseUrl)
    callbackUrl.searchParams.set('code', oauthCode)
    if (oauthState) {
      callbackUrl.searchParams.set('state', oauthState)
    }
    return NextResponse.redirect(callbackUrl.toString())
  }

  // ---- Require login for everything else ----
  if (!user) {
    // Not logged in → always send home
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
    pathname.startsWith('/web-agent') ||
    pathname.startsWith('/embedCalendar')
  ) {
    return createResponseWithBrandingHeaders(request, agencyBranding)
  }

  if (
    pathname !== expectedPath && // exact base mismatch
    !pathname.startsWith(expectedPath + '/') // allow deeper subpaths
  ) {
    if (pathname === '/createagent' && user.userType === 'admin') {
      // allowed createagent for admin
      // Create response with branding in request headers (for immediate access by getServerBranding)
      const adminResponse = createResponseWithBrandingHeaders(
        request,
        agencyBranding,
      )
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

  // Create response with branding in request headers (for immediate access by getServerBranding)
  const response = createResponseWithBrandingHeaders(request, agencyBranding)
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
  }
  // Store branding in cookie for client-side access (cache for subsequent requests)
  // This is set regardless of agencyId to support logged-in agency/subaccount users on localhost
  if (agencyBranding) {
    response.cookies.set('agencyBranding', JSON.stringify(agencyBranding), {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })
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
