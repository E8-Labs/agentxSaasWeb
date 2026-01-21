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
  const { searchParams } = new URL(req.url)
  const redirectUri = searchParams.get('redirect_uri') ?? '' // This is the custom domain redirect URI
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H5',
      location: 'app/api/ghl/exchange/route.js:entry',
      message: 'GHL exchange route hit',
      data: {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        hasRedirectUri: Boolean(redirectUri),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion agent log

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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H5',
      location: 'app/api/ghl/exchange/route.js:redirect-uri',
      message: 'Using redirect URIs for exchange',
      data: {
        isProduction,
        approvedRedirectUri,
        hasCustomRedirectUri: Boolean(redirectUri),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion agent log

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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H5',
      location: 'app/api/ghl/exchange/route.js:token-response',
      message: 'GHL token exchange response received',
      data: {
        ok: Boolean(r.ok),
        status: r.status,
        hasAccessToken: Boolean(json?.access_token),
        hasLocationId: Boolean(json?.locationId),
        hasRefreshToken: Boolean(json?.refresh_token),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion agent log

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

  // Add success parameter to indicate OAuth completed
  const redirectUrl = new URL(redirectBackUrl)
  redirectUrl.searchParams.set('ghl_oauth', 'success')
  if (json.locationId) {
    redirectUrl.searchParams.set('locationId', json.locationId)
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H5',
      location: 'app/api/ghl/exchange/route.js:redirect-back',
      message: 'GHL exchange computed redirect back URL',
      data: {
        redirectBackUrl: String(redirectBackUrl || '').slice(0, 160),
        redirectUrl: String(redirectUrl?.toString?.() || '').slice(0, 200),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion agent log

  // ALWAYS return HTML instead of server-side redirect
  // This preserves window.opener context for popups (works on dev.assignx.ai and custom domains)
  // The client-side script will detect if it's a popup and handle accordingly
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>GHL OAuth Success</title>
  <script>
    (function() {
      var locationId = ${json.locationId ? `'${json.locationId}'` : 'null'};
      var redirectUrl = '${redirectUrl.toString().replace(/'/g, "\\'")}';
      
      // Check if we're in a popup (this works regardless of domain)
      var isPopup = window.opener !== null && window.opener !== window;
      var hasOpener = typeof window.opener !== 'undefined' && window.opener !== null;
      
      if (isPopup || hasOpener) {
        // Send message to parent window
        // Use '*' as origin to work across dev.assignx.ai and custom domains
        try {
          if (window.opener && !window.opener.closed) {
            // Try same origin first
            try {
              window.opener.postMessage({
                type: 'GHL_OAUTH_SUCCESS',
                locationId: locationId
              }, window.location.origin);
            } catch (e) {
              // If same origin fails, try wildcard (for cross-domain scenarios)
              window.opener.postMessage({
                type: 'GHL_OAUTH_SUCCESS',
                locationId: locationId
              }, '*');
            }
          }
        } catch (e) {
          console.error('🚨 [GHL Exchange] Error sending message:', e);
        }
        
        // Close popup immediately
        var closeAttempts = 0;
        var tryClose = function() {
          closeAttempts++;
          try {
            window.close();
            // If close doesn't work, focus parent
            setTimeout(function() {
              if (!window.closed && window.opener && !window.opener.closed) {
                try {
                  window.opener.focus();
                } catch (e) {
                  console.error('🚨 [GHL Exchange] Error focusing parent:', e);
                }
              }
            }, 50);
          } catch (e) {
            console.error('🚨 [GHL Exchange] Error closing popup:', e);
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.focus();
              }
            } catch (e2) {
              console.error('🚨 [GHL Exchange] Error focusing parent:', e2);
            }
          }
        };
        
        // Try closing multiple times
        tryClose();
        setTimeout(tryClose, 100);
        setTimeout(tryClose, 300);
        setTimeout(tryClose, 500);
        setTimeout(tryClose, 1000);
      } else {
        // Not a popup, redirect normally
        window.location.href = redirectUrl;
      }
    })();
  </script>
</head>
<body>
  <p>Completing authentication...</p>
</body>
</html>`

  const res = new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  })

  // Set cookies
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

  return res

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

  return res
}
