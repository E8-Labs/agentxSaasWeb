---
Document: Phase 2 - Authentication & Session Security
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Phase 2: Authentication & Session Security

[← Back to Index](../index.md) | [Implementation Plan](../IMPLEMENTATION-PLAN.md)

## Context

This phase establishes secure authentication and session management patterns required for HIPAA and SOC-2 compliance. Proper session handling prevents session hijacking, ensures appropriate timeouts, and prepares the foundation for multi-factor authentication.

## Prerequisites

- [ ] Phase 1 completed (critical security fixes in place)
- [ ] Cookie security implemented from Phase 1
- [ ] Environment variables properly secured
- [ ] Rate limiting operational

## References

- [Architecture Document](../ARCHITECTURE.md)
- [Session Management Guide](../impl/session-management.md)
- [Phase 1 Document](./phase-1-critical-security-fixes.md)

## Current State

### Session Management Issues

**Location**: `middleware.js`, `utilities/AuthHelper.js`

Current problems:
- User data stored in plain cookie (addressed in Phase 1)
- `localStorage` used for tokens (XSS vulnerable)
- No session timeout enforcement
- No CSRF protection
- Token refresh mechanism unclear

### Authentication Flow

Current flow:
1. User enters phone number
2. SMS code sent
3. User enters code
4. Token returned and stored in httpOnly cookie
5. User data stored in plain cookie (INSECURE)

Target flow:
1. User enters phone number (rate limited)
2. SMS code sent (rate limited, expires in 5 min)
3. User enters code
4. MFA challenge if enabled
5. Secure session created with httpOnly cookie
6. Session validated on every request
7. Session expires after 15 min idle / 12 hours absolute

---

## What to Implement

### Task 1: Create Session Service

- [ ] Create `services/sessionService.js`
- [ ] Implement JWT-based session tokens
- [ ] Add session creation, validation, refresh, and revocation
- [ ] Implement session store (Redis or database-backed)
- [ ] Add session metadata tracking (IP, user agent, etc.)

### Task 2: Implement Session Timeout

- [ ] Add 15-minute idle timeout
- [ ] Add 12-hour absolute timeout
- [ ] Implement session refresh on activity
- [ ] Add client-side timeout warning
- [ ] Implement secure logout

### Task 3: Add CSRF Protection

- [ ] Generate CSRF tokens for sessions
- [ ] Validate CSRF on state-changing requests
- [ ] Create middleware for CSRF validation
- [ ] Update forms/API calls to include CSRF token

### Task 4: Create MFA Infrastructure

- [ ] Create MFA enrollment API
- [ ] Create MFA verification API
- [ ] Implement TOTP support
- [ ] Add MFA recovery codes
- [ ] Update login flow for MFA challenge

### Task 5: Update Authentication Components

- [ ] Update `LoginComponent.js` for new flow
- [ ] Create MFA challenge component
- [ ] Add session timeout warning component
- [ ] Update logout to clear all session data

---

## Implementation Steps

### Step 1: Create Session Service

**New File**: `services/sessionService.js`

```javascript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);
const SESSION_NAME = 'session';
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const ABSOLUTE_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Session payload structure
 */
const createSessionPayload = (user, metadata = {}) => ({
  userId: user.id,
  userRole: user.userRole,
  userType: user.userType,
  agencyId: user.agencyId,
  createdAt: Date.now(),
  lastActivity: Date.now(),
  metadata: {
    ip: metadata.ip || 'unknown',
    userAgent: metadata.userAgent || 'unknown',
  },
});

/**
 * Create a new session for a user
 */
export async function createSession(user, metadata = {}) {
  const payload = createSessionPayload(user, metadata);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${ABSOLUTE_TIMEOUT / 1000}s`)
    .setIssuedAt()
    .setJti(crypto.randomUUID()) // Unique session ID
    .sign(SESSION_SECRET);

  return {
    token,
    expiresAt: Date.now() + ABSOLUTE_TIMEOUT,
  };
}

/**
 * Validate and optionally refresh a session
 */
export async function validateSession(token) {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);

    // Check idle timeout
    const idleTime = Date.now() - payload.lastActivity;
    if (idleTime > IDLE_TIMEOUT) {
      return { valid: false, reason: 'idle_timeout' };
    }

    // Check absolute timeout
    const sessionAge = Date.now() - payload.createdAt;
    if (sessionAge > ABSOLUTE_TIMEOUT) {
      return { valid: false, reason: 'absolute_timeout' };
    }

    return {
      valid: true,
      session: payload,
      needsRefresh: idleTime > IDLE_TIMEOUT / 2, // Refresh if > 7.5 min idle
    };
  } catch (error) {
    return { valid: false, reason: 'invalid_token' };
  }
}

/**
 * Refresh session with updated activity timestamp
 */
export async function refreshSession(currentPayload) {
  const refreshedPayload = {
    ...currentPayload,
    lastActivity: Date.now(),
  };

  const token = await new SignJWT(refreshedPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${ABSOLUTE_TIMEOUT / 1000}s`)
    .setIssuedAt()
    .setJti(currentPayload.jti) // Keep same session ID
    .sign(SESSION_SECRET);

  return token;
}

/**
 * Set session cookie
 */
export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(SESSION_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(expiresAt),
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response) {
  response.cookies.set(SESSION_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}

/**
 * Get session from request
 */
export function getSessionFromRequest(request) {
  return request.cookies.get(SESSION_NAME)?.value;
}
```

**Validation Command**:
```javascript
// Test session service
const session = await createSession({ id: '123', userRole: 'user', userType: 'standard' });
console.log('Session created:', session);

const validation = await validateSession(session.token);
console.log('Validation:', validation);
```

---

### Step 2: Update Middleware for Session Handling

**Update**: `middleware.js`

```javascript
import { NextResponse } from 'next/server';
import {
  validateSession,
  refreshSession,
  setSessionCookie,
  getSessionFromRequest,
} from './services/sessionService';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/agency',
  '/api/protected',
];

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/onboarding',
  '/api/auth',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return response;
  }

  // Get and validate session
  const sessionToken = getSessionFromRequest(request);

  if (!sessionToken) {
    return redirectToLogin(request, 'no_session');
  }

  const { valid, session, needsRefresh, reason } = await validateSession(sessionToken);

  if (!valid) {
    return redirectToLogin(request, reason);
  }

  // Refresh session if needed (sliding window)
  if (needsRefresh) {
    const newToken = await refreshSession(session);
    setSessionCookie(response, newToken, Date.now() + 12 * 60 * 60 * 1000);
  }

  // Add session data to request headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('x-user-id', session.userId);
    response.headers.set('x-user-role', session.userRole);
    response.headers.set('x-user-type', session.userType);
  }

  return response;
}

function redirectToLogin(request, reason) {
  const url = new URL('/login', request.url);
  url.searchParams.set('reason', reason);
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

---

### Step 3: Implement CSRF Protection

**New File**: `middleware/csrf.js`

```javascript
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.SESSION_SECRET;

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(sessionId) {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  const data = `${sessionId}:${timestamp}:${random}`;
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(data)
    .digest('hex');
  return `${data}:${signature}`;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token, sessionId) {
  if (!token) return false;

  const parts = token.split(':');
  if (parts.length !== 4) return false;

  const [tokenSessionId, timestamp, random, signature] = parts;

  // Verify session matches
  if (tokenSessionId !== sessionId) return false;

  // Verify signature
  const data = `${tokenSessionId}:${timestamp}:${random}`;
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(data)
    .digest('hex');

  if (signature !== expectedSignature) return false;

  // Verify token is not too old (1 hour max)
  const tokenTime = parseInt(timestamp, 36);
  if (Date.now() - tokenTime > 60 * 60 * 1000) return false;

  return true;
}

/**
 * CSRF middleware for state-changing requests
 */
export function csrfMiddleware(request, sessionId) {
  const method = request.method;

  // Only check state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return { valid: true };
  }

  // Skip CSRF for certain paths (webhooks, etc.)
  const pathname = request.nextUrl.pathname;
  const skipPaths = ['/api/webhooks/', '/api/oauth/'];
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return { valid: true };
  }

  // Get CSRF token from header or body
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const bodyToken = request.body?.csrfToken;
  const token = headerToken || bodyToken;

  if (!validateCSRFToken(token, sessionId)) {
    return {
      valid: false,
      response: new NextResponse(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { valid: true };
}

/**
 * Set CSRF cookie for client-side access
 */
export function setCSRFCookie(response, token) {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}
```

**Client-Side Usage**:

```javascript
// lib/api.js - API client with CSRF support

function getCSRFToken() {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function apiRequest(url, options = {}) {
  const csrfToken = getCSRFToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    credentials: 'include', // Include cookies
  });
}
```

---

### Step 4: Create MFA Infrastructure

**New File**: `services/mfaService.js`

```javascript
import crypto from 'crypto';
import { authenticator } from 'otplib';

// Configure TOTP
authenticator.options = {
  step: 30, // 30-second window
  window: 1, // Allow 1 step before/after
};

/**
 * Generate MFA secret for user enrollment
 */
export function generateMFASecret(userId, appName = 'AssignX') {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(userId, appName, secret);

  return {
    secret,
    otpauthUrl,
    // Generate QR code URL (use a QR library to generate actual image)
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpauthUrl)}&size=200x200`,
  };
}

/**
 * Verify MFA code
 */
export function verifyMFACode(secret, code) {
  return authenticator.verify({ token: code, secret });
}

/**
 * Generate recovery codes
 */
export function generateRecoveryCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Hash recovery code for storage
 */
export function hashRecoveryCode(code) {
  return crypto
    .createHash('sha256')
    .update(code.replace('-', '').toUpperCase())
    .digest('hex');
}

/**
 * Verify recovery code
 */
export function verifyRecoveryCode(code, hashedCodes) {
  const hashed = hashRecoveryCode(code);
  const index = hashedCodes.indexOf(hashed);
  if (index !== -1) {
    // Remove used code
    hashedCodes.splice(index, 1);
    return { valid: true, remainingCodes: hashedCodes };
  }
  return { valid: false };
}
```

**New File**: `app/api/auth/mfa/setup/route.js`

```javascript
import { NextResponse } from 'next/server';
import { generateMFASecret, generateRecoveryCodes, hashRecoveryCode } from '@/services/mfaService';
import { validateSession, getSessionFromRequest } from '@/services/sessionService';

export async function POST(request) {
  // Validate session
  const sessionToken = getSessionFromRequest(request);
  const { valid, session } = await validateSession(sessionToken);

  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Generate MFA secret
    const { secret, otpauthUrl, qrCodeUrl } = generateMFASecret(session.userId);

    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes();
    const hashedRecoveryCodes = recoveryCodes.map(hashRecoveryCode);

    // Store secret and hashed recovery codes in database (pending verification)
    // This should be stored as "pending" until user confirms with a valid code
    await storePendingMFASetup(session.userId, {
      secret,
      recoveryCodes: hashedRecoveryCodes,
    });

    return NextResponse.json({
      qrCodeUrl,
      otpauthUrl, // For manual entry
      recoveryCodes, // Show once to user
      message: 'Scan QR code with authenticator app, then verify with a code',
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup MFA' },
      { status: 500 }
    );
  }
}

// Placeholder - implement based on your database
async function storePendingMFASetup(userId, mfaData) {
  // Store in database with pending status
}
```

**New File**: `app/api/auth/mfa/verify/route.js`

```javascript
import { NextResponse } from 'next/server';
import { verifyMFACode, verifyRecoveryCode } from '@/services/mfaService';
import { validateSession, getSessionFromRequest, createSession, setSessionCookie } from '@/services/sessionService';

export async function POST(request) {
  const body = await request.json();
  const { code, isRecoveryCode = false } = body;

  // Get pending MFA session (created after password auth, before MFA)
  const pendingSession = request.cookies.get('mfa_pending')?.value;

  if (!pendingSession) {
    return NextResponse.json(
      { error: 'No pending MFA challenge' },
      { status: 400 }
    );
  }

  try {
    // Decode pending session
    const { userId, mfaSecret, hashedRecoveryCodes } = JSON.parse(
      Buffer.from(pendingSession, 'base64').toString()
    );

    let isValid = false;

    if (isRecoveryCode) {
      const result = verifyRecoveryCode(code, hashedRecoveryCodes);
      isValid = result.valid;
      if (isValid) {
        // Update remaining recovery codes in database
        await updateRecoveryCodes(userId, result.remainingCodes);
      }
    } else {
      isValid = verifyMFACode(mfaSecret, code);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid MFA code' },
        { status: 401 }
      );
    }

    // MFA verified - create full session
    const user = await getUserById(userId);
    const { token, expiresAt } = await createSession(user, {
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name },
    });

    // Set session cookie
    setSessionCookie(response, token, expiresAt);

    // Clear pending MFA cookie
    response.cookies.delete('mfa_pending');

    return response;
  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'MFA verification failed' },
      { status: 500 }
    );
  }
}

// Placeholder functions - implement based on your database
async function getUserById(userId) {
  // Fetch user from database
}

async function updateRecoveryCodes(userId, codes) {
  // Update recovery codes in database
}
```

---

### Step 5: Update Login Component

**Update**: `components/auth/LoginComponent.js`

Add MFA challenge handling:

```javascript
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export default function LoginComponent() {
  const [step, setStep] = useState('phone'); // phone | code | mfa
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setStep('code');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ phone, code: smsCode }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresMFA) {
          setStep('mfa');
        } else {
          // Login complete - redirect
          window.location.href = data.redirect || '/dashboard';
        }
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ code: mfaCode }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.redirect || '/dashboard';
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid MFA code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render appropriate step
  // ... (implement UI for each step)
}
```

**New Component**: `components/auth/SessionTimeoutWarning.js`

```javascript
import { useEffect, useState } from 'react';

const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutes before timeout
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export default function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let lastActivity = Date.now();
    let warningTimer;
    let countdownInterval;

    const resetTimer = () => {
      lastActivity = Date.now();
      setShowWarning(false);
      clearInterval(countdownInterval);
    };

    const checkTimeout = () => {
      const elapsed = Date.now() - lastActivity;
      const remaining = SESSION_TIMEOUT - elapsed;

      if (remaining <= 0) {
        // Session expired - redirect to login
        window.location.href = '/login?reason=timeout';
      } else if (remaining <= WARNING_BEFORE_TIMEOUT && !showWarning) {
        setShowWarning(true);
        setTimeLeft(Math.floor(remaining / 1000));

        countdownInterval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              window.location.href = '/login?reason=timeout';
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    // Listen for user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Check timeout every 30 seconds
    warningTimer = setInterval(checkTimeout, 30000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearInterval(warningTimer);
      clearInterval(countdownInterval);
    };
  }, [showWarning]);

  const extendSession = async () => {
    try {
      await fetch('/api/auth/session/extend', { method: 'POST' });
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session');
    }
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Session Expiring</h2>
        <p className="mb-4">
          Your session will expire in {timeLeft} seconds due to inactivity.
        </p>
        <div className="flex gap-4">
          <button
            onClick={extendSession}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Stay Logged In
          </button>
          <button
            onClick={() => window.location.href = '/api/auth/logout'}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Success Criteria

- [ ] Session tokens are JWT-based and httpOnly
- [ ] Sessions expire after 15 minutes of inactivity
- [ ] Sessions have 12-hour absolute timeout
- [ ] CSRF tokens validated on all POST/PUT/DELETE requests
- [ ] MFA enrollment API returns QR code and recovery codes
- [ ] MFA verification works with TOTP codes
- [ ] MFA recovery codes work as backup
- [ ] Session timeout warning appears 2 minutes before expiry
- [ ] Logout clears all session data
- [ ] All tests pass

## Troubleshooting

### Issue: Session not persisting across requests

**Solution**:
1. Verify cookie domain is correct
2. Check `secure` flag matches environment
3. Ensure `sameSite` isn't blocking cross-origin requests

### Issue: CSRF validation failing

**Solution**:
1. Verify CSRF token is being sent in header
2. Check token generation uses same secret
3. Ensure token isn't expired

### Issue: MFA codes not validating

**Solution**:
1. Verify server time is synced (NTP)
2. Check TOTP window settings
3. Ensure secret is stored correctly

---

## Next Steps

After completing Phase 2:
1. Verify all success criteria are met
2. Update [Implementation Status](../implementation-status.md)
3. Proceed to [Phase 3: Audit Logging System](./phase-3-audit-logging.md)

---

## Related Documents

- [Index](../index.md)
- [Session Management Guide](../impl/session-management.md)
- [Phase 1](./phase-1-critical-security-fixes.md)
- [Phase 3](./phase-3-audit-logging.md)
