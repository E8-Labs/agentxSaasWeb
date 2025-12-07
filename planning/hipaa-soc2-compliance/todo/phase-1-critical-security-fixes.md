---
Document: Phase 1 - Critical Security Fixes
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Phase 1: Critical Security Fixes

[← Back to Index](../index.md) | [Implementation Plan](../IMPLEMENTATION-PLAN.md)

## Context

This phase addresses the most critical security vulnerabilities that pose immediate risk to the application and must be resolved before any other compliance work can proceed. These issues could lead to data breaches, credential theft, or compliance violations if left unaddressed.

## Prerequisites

- [ ] Access to environment variable configuration (Vercel/hosting provider)
- [ ] Access to codebase with write permissions
- [ ] Development environment set up
- [ ] Understanding of Next.js middleware

## References

- [Architecture Document](../ARCHITECTURE.md)
- [Rate Limiting Implementation Guide](../impl/rate-limiting.md)
- [Security Headers Implementation Guide](../impl/security-headers.md)
- [Main Compliance Checklist](/hipaa-soc2-compliance-checklist.md)

## Current State

### Issue 1: GHL Client Secret in Public Environment Variables

**Location**: `app/api/ghl/exchange/route.js:107-108`

```javascript
// CURRENT (INSECURE)
const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_GHL_CLIENT_SECRET; // EXPOSED!
```

**Risk**: Anyone can view source and use these credentials to make OAuth requests as the application.

### Issue 2: User Data in Plain Cookies

**Location**: `middleware.js:97-118`

```javascript
// CURRENT (INSECURE)
const userCookie = request.cookies.get('User');
if (userCookie) {
  user = JSON.parse(decodeURIComponent(userCookie.value));
  // Contains: id, userRole, userType, agencyTeammember
}
```

**Risk**: XSS attacks can steal user identity and session information.

### Issue 3: Sensitive Data Logged to Console

**Locations**:
- `app/api/ghl/exchange/route.js:124-126` - Logs OAuth tokens
- `middleware.js` - Logs user data and paths
- Multiple API routes - Various sensitive logging

**Risk**: Logs may be stored, shared, or accessed by unauthorized parties.

### Issue 4: No Rate Limiting

**Location**: All API routes

**Risk**: Brute force attacks can compromise accounts, denial of service possible.

### Issue 5: Missing Security Headers

**Location**: `next.config.mjs`

**Risk**: Clickjacking, XSS, and other client-side attacks.

---

## What to Implement

### Task 1: Move GHL_CLIENT_SECRET to Server-Only Environment

- [ ] Create new environment variable `GHL_CLIENT_SECRET` (no NEXT_PUBLIC_ prefix)
- [ ] Update `app/api/ghl/exchange/route.js` to use server-only variable
- [ ] Remove `NEXT_PUBLIC_GHL_CLIENT_SECRET` from all environments
- [ ] Rotate the GHL client secret (old one is compromised)
- [ ] Update any documentation referencing the environment variable

### Task 2: Remove User Data from Plain Cookies

- [ ] Create server-side session storage mechanism
- [ ] Replace plain `User` cookie with session reference
- [ ] Update middleware to retrieve user from session
- [ ] Make `agencyId` cookie httpOnly
- [ ] Remove any other sensitive data from client-accessible cookies

### Task 3: Remove Sensitive Data from Console Logs

- [ ] Audit all files for console.log statements
- [ ] Remove or sanitize logs containing tokens, credentials, user data
- [ ] Create logging utility that auto-sanitizes sensitive fields
- [ ] Add lint rule to prevent sensitive console.log

### Task 4: Add Rate Limiting to Auth Endpoints

- [ ] Install rate limiting package (Upstash or similar)
- [ ] Create rate limiting middleware
- [ ] Apply to authentication endpoints
- [ ] Configure appropriate limits
- [ ] Add Retry-After headers to rate limit responses

### Task 5: Add Security Headers

- [ ] Configure CSP header
- [ ] Add HSTS header
- [ ] Add X-Frame-Options
- [ ] Add X-Content-Type-Options
- [ ] Add Referrer-Policy
- [ ] Test headers don't break functionality

---

## Implementation Steps

### Step 1: Move GHL Client Secret

**File**: `app/api/ghl/exchange/route.js`

```javascript
// BEFORE
const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_GHL_CLIENT_SECRET;

// AFTER
const clientId = process.env.GHL_CLIENT_ID; // Can stay public or make private
const clientSecret = process.env.GHL_CLIENT_SECRET; // Server-only!

// Add validation
if (!clientSecret) {
  console.error('GHL_CLIENT_SECRET not configured');
  return NextResponse.json(
    { error: 'OAuth configuration error' },
    { status: 500 }
  );
}
```

**Environment Setup**:

```bash
# Add to server environment (Vercel, etc.)
GHL_CLIENT_SECRET=your_rotated_secret

# Remove from .env files (if exists)
# NEXT_PUBLIC_GHL_CLIENT_SECRET should be removed
```

**Validation Command**:
```bash
# Check no NEXT_PUBLIC secrets remain
grep -r "NEXT_PUBLIC.*SECRET" --include="*.js" --include="*.ts"
# Should return no results
```

---

### Step 2: Secure User Cookie

**File**: `middleware.js`

```javascript
// BEFORE: Plain cookie accessible to JavaScript
const userCookie = request.cookies.get('User');
user = JSON.parse(decodeURIComponent(userCookie.value));

// AFTER: Reference to server-side session
const sessionId = request.cookies.get('session_id');
if (sessionId) {
  // Validate session server-side
  const session = await validateSession(sessionId.value);
  if (session) {
    user = session.user;
  }
}
```

**New File**: `lib/session.js`

```javascript
import { SignJWT, jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession(userData) {
  const token = await new SignJWT({
    userId: userData.id,
    userRole: userData.userRole,
    userType: userData.userType,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m') // Short-lived for security
    .setIssuedAt()
    .sign(secretKey);

  return token;
}

export async function validateSession(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}
```

**Cookie Configuration**:

```javascript
// When setting session cookie
const response = NextResponse.next();
response.cookies.set('session_id', sessionToken, {
  httpOnly: true,        // Not accessible to JavaScript
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',    // CSRF protection
  maxAge: 60 * 15,       // 15 minutes
  path: '/',
});
```

**Validation Command**:
```bash
# Check cookies in browser DevTools
# Session cookies should show:
# - HttpOnly: true
# - Secure: true (in production)
# - SameSite: Strict
```

---

### Step 3: Remove Sensitive Console Logs

**Audit Script** (run to find all console.log):

```bash
# Find all console.log statements
grep -rn "console\.log" --include="*.js" --include="*.ts" app/ components/ lib/ utilities/ services/

# Look specifically for sensitive patterns
grep -rn "console\.log.*token" --include="*.js" -i
grep -rn "console\.log.*secret" --include="*.js" -i
grep -rn "console\.log.*password" --include="*.js" -i
grep -rn "console\.log.*user" --include="*.js" -i
```

**Files to Clean**:

1. `app/api/ghl/exchange/route.js`
```javascript
// REMOVE these lines (around lines 80-126):
console.log('Trigered the Exchange token file');
console.log('GHL Token Exchange Response Body:', JSON.stringify(json, null, 2));
console.log('Location ID from token response:', locationId);
```

2. `middleware.js`
```javascript
// REMOVE or sanitize:
console.log('User data is', user);
console.log('not found user');
// etc.
```

**Create Sanitizing Logger** (`lib/logger.js`):

```javascript
const SENSITIVE_FIELDS = [
  'token',
  'accessToken',
  'refreshToken',
  'password',
  'secret',
  'authorization',
  'cookie',
  'ssn',
  'creditCard',
];

function sanitize(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  return sanitized;
}

export function secureLog(message, data) {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data ? sanitize(data) : '');
  }
  // In production, send to structured logging service
}
```

**ESLint Rule** (`.eslintrc.js`):

```javascript
module.exports = {
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
};
```

**Validation Command**:
```bash
# After cleanup, verify no sensitive logs remain
grep -rn "console\.log.*token\|secret\|password" --include="*.js" -i
# Should return no results
```

---

### Step 4: Add Rate Limiting

**Install Dependencies**:

```bash
npm install @upstash/ratelimit @upstash/redis
```

**New File**: `middleware/rateLimit.js`

```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Rate limiters for different endpoints
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 requests per 15 minutes
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
});

export async function checkRateLimit(limiter, identifier) {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
      ...(success ? {} : { 'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString() }),
    },
  };
}
```

**Update**: `middleware.js`

```javascript
import { authRateLimiter, apiRateLimiter, checkRateLimit } from './middleware/rateLimit';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get identifier (IP address or user ID if authenticated)
  const identifier = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';

  // Apply rate limiting to auth endpoints
  if (pathname.startsWith('/api/auth')) {
    const { success, headers } = await checkRateLimit(authRateLimiter, identifier);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );
    }
  }

  // Apply general rate limiting to other API endpoints
  if (pathname.startsWith('/api/')) {
    const { success, headers } = await checkRateLimit(apiRateLimiter, identifier);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );
    }
  }

  // Continue with existing middleware logic...
}
```

**Validation Command**:
```bash
# Test rate limiting (should get 429 after 10 requests)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone": "1234567890"}' \
    -w "\nStatus: %{http_code}\n"
done
```

---

### Step 5: Add Security Headers

**Update**: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com https://*.sentry.io",
              "frame-src 'self' https://js.stripe.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // Embed routes need different frame policy
        source: '/embed/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
  // ... rest of config
};

export default nextConfig;
```

**Validation Command**:
```bash
# Check headers are present
curl -I https://your-domain.com/ 2>/dev/null | grep -E "(Strict-Transport|X-Content-Type|X-Frame|X-XSS|Referrer-Policy|Content-Security)"

# Expected output:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# Content-Security-Policy: ...
```

---

## Success Criteria

- [ ] `grep -r "NEXT_PUBLIC.*SECRET"` returns no results
- [ ] Browser DevTools shows `User` cookie is httpOnly (or removed)
- [ ] `grep -rn "console\.log.*token\|secret\|password"` returns no results
- [ ] Auth endpoint returns 429 after 10 rapid requests
- [ ] `curl -I` shows all security headers present
- [ ] Application functions normally after changes
- [ ] All tests pass

## Troubleshooting

### Issue: GHL OAuth stops working after secret change

**Solution**:
1. Verify the new secret is correctly set in environment
2. Check the secret was rotated in GHL dashboard
3. Ensure no trailing whitespace in environment variable

### Issue: Users getting logged out after cookie changes

**Solution**:
1. Clear all old cookies for users (they'll need to re-login)
2. Announce maintenance window for session migration
3. Verify session validation is working correctly

### Issue: Rate limiting blocking legitimate users

**Solution**:
1. Review rate limit thresholds
2. Consider higher limits initially, then reduce
3. Implement bypass for known good IPs (carefully)
4. Add monitoring for rate limit hits

### Issue: CSP blocking required resources

**Solution**:
1. Check browser console for CSP violations
2. Add necessary domains to CSP directives
3. Test all functionality after CSP changes

---

## Rollback Plan

If critical issues arise:

1. **Environment Variables**: Revert to previous values in hosting provider
2. **Cookie Changes**: Deploy previous middleware.js version
3. **Rate Limiting**: Set limits to very high values or disable in middleware
4. **Security Headers**: Remove headers section from next.config.mjs

---

## Next Steps

After completing Phase 1:
1. Verify all success criteria are met
2. Update [Implementation Status](../implementation-status.md)
3. Proceed to [Phase 2: Authentication & Session Security](./phase-2-authentication-session.md)

---

## Related Documents

- [Index](../index.md)
- [Architecture](../ARCHITECTURE.md)
- [Rate Limiting Guide](../impl/rate-limiting.md)
- [Security Headers Guide](../impl/security-headers.md)
