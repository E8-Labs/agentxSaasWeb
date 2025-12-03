// export async function GET(req) {
//     const { searchParams } = new URL(req.url);
//     const code = searchParams.get("code");
//     if (!code) {
//         return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
//     }
//     const body = new URLSearchParams({
//         grant_type: "authorization_code",
//         code,
//         client_id: process.env.GHL_CLIENT_ID,
//         client_secret: process.env.GHL_CLIENT_SECRET,
//         redirect_uri: process.env.GHL_REDIRECT_URI,
//     });
//     const r = await fetch("https://services.leadconnectorhq.com/oauth/token", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Accept: "application/json",
//             Version: "2021-07-28",
//         },
//         body,
//     });
//     const json = await r.json();
//     if (!r.ok) {
//         return new Response(JSON.stringify(json), { status: r.status });
//     }
//     // TODO: persist per-location (json.locationId) with access_token/refresh_token/expiry
//     return new Response(JSON.stringify(json), { status: 200 });
// }
// app/api/ghl/exchange/route.js
// import { NextResponse } from "next/server";
// export async function GET(req) {
//     const { searchParams } = new URL(req.url);
//     const code = searchParams.get("code");
//     if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
//     const body = new URLSearchParams({
//         grant_type: "authorization_code",
//         code,
//         client_id: process.env.GHL_CLIENT_ID,
//         client_secret: process.env.GHL_CLIENT_SECRET,
//         redirect_uri: process.env.GHL_REDIRECT_URI,
//     });
//     const r = await fetch("https://services.leadconnectorhq.com/oauth/token", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Accept: "application/json",
//             Version: "2021-07-28",
//         },
//         body,
//     });
//     const json = await r.json();
//     if (!r.ok) return NextResponse.json(json, { status: r.status });
//     const res = NextResponse.json({ ok: true });
//     const maxAge = Math.max(60, (json.expires_in ?? 3600) - 60);
//     const isProd = false;//process.env.NODE_ENV === "production";
//     res.cookies.set("ghl_access_token", json.access_token, {
//         httpOnly: true,
//         secure: isProd,           // ✅ only Secure in production
//         sameSite: "lax",
//         path: "/",
//         maxAge,
//     });
//     if (json.refresh_token) {
//         res.cookies.set("ghl_refresh_token", json.refresh_token, {
//             httpOnly: true,
//             secure: isProd,         // ✅ same here
//             sameSite: "lax",
//             path: "/",
//             maxAge: 60 * 60 * 24 * 30,
//         });
//     }
//     return res;
// }
// app/api/ghl/exchange/route.js
import { NextResponse } from 'next/server'
import { parseOAuthState } from '@/utils/oauthState'

export async function GET(req) {
  console.log('Trigered the Exchange token file')
  const { searchParams } = new URL(req.url)
  const redirectUri = searchParams.get('redirect_uri') ?? '' // This is the custom domain redirect URI
  console.log('Redirect url of GHL calendar is', redirectUri)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code)
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  // Parse state to get the approved redirect URI (the one registered in GHL console)
  const stateData = state ? parseOAuthState(state) : null
  
  // For GHL token exchange, we MUST use the approved redirect URI (dev.assignx.ai or app.assignx.ai)
  // NOT the custom domain redirect URI
  // The approved redirect URI is what was used in the initial OAuth authorization request
  const isProduction = process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
  const approvedRedirectUri = isProduction
    ? 'https://app.assignx.ai/dashboard/myAgentX'
    : 'https://dev.assignx.ai/dashboard/myAgentX'
  
  console.log('Using approved redirect URI for GHL token exchange:', approvedRedirectUri)
  console.log('Custom domain redirect URI (for redirect back):', redirectUri)

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
    client_secret: process.env.NEXT_PUBLIC_GHL_CLIENT_SECRET,
    redirect_uri: approvedRedirectUri, // Use approved URI for token exchange
  })

  const r = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Version: '2021-07-28',
    },
    body,
  })

  const json = await r.json()
  console.log('R of GHL Auth api in json is', json)
  console.log('R of GHL Auth api simple is', r)
  console.log('GHL Token Exchange Response Status:', r.status)
  console.log('GHL Token Exchange Response Body:', JSON.stringify(json, null, 2))
  
  if (!r.ok) {
    console.error('❌ GHL Token Exchange Failed:')
    console.error('- Status:', r.status)
    console.error('- Response:', json)
    console.error('- Request redirect_uri used:', approvedRedirectUri)
    return NextResponse.json(json, { status: r.status })
  }

  const isProd = process.env.NODE_ENV === 'production'
  const maxAge = Math.max(60, (json.expires_in ?? 3600) - 60)

  // Build redirect URL back to original page (custom domain)
  // Use originalRedirectUri from state if available, otherwise use the redirectUri param
  const originalRedirectUri = stateData?.originalRedirectUri || redirectUri
  
  let redirectBackUrl = originalRedirectUri
  if (!redirectBackUrl) {
    // Fallback: use current origin + /dashboard/myAgentX
    const currentUrl = new URL(req.url)
    redirectBackUrl = `${currentUrl.origin}/dashboard/myAgentX`
  }
  
  console.log('Redirecting back to:', redirectBackUrl)

  // Add success parameter to indicate OAuth completed
  const redirectUrl = new URL(redirectBackUrl)
  redirectUrl.searchParams.set('ghl_oauth', 'success')
  if (json.locationId) {
    redirectUrl.searchParams.set('locationId', json.locationId)
  }
  
  // Check if this request came from a popup by checking the referer or a custom header
  // If we can detect it's from a popup, add a flag to help client-side detection
  const referer = req.headers.get('referer') || ''
  const isLikelyPopup = referer.includes('marketplace.gohighlevel.com') || referer.includes('oauth')
  if (isLikelyPopup) {
    redirectUrl.searchParams.set('_popup', '1')
  }

  // Create redirect response with cookies
  const res = NextResponse.redirect(redirectUrl.toString())

  res.cookies.set('ghl_access_token', json.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
  if (json.refresh_token) {
    res.cookies.set('ghl_refresh_token', json.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  if (json.locationId) {
    res.cookies.set('ghl_location_id', json.locationId, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
  }

  console.log('✅ GHL OAuth exchange successful, redirecting to:', redirectUrl.toString())
  return res
}
