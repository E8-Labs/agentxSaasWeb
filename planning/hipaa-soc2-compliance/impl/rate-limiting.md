---
Document: Rate Limiting Implementation Guide
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Rate Limiting Implementation Guide

[← Back to Index](../index.md)

## Overview

This guide explains how to implement rate limiting for API endpoints to prevent abuse and brute force attacks.

## Prerequisites

- Upstash account (or Redis instance)
- Next.js middleware configured

## Step 1: Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

## Step 2: Configure Upstash

Get credentials from Upstash dashboard:

```env
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

## Step 3: Create Rate Limiter

Create `middleware/rateLimit.js`:

```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Auth endpoints: 10 requests per 15 minutes
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  prefix: 'ratelimit:auth',
});

// Standard API: 100 requests per minute
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
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
      ...(!success && {
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      }),
    },
  };
}
```

## Step 4: Update Middleware

Update `middleware.js`:

```javascript
import { NextResponse } from 'next/server';
import { authLimiter, apiLimiter, checkRateLimit } from './middleware/rateLimit';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Rate limit auth endpoints
  if (pathname.startsWith('/api/auth')) {
    const { success, headers } = await checkRateLimit(authLimiter, ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...headers } }
      );
    }
  }

  // Rate limit other API endpoints
  if (pathname.startsWith('/api/')) {
    const { success, headers } = await checkRateLimit(apiLimiter, ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...headers } }
      );
    }
  }

  return NextResponse.next();
}
```

## Step 5: Test Rate Limiting

```bash
# Test auth rate limit (should get 429 after 10 requests)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone": "1234567890"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.1
done
```

## Rate Limit Tiers

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Auth | 10 | 15 min |
| Password Reset | 3 | 1 hour |
| Standard API | 100 | 1 min |
| Bulk Operations | 10 | 1 min |
| Admin | 50 | 1 min |

## Related Documents

- [Phase 1: Critical Security Fixes](../todo/phase-1-critical-security-fixes.md)
- [Phase 5: API Security](../todo/phase-5-api-security.md)
