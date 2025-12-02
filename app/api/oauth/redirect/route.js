import { NextResponse } from 'next/server'
import { parseOAuthState } from '@/utils/oauthState'

/**
 * OAuth Redirect Handler
 * 
 * This route handles OAuth callbacks that land on assignx.ai domains
 * and redirects them to the appropriate custom domain if needed.
 * 
 * Backward Compatibility:
 * - If state is missing or invalid → redirects to existing callback paths
 * - If state exists but has no customDomain → redirects to existing callback paths
 * - If state exists and has customDomain → verifies and redirects to custom domain
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const redirectUri = searchParams.get('redirect_uri') // For GHL

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    
    // Try to extract agency info from state to redirect to custom domain
    if (state) {
      try {
        const stateData = parseOAuthState(state)
        if (stateData?.customDomain) {
          const isLocalhost = stateData.customDomain.includes('localhost') || stateData.customDomain.includes('127.0.0.1')
          const protocol = isLocalhost ? 'http' : 'https'
          const redirectUrl = new URL(
            stateData.provider === 'google' 
              ? '/google-auth/callback' 
              : stateData.provider === 'ghl'
              ? '/api/ghl/exchange'
              : '/oauth/callback',
            `${protocol}://${stateData.customDomain}`
          )
          redirectUrl.searchParams.set('error', error)
          if (errorDescription) {
            redirectUrl.searchParams.set('error_description', errorDescription)
          }
          return NextResponse.redirect(redirectUrl.toString())
        }
      } catch (e) {
        console.error('Error parsing state for error redirect:', e)
      }
    }
    
    // Fallback: redirect to main domain error page or existing callback
    const baseUrl = new URL(req.url).origin
    const errorUrl = new URL('/google-auth/callback', baseUrl)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Missing code parameter' },
      { status: 400 }
    )
  }

  // Parse state if present
  const stateData = state ? parseOAuthState(state) : null

  // Debug logging
  console.log('OAuth Redirect Handler - Debug Info:')
  console.log('- Has code:', !!code)
  console.log('- Has state:', !!state)
  console.log('- State data:', stateData)
  console.log('- Custom domain in state:', stateData?.customDomain)

  // Backward compatibility: If no state or no custom domain, use existing flow
  if (!stateData || !stateData.customDomain) {
    console.log('No custom domain in state - using existing flow')
    // Determine provider from state or default to google
    const provider = stateData?.provider || 'google'
    
    // Redirect to existing callback paths
    const baseUrl = new URL(req.url).origin
    
    if (provider === 'google') {
      const callbackUrl = new URL('/google-auth/callback', baseUrl)
      callbackUrl.searchParams.set('code', code)
      if (state) {
        callbackUrl.searchParams.set('state', state)
      }
      return NextResponse.redirect(callbackUrl.toString())
    } else if (provider === 'ghl') {
      // For GHL, redirect to exchange endpoint
      const exchangeUrl = new URL('/api/ghl/exchange', baseUrl)
      exchangeUrl.searchParams.set('code', code)
      if (redirectUri) {
        exchangeUrl.searchParams.set('redirect_uri', redirectUri)
      }
      if (state) {
        exchangeUrl.searchParams.set('state', state)
      }
      return NextResponse.redirect(exchangeUrl.toString())
    }
    
    // Default fallback
    const callbackUrl = new URL('/google-auth/callback', baseUrl)
    callbackUrl.searchParams.set('code', code)
    return NextResponse.redirect(callbackUrl.toString())
  }

  // Custom domain flow: Verify domain and redirect
  try {
    const { customDomain, agencyId, provider } = stateData

    console.log('Custom domain flow - verifying domain:', customDomain, 'for agency:', agencyId)

    // Verify custom domain exists and is active
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL ||
      (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
        ? 'https://apimyagentx.com/agentx/'
        : 'https://apimyagentx.com/agentxtest/')

    const verifyResponse = await fetch(
      `${baseUrl}api/agency/lookup-by-domain`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain }),
      }
    )

    if (!verifyResponse.ok) {
      console.error('Failed to verify custom domain:', verifyResponse.status)
      // Fallback to existing callback
      return fallbackToExistingCallback(req, code, state, provider, redirectUri)
    }

    const verifyData = await verifyResponse.json()
    if (!verifyData.status || verifyData.data?.agencyId !== agencyId) {
      console.error('Custom domain verification failed - agency mismatch')
      // Fallback to existing callback
      return fallbackToExistingCallback(req, code, state, provider, redirectUri)
    }

    // Build redirect URL to custom domain
    // Use http for localhost, https for production
    const isLocalhost = customDomain.includes('localhost') || customDomain.includes('127.0.0.1')
    const protocol = isLocalhost ? 'http' : 'https'
    const redirectUrl = new URL(
      provider === 'google' 
        ? '/google-auth/callback' 
        : provider === 'ghl'
        ? '/api/ghl/exchange'
        : '/oauth/callback',
      `${protocol}://${customDomain}`
    )

    // Preserve all OAuth parameters
    redirectUrl.searchParams.set('code', code)
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }
    
    // For GHL, preserve redirect_uri
    if (provider === 'ghl') {
      if (stateData.originalRedirectUri) {
        redirectUrl.searchParams.set('redirect_uri', stateData.originalRedirectUri)
      } else if (redirectUri) {
        redirectUrl.searchParams.set('redirect_uri', redirectUri)
      }
    }

    console.log(`Redirecting OAuth callback to custom domain: ${redirectUrl.toString()}`)
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('OAuth redirect error:', error)
    // Fallback to existing callback on any error
    return fallbackToExistingCallback(req, code, state, stateData?.provider || 'google', redirectUri)
  }
}

/**
 * Fallback to existing callback paths when custom domain redirect fails
 */
function fallbackToExistingCallback(req, code, state, provider, redirectUri) {
  const baseUrl = new URL(req.url).origin
  
  if (provider === 'google') {
    const callbackUrl = new URL('/google-auth/callback', baseUrl)
    callbackUrl.searchParams.set('code', code)
    if (state) {
      callbackUrl.searchParams.set('state', state)
    }
    return NextResponse.redirect(callbackUrl.toString())
  } else if (provider === 'ghl') {
    const exchangeUrl = new URL('/api/ghl/exchange', baseUrl)
    exchangeUrl.searchParams.set('code', code)
    if (redirectUri) {
      exchangeUrl.searchParams.set('redirect_uri', redirectUri)
    }
    if (state) {
      exchangeUrl.searchParams.set('state', state)
    }
    return NextResponse.redirect(exchangeUrl.toString())
  }
  
  // Default fallback
  const callbackUrl = new URL('/google-auth/callback', baseUrl)
  callbackUrl.searchParams.set('code', code)
  return NextResponse.redirect(callbackUrl.toString())
}

