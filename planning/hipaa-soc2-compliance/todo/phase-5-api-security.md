---
Document: Phase 5 - API Security Hardening
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Phase 5: API Security Hardening

[← Back to Index](../index.md) | [Implementation Plan](../IMPLEMENTATION-PLAN.md)

## Context

This phase hardens all API endpoints against common attacks through comprehensive rate limiting, input validation, and CORS configuration. These controls are essential for SOC-2 compliance (CC6.6, CC7.2) and protect against OWASP Top 10 vulnerabilities.

## Prerequisites

- [ ] Phase 1-4 completed
- [ ] Rate limiting infrastructure from Phase 1 operational
- [ ] Audit logging from Phase 3 capturing API events

## References

- [Architecture Document](../ARCHITECTURE.md)
- [Rate Limiting Guide](../impl/rate-limiting.md)
- [Input Validation Guide](../impl/input-validation.md)
- OWASP API Security Top 10

## Current State

### What Exists
- Basic rate limiting on auth endpoints (Phase 1)
- Some input validation in forms

### What's Missing
- Comprehensive rate limiting tiers
- Schema validation on all API routes
- Proper CORS configuration
- Request signing for sensitive operations
- API versioning

---

## What to Implement

### Task 1: Comprehensive Rate Limiting

- [ ] Define rate limit tiers for all endpoint types
- [ ] Implement per-user rate limiting
- [ ] Add burst protection
- [ ] Configure rate limit headers
- [ ] Create rate limit bypass for trusted IPs

### Task 2: Input Validation with Zod

- [ ] Install and configure Zod
- [ ] Create validation schemas for all API inputs
- [ ] Implement validation middleware
- [ ] Add sanitization for XSS prevention
- [ ] Create error response format

### Task 3: CORS Configuration

- [ ] Define allowed origins
- [ ] Configure preflight handling
- [ ] Set appropriate headers
- [ ] Handle credentials correctly

### Task 4: Request Signing

- [ ] Implement HMAC signing for sensitive endpoints
- [ ] Create signature verification middleware
- [ ] Add timestamp validation (prevent replay)
- [ ] Document signing process for clients

### Task 5: Security Testing

- [ ] Run OWASP ZAP scan
- [ ] Perform API fuzzing
- [ ] Test rate limiting effectiveness
- [ ] Verify input validation coverage

---

## Implementation Steps

### Step 1: Comprehensive Rate Limiting

**Update**: `middleware/rateLimit.js`

```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { auditSecurity } from '@/services/auditService';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Rate limit tiers
 */
export const RateLimitTier = {
  // Authentication - very strict
  AUTH: {
    name: 'auth',
    requests: 10,
    window: '15 m',
    limiter: Ratelimit.slidingWindow(10, '15 m'),
  },

  // Password/code reset - stricter
  RESET: {
    name: 'reset',
    requests: 3,
    window: '1 h',
    limiter: Ratelimit.slidingWindow(3, '1 h'),
  },

  // Standard API - moderate
  STANDARD: {
    name: 'standard',
    requests: 100,
    window: '1 m',
    limiter: Ratelimit.slidingWindow(100, '1 m'),
  },

  // Bulk operations - strict
  BULK: {
    name: 'bulk',
    requests: 10,
    window: '1 m',
    limiter: Ratelimit.slidingWindow(10, '1 m'),
  },

  // Admin operations - moderate
  ADMIN: {
    name: 'admin',
    requests: 50,
    window: '1 m',
    limiter: Ratelimit.slidingWindow(50, '1 m'),
  },

  // Search/read heavy - higher
  READ: {
    name: 'read',
    requests: 200,
    window: '1 m',
    limiter: Ratelimit.slidingWindow(200, '1 m'),
  },

  // Webhook receivers - high
  WEBHOOK: {
    name: 'webhook',
    requests: 1000,
    window: '1 m',
    limiter: Ratelimit.slidingWindow(1000, '1 m'),
  },
};

/**
 * Route to tier mapping
 */
const routeTierMap = {
  '/api/auth/login': RateLimitTier.AUTH,
  '/api/auth/send-code': RateLimitTier.AUTH,
  '/api/auth/reset-password': RateLimitTier.RESET,
  '/api/auth/mfa': RateLimitTier.AUTH,

  '/api/admin': RateLimitTier.ADMIN,

  '/api/leads/bulk': RateLimitTier.BULK,
  '/api/leads/export': RateLimitTier.BULK,

  '/api/leads': RateLimitTier.STANDARD,
  '/api/agents': RateLimitTier.STANDARD,
  '/api/pipeline': RateLimitTier.STANDARD,

  '/api/search': RateLimitTier.READ,

  '/api/webhooks': RateLimitTier.WEBHOOK,
};

/**
 * Get appropriate tier for a route
 */
function getTierForRoute(pathname) {
  // Check exact match first
  if (routeTierMap[pathname]) {
    return routeTierMap[pathname];
  }

  // Check prefix match
  for (const [route, tier] of Object.entries(routeTierMap)) {
    if (pathname.startsWith(route)) {
      return tier;
    }
  }

  // Default to standard
  return RateLimitTier.STANDARD;
}

/**
 * Create rate limiter for tier
 */
function createLimiter(tier) {
  return new Ratelimit({
    redis,
    limiter: tier.limiter,
    analytics: true,
    prefix: `ratelimit:${tier.name}`,
  });
}

// Cache limiters
const limiterCache = new Map();

function getLimiter(tier) {
  if (!limiterCache.has(tier.name)) {
    limiterCache.set(tier.name, createLimiter(tier));
  }
  return limiterCache.get(tier.name);
}

/**
 * Trusted IPs that bypass rate limiting (e.g., health checks)
 */
const trustedIPs = new Set(
  (process.env.TRUSTED_IPS || '').split(',').filter(Boolean)
);

/**
 * Rate limit middleware
 */
export async function rateLimitMiddleware(request) {
  const { pathname } = request.nextUrl;

  // Get client identifier
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userId = request.headers.get('x-user-id'); // Set by session middleware

  // Trusted IPs bypass rate limiting
  if (trustedIPs.has(ip)) {
    return { success: true, headers: {} };
  }

  // Use user ID if available, otherwise IP
  const identifier = userId || ip;

  // Get appropriate tier
  const tier = getTierForRoute(pathname);
  const limiter = getLimiter(tier);

  // Check rate limit
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  // Build rate limit headers
  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
    'X-RateLimit-Tier': tier.name,
  };

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    headers['Retry-After'] = retryAfter.toString();

    // Log rate limit hit
    await auditSecurity.rateLimit({
      ip,
      userId,
      path: pathname,
      metadata: {
        tier: tier.name,
        limit: tier.requests,
        window: tier.window,
      },
    });
  }

  return { success, headers };
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(headers) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: parseInt(headers['Retry-After'] || '60'),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}
```

---

### Step 2: Input Validation with Zod

**Install Dependencies**:

```bash
npm install zod
```

**New File**: `lib/validation/index.js`

```javascript
import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID
  uuid: z.string().uuid(),

  // Email
  email: z.string().email().toLowerCase().trim(),

  // Phone number (E.164 format)
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  // URL
  url: z.string().url(),

  // Date (ISO 8601)
  date: z.string().datetime(),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // Sort
  sort: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
};

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Create a sanitized string schema
 */
export const sanitizedString = z.string().transform(sanitizeString);

/**
 * Validation middleware factory
 */
export function createValidator(schema) {
  return async (request) => {
    let data;

    // Parse body based on content type
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      // Try JSON as default
      try {
        data = await request.json();
      } catch {
        data = {};
      }
    }

    // Merge with query params for GET requests
    if (request.method === 'GET') {
      const params = Object.fromEntries(request.nextUrl.searchParams);
      data = { ...data, ...params };
    }

    // Validate
    const result = schema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: formatZodError(result.error),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  };
}

/**
 * Format Zod error for API response
 */
export function formatZodError(error) {
  return {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
}
```

**New File**: `lib/validation/schemas/auth.js`

```javascript
import { z } from 'zod';
import { commonSchemas } from '../index';

/**
 * Login request schema
 */
export const loginSchema = z.object({
  phone: commonSchemas.phone,
});

/**
 * Verify code schema
 */
export const verifyCodeSchema = z.object({
  phone: commonSchemas.phone,
  code: z.string().length(6).regex(/^\d+$/, 'Code must be numeric'),
});

/**
 * MFA setup schema
 */
export const mfaSetupSchema = z.object({
  // No input required
});

/**
 * MFA verify schema
 */
export const mfaVerifySchema = z.object({
  code: z.string().length(6).regex(/^\d+$/, 'Code must be numeric'),
  isRecoveryCode: z.boolean().optional(),
});
```

**New File**: `lib/validation/schemas/leads.js`

```javascript
import { z } from 'zod';
import { commonSchemas, sanitizedString } from '../index';

/**
 * Create lead schema
 */
export const createLeadSchema = z.object({
  name: sanitizedString.min(1).max(255),
  email: commonSchemas.email.optional(),
  phone: commonSchemas.phone.optional(),
  company: sanitizedString.max(255).optional(),
  source: z.enum(['website', 'referral', 'ads', 'manual', 'import']).optional(),
  notes: sanitizedString.max(5000).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

/**
 * Update lead schema
 */
export const updateLeadSchema = createLeadSchema.partial();

/**
 * Lead query schema
 */
export const leadQuerySchema = z.object({
  ...commonSchemas.pagination.shape,
  search: sanitizedString.max(100).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  source: z.string().optional(),
  assignedTo: commonSchemas.uuid.optional(),
  createdAfter: commonSchemas.date.optional(),
  createdBefore: commonSchemas.date.optional(),
});

/**
 * Bulk lead import schema
 */
export const bulkImportSchema = z.object({
  leads: z.array(createLeadSchema).min(1).max(1000),
  skipDuplicates: z.boolean().default(true),
  assignTo: commonSchemas.uuid.optional(),
});
```

**Example API Route with Validation**:

```javascript
// app/api/leads/route.js
import { NextResponse } from 'next/server';
import { createValidator } from '@/lib/validation';
import { createLeadSchema, leadQuerySchema } from '@/lib/validation/schemas/leads';

const validateCreate = createValidator(createLeadSchema);
const validateQuery = createValidator(leadQuerySchema);

export async function POST(request) {
  // Validate input
  const validation = await validateCreate(request);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { data } = validation;

  // Proceed with validated data
  // ...
}

export async function GET(request) {
  // Validate query params
  const validation = await validateQuery(request);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { data } = validation;
  const { page, limit, search, status } = data;

  // Proceed with validated query
  // ...
}
```

---

### Step 3: CORS Configuration

**Update**: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Allowed origins for CORS
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://app.assignx.com',
      'https://staging.assignx.com',
    ].filter(Boolean);

    return [
      {
        // API routes - strict CORS
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(','),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-CSRF-Token, X-Request-ID',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
      {
        // Webhook endpoints - no CORS (server-to-server)
        source: '/api/webhooks/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Webhooks can come from anywhere
          },
        ],
      },
      {
        // Embed endpoints - wide CORS for embedding
        source: '/embed/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**CORS Middleware** (`middleware/cors.js`):

```javascript
import { NextResponse } from 'next/server';

const allowedOrigins = new Set([
  process.env.NEXT_PUBLIC_APP_URL,
  'https://app.assignx.com',
  'https://staging.assignx.com',
].filter(Boolean));

export function corsMiddleware(request) {
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  // Check if origin is allowed
  if (origin && allowedOrigins.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return response;
}
```

---

### Step 4: Request Signing

**New File**: `lib/signing/index.js`

```javascript
import crypto from 'crypto';

const SIGNING_SECRET = process.env.API_SIGNING_SECRET;
const TIMESTAMP_TOLERANCE = 5 * 60 * 1000; // 5 minutes

/**
 * Create request signature
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {object} body - Request body
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - HMAC signature
 */
export function createSignature(method, path, body, timestamp) {
  const payload = [
    method.toUpperCase(),
    path,
    timestamp.toString(),
    body ? JSON.stringify(body) : '',
  ].join('\n');

  return crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Verify request signature
 * @param {Request} request - Incoming request
 * @returns {object} - { valid: boolean, error?: string }
 */
export async function verifySignature(request) {
  const signature = request.headers.get('x-signature');
  const timestamp = request.headers.get('x-timestamp');

  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing signature headers' };
  }

  // Check timestamp is within tolerance (prevent replay attacks)
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();

  if (Math.abs(now - requestTime) > TIMESTAMP_TOLERANCE) {
    return { valid: false, error: 'Request timestamp expired' };
  }

  // Get request body
  const body = request.method !== 'GET' ? await request.clone().json() : null;

  // Calculate expected signature
  const expectedSignature = createSignature(
    request.method,
    request.nextUrl.pathname,
    body,
    requestTime
  );

  // Constant-time comparison
  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  return { valid };
}

/**
 * Middleware for signed requests
 */
export async function signedRequestMiddleware(request) {
  const { valid, error } = await verifySignature(request);

  if (!valid) {
    return new Response(
      JSON.stringify({ error: error || 'Invalid signature' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null; // Continue processing
}
```

**Client-side signing example**:

```javascript
// lib/api-client.js
import crypto from 'crypto-browserify'; // Or use Web Crypto API

const SIGNING_SECRET = process.env.NEXT_PUBLIC_API_SIGNING_SECRET;

export async function signedRequest(url, options = {}) {
  const timestamp = Date.now();
  const method = options.method || 'GET';
  const path = new URL(url).pathname;
  const body = options.body ? JSON.parse(options.body) : null;

  // Create signature
  const payload = [
    method.toUpperCase(),
    path,
    timestamp.toString(),
    body ? JSON.stringify(body) : '',
  ].join('\n');

  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(payload)
    .digest('hex');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-signature': signature,
      'x-timestamp': timestamp.toString(),
    },
  });
}
```

---

### Step 5: Security Testing Configuration

**New File**: `security/zap-config.yaml`

```yaml
# OWASP ZAP configuration for API scanning
env:
  contexts:
    - name: "AssignX API"
      urls:
        - "https://staging.assignx.com/api"
      includePaths:
        - "https://staging.assignx.com/api/.*"
      excludePaths:
        - "https://staging.assignx.com/api/webhooks/.*"
      authentication:
        method: "httpAuthentication"
        parameters:
          loginUrl: "https://staging.assignx.com/api/auth/login"
          loginRequestBody: '{"phone": "${username}"}'

jobs:
  - type: spider
    parameters:
      context: "AssignX API"
      maxDuration: 10

  - type: activeScan
    parameters:
      context: "AssignX API"
      maxRuleDurationInMins: 5
      maxScanDurationInMins: 60

  - type: report
    parameters:
      template: "traditional-json"
      reportFile: "zap-report.json"
```

**Test Script** (`scripts/security-test.sh`):

```bash
#!/bin/bash

# Run OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t https://staging.assignx.com/api/openapi.json \
  -f openapi \
  -r zap-report.html

# Run npm audit
npm audit --production

# Run Snyk scan
npx snyk test

# Check for secrets in code
npx secretlint "**/*"

echo "Security testing complete. Review reports."
```

---

## Success Criteria

- [ ] All API routes have appropriate rate limiting
- [ ] Rate limit headers present on all responses
- [ ] All API inputs validated with Zod schemas
- [ ] Validation errors return consistent format
- [ ] CORS configured for allowed origins only
- [ ] Sensitive endpoints require request signing
- [ ] OWASP ZAP scan shows no high/critical issues
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] All tests pass

## Troubleshooting

### Issue: Rate limiting too aggressive

**Solution**:
1. Review rate limit tiers
2. Increase limits for affected routes
3. Add monitoring for rate limit hits

### Issue: Validation rejecting valid requests

**Solution**:
1. Review schema against actual request format
2. Check for edge cases (empty strings, nulls)
3. Add proper coercion/defaults

### Issue: CORS blocking legitimate requests

**Solution**:
1. Verify origin is in allowed list
2. Check preflight handling
3. Verify credentials configuration

---

## Next Steps

After completing Phase 5:
1. Verify all success criteria are met
2. Update [Implementation Status](../implementation-status.md)
3. Proceed to [Phase 6: Vendor Management & Documentation](./phase-6-vendor-documentation.md)

---

## Related Documents

- [Index](../index.md)
- [Rate Limiting Guide](../impl/rate-limiting.md)
- [Input Validation Guide](../impl/input-validation.md)
- [Phase 4](./phase-4-data-protection.md)
- [Phase 6](./phase-6-vendor-documentation.md)
