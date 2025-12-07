---
Document: Session Management Implementation Guide
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Session Management Implementation Guide

[← Back to Index](../index.md)

## Overview

This guide covers implementing secure session management with JWT tokens, proper timeouts, and httpOnly cookies.

## Prerequisites

- jose library for JWT handling
- Environment variable for session secret

## Step 1: Install Dependencies

```bash
npm install jose
```

## Step 2: Configure Environment

```env
SESSION_SECRET=your_64_character_random_secret_here
```

Generate secret:
```bash
openssl rand -hex 32
```

## Step 3: Create Session Service

Create `services/sessionService.js`:

```javascript
import { SignJWT, jwtVerify } from 'jose';

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const ABSOLUTE_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours

export async function createSession(user, metadata = {}) {
  const payload = {
    userId: user.id,
    userRole: user.userRole,
    userType: user.userType,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${ABSOLUTE_TIMEOUT / 1000}s`)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .sign(SESSION_SECRET);

  return { token, expiresAt: Date.now() + ABSOLUTE_TIMEOUT };
}

export async function validateSession(token) {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);

    // Check idle timeout
    if (Date.now() - payload.lastActivity > IDLE_TIMEOUT) {
      return { valid: false, reason: 'idle_timeout' };
    }

    // Check absolute timeout
    if (Date.now() - payload.createdAt > ABSOLUTE_TIMEOUT) {
      return { valid: false, reason: 'absolute_timeout' };
    }

    return {
      valid: true,
      session: payload,
      needsRefresh: Date.now() - payload.lastActivity > IDLE_TIMEOUT / 2,
    };
  } catch {
    return { valid: false, reason: 'invalid_token' };
  }
}

export async function refreshSession(payload) {
  const refreshed = { ...payload, lastActivity: Date.now() };

  return await new SignJWT(refreshed)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${ABSOLUTE_TIMEOUT / 1000}s`)
    .setIssuedAt()
    .setJti(payload.jti)
    .sign(SESSION_SECRET);
}

export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(expiresAt),
    path: '/',
  });
}

export function clearSessionCookie(response) {
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}
```

## Step 4: Update Login Route

```javascript
import { createSession, setSessionCookie } from '@/services/sessionService';

export async function POST(request) {
  const { phone, code } = await request.json();

  // Verify credentials
  const user = await verifyUser(phone, code);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Create session
  const { token, expiresAt } = await createSession(user, {
    ip: request.ip,
    userAgent: request.headers.get('user-agent'),
  });

  const response = NextResponse.json({ success: true });
  setSessionCookie(response, token, expiresAt);

  return response;
}
```

## Step 5: Update Middleware

```javascript
import { validateSession, refreshSession, setSessionCookie } from '@/services/sessionService';

export async function middleware(request) {
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    return redirectToLogin(request);
  }

  const { valid, session, needsRefresh, reason } = await validateSession(sessionToken);

  if (!valid) {
    return redirectToLogin(request, reason);
  }

  const response = NextResponse.next();

  if (needsRefresh) {
    const newToken = await refreshSession(session);
    setSessionCookie(response, newToken, Date.now() + 12 * 60 * 60 * 1000);
  }

  return response;
}
```

## Session Security Checklist

- [x] httpOnly cookies
- [x] Secure flag in production
- [x] SameSite=Strict
- [x] 15-minute idle timeout
- [x] 12-hour absolute timeout
- [x] Session refresh on activity
- [x] Secure logout clears cookie

## Related Documents

- [Phase 2: Authentication](../todo/phase-2-authentication-session.md)
- [Architecture](../ARCHITECTURE.md)
