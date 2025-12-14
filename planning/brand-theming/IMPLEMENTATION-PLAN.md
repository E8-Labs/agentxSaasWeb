---
Document: Brand Theming CDN Implementation Plan
Version: 1.0
Status: Ready for Implementation
Last Updated: 2025-12-13
Author: Claude Code
---

# Brand Theming CDN Implementation Plan

[← Back to Index](./index.md)

## Context

This plan details how to integrate CDN delivery for branding assets once CDN infrastructure is available. The current implementation fetches favicons on-demand from S3 with Next.js caching. This plan upgrades to CDN-based delivery for optimal performance.

## Prerequisites

Before implementing:

- [ ] CDN provider selected (CloudFront, Cloudflare, Vercel Edge, etc.)
- [ ] CDN configured with custom domain (e.g., `cdn.assignx.ai`)
- [ ] CDN origin set to S3 bucket or origin server
- [ ] CDN purge API access configured
- [ ] Environment variables defined for CDN URLs

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) - CDN architecture decisions
- [index.md](./index.md) - Overview and current state

---

## Current State

### Files Currently Handling Branding Assets

| File | Current Behavior |
|------|------------------|
| `app/icon.js` | Fetches favicon from S3 URL in branding cookie, returns as Response |
| `app/apple-icon.js` | Same as icon.js, larger size |
| `lib/getServerBranding.js` | Reads branding from cookies |
| `proxy.js` | Middleware that sets `agencyBranding` cookie |

### Current Data Flow

```
Request → Middleware (sets cookie) → icon.js → fetch(S3 URL) → Response
```

### Current Caching

```javascript
// In icon.js
fetch(faviconUrl, { next: { revalidate: 3600 } }) // 1 hour Next.js cache
```

---

## What to Implement

### Phase 1: Environment Configuration

- [ ] Add CDN environment variables to `.env`:
  ```
  NEXT_PUBLIC_CDN_BASE_URL=https://cdn.assignx.ai
  CDN_PURGE_API_KEY=xxx
  CDN_PURGE_ENDPOINT=https://api.cdn.com/purge
  ```

- [ ] Create CDN configuration utility:
  ```
  lib/cdn.js
  ```

- [ ] Update `next.config.mjs` with CDN image domains if needed

### Phase 2: Favicon Upload Pipeline (Backend)

- [ ] Modify backend favicon upload endpoint to:
  1. Upload to CDN-origin S3 bucket
  2. Generate CDN URL: `${CDN_BASE_URL}/favicon/${agencyId}.png`
  3. Store CDN URL in `branding.faviconCdnUrl`
  4. Trigger cache purge if replacing existing favicon

- [ ] Add cache purge utility to backend

### Phase 3: Update Favicon Routes

- [ ] Modify `app/icon.js`:

  ```javascript
  // app/icon.js - Updated for CDN
  import { cookies } from 'next/headers'
  import { readFile } from 'fs/promises'
  import path from 'path'

  export const contentType = 'image/png'
  export const size = { width: 32, height: 32 }

  const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL

  export default async function Icon() {
    const cookieStore = await cookies()
    const brandingCookie = cookieStore.get('agencyBranding')

    let branding = null
    if (brandingCookie?.value) {
      try {
        branding = JSON.parse(decodeURIComponent(brandingCookie.value))
      } catch (e) {}
    }

    // Option 1: Redirect to CDN URL (recommended)
    if (CDN_BASE_URL && branding?.agencyId && branding?.faviconCdnUrl) {
      return Response.redirect(branding.faviconCdnUrl, 302)
    }

    // Option 2: Redirect to CDN with constructed URL
    if (CDN_BASE_URL && branding?.agencyId) {
      const cdnUrl = `${CDN_BASE_URL}/favicon/${branding.agencyId}.png`
      return Response.redirect(cdnUrl, 302)
    }

    // Fallback: Fetch from S3 (legacy support)
    if (branding?.faviconUrl) {
      try {
        const response = await fetch(branding.faviconUrl, {
          next: { revalidate: 3600 }
        })
        if (response.ok) {
          return new Response(await response.arrayBuffer(), {
            headers: {
              'Content-Type': response.headers.get('content-type') || 'image/png',
              'Cache-Control': 'public, max-age=3600'
            }
          })
        }
      } catch (e) {}
    }

    // Default favicon
    const defaultFavicon = await readFile(
      path.join(process.cwd(), 'app', 'favicon.ico')
    )
    return new Response(defaultFavicon, {
      headers: { 'Content-Type': 'image/x-icon' }
    })
  }
  ```

- [ ] Apply same changes to `app/apple-icon.js`

### Phase 4: Update Middleware/Cookie

- [ ] Modify `proxy.js` to include CDN URL in branding cookie:

  ```javascript
  // In proxy.js domain lookup response handling
  const branding = {
    ...lookupData.data.branding,
    faviconCdnUrl: lookupData.data.branding.faviconCdnUrl ||
      `${CDN_BASE_URL}/favicon/${lookupData.data.agencyId}.png`
  }
  ```

### Phase 5: Cache Purge Integration

- [ ] Create cache purge utility:

  ```javascript
  // lib/cdnPurge.js
  export async function purgeFaviconCache(agencyId) {
    const purgeEndpoint = process.env.CDN_PURGE_ENDPOINT
    const apiKey = process.env.CDN_PURGE_API_KEY

    if (!purgeEndpoint || !apiKey) {
      console.warn('[CDN] Purge not configured')
      return false
    }

    try {
      const response = await fetch(purgeEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          urls: [
            `${CDN_BASE_URL}/favicon/${agencyId}.png`,
            `${CDN_BASE_URL}/favicon/${agencyId}.ico`,
            `${CDN_BASE_URL}/apple-icon/${agencyId}.png`
          ]
        })
      })

      return response.ok
    } catch (e) {
      console.error('[CDN] Purge failed:', e)
      return false
    }
  }
  ```

- [ ] Integrate purge into branding update flow (backend or API route)

### Phase 6: Logo CDN (Optional)

- [ ] Apply same pattern to logo assets if needed:
  - `${CDN_BASE_URL}/logo/${agencyId}.png`
  - Update `AppLogo.js` component

---

## Implementation Steps

### Step 1: Create CDN Configuration

1. Create `lib/cdn.js`:
   ```javascript
   export const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || null

   export function getCdnFaviconUrl(agencyId) {
     if (!CDN_BASE_URL || !agencyId) return null
     return `${CDN_BASE_URL}/favicon/${agencyId}.png`
   }

   export function getCdnAppleIconUrl(agencyId) {
     if (!CDN_BASE_URL || !agencyId) return null
     return `${CDN_BASE_URL}/apple-icon/${agencyId}.png`
   }

   export function getCdnLogoUrl(agencyId) {
     if (!CDN_BASE_URL || !agencyId) return null
     return `${CDN_BASE_URL}/logo/${agencyId}.png`
   }
   ```

2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CDN_BASE_URL=https://cdn.assignx.ai
   ```

3. Validate: Run build to ensure env vars are accessible

### Step 2: Update Icon Routes

1. Modify `app/icon.js` with CDN redirect logic
2. Modify `app/apple-icon.js` with CDN redirect logic
3. Test locally with CDN URL logging
4. Validate: Curl `/icon` and check for redirect header

### Step 3: Backend Integration

1. Update favicon upload to use CDN-origin bucket
2. Store CDN URL in branding record
3. Implement cache purge on update
4. Validate: Upload new favicon, verify CDN serves it

### Step 4: Middleware Update

1. Modify `proxy.js` to include CDN URLs in cookie
2. Validate: Check cookie contents on custom domain

### Step 5: End-to-End Testing

1. Test on staging with real CDN
2. Validate cache headers
3. Test cache purge flow
4. Monitor CDN analytics

---

## Success Criteria

- [ ] Favicon requests redirect to CDN URL (302 response)
- [ ] CDN cache-hit rate > 95% for favicon requests
- [ ] Favicon loads in < 50ms from edge
- [ ] Cache purge triggers within 60 seconds of branding update
- [ ] Fallback to S3 works if CDN unavailable
- [ ] Default favicon serves correctly without branding

---

## Troubleshooting

### CDN not serving correct favicon

1. Check cookie contains `agencyId`
2. Verify CDN URL is correct: `${CDN_BASE_URL}/favicon/{agencyId}.png`
3. Check CDN origin is configured correctly
4. Verify S3 bucket has the favicon

### Cache not invalidating

1. Check purge API credentials
2. Verify purge endpoint URL
3. Check purge response for errors
4. Manually purge via CDN dashboard

### Redirect loop

1. Ensure CDN origin doesn't redirect
2. Check `icon.js` logic for infinite redirect conditions
3. Verify CDN is not returning to Next.js origin for favicon path

### Mixed content warnings

1. Ensure CDN serves over HTTPS
2. Check `CDN_BASE_URL` uses `https://`
3. Verify SSL certificate on CDN domain

---

## Rollback Plan

If CDN integration causes issues:

1. Set `NEXT_PUBLIC_CDN_BASE_URL=` (empty)
2. Routes will fall back to S3 fetch behavior
3. No code changes required
4. Monitor and investigate before re-enabling
