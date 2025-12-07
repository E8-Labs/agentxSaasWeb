---
Document: Phase 3 - Audit Logging System
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Phase 3: Audit Logging System

[← Back to Index](../index.md) | [Implementation Plan](../IMPLEMENTATION-PLAN.md)

## Context

Audit logging is a critical requirement for both HIPAA (164.312(b)) and SOC-2 compliance. This phase implements a comprehensive audit logging system that tracks all authentication events, data access, and administrative actions. Logs must be immutable, retained for 7 years (HIPAA requirement), and available for compliance audits.

## Prerequisites

- [ ] Phase 1 completed (security fixes)
- [ ] Phase 2 completed (session service provides user context)
- [ ] Database or external logging service available
- [ ] Log aggregation service selected (Datadog, Splunk, CloudWatch, etc.)

## References

- [Architecture Document](../ARCHITECTURE.md)
- [Audit Service Implementation Guide](../impl/audit-service.md)
- HIPAA 164.312(b) - Audit Controls

## Current State

### Existing Logging

**What exists**:
- Sentry error tracking (captures errors and some user context)
- Console.log statements (unstructured, no retention)

**What's missing**:
- No access audit trail
- No authentication event logging
- No PHI/PII access tracking
- No administrative action logging
- No log retention policy
- No alerting on suspicious activity

---

## What to Implement

### Task 1: Create Audit Service

- [ ] Create `services/auditService.js`
- [ ] Define audit event types and schema
- [ ] Implement log writing with required fields
- [ ] Add log sanitization for sensitive data
- [ ] Configure log destination (database/external service)

### Task 2: Create Audit Middleware

- [ ] Create `middleware/audit.js`
- [ ] Capture request metadata automatically
- [ ] Add user context from session
- [ ] Log request/response for API routes
- [ ] Handle async logging without blocking requests

### Task 3: Implement Event-Specific Logging

- [ ] Authentication events (login, logout, MFA, failures)
- [ ] Data access events (PHI/PII read, write, delete)
- [ ] Administrative events (user management, settings)
- [ ] Security events (rate limits, CSRF failures, unauthorized access)

### Task 4: Configure Log Retention

- [ ] Set up 7-year retention policy
- [ ] Configure log rotation
- [ ] Implement log archival strategy
- [ ] Set up log backup procedures

### Task 5: Set Up Alerting

- [ ] Define alert rules for suspicious activity
- [ ] Configure notification channels
- [ ] Set up alert escalation procedures
- [ ] Test alerting system

---

## Implementation Steps

### Step 1: Define Audit Event Schema

**New File**: `lib/audit/schema.js`

```javascript
/**
 * Audit Event Types
 */
export const AuditEventType = {
  // Authentication Events
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_MFA_CHALLENGE: 'auth.mfa.challenge',
  AUTH_MFA_SUCCESS: 'auth.mfa.success',
  AUTH_MFA_FAILURE: 'auth.mfa.failure',
  AUTH_SESSION_TIMEOUT: 'auth.session.timeout',
  AUTH_SESSION_REFRESH: 'auth.session.refresh',
  AUTH_PASSWORD_RESET: 'auth.password.reset',

  // Data Access Events
  DATA_READ: 'data.read',
  DATA_CREATE: 'data.create',
  DATA_UPDATE: 'data.update',
  DATA_DELETE: 'data.delete',
  DATA_EXPORT: 'data.export',
  DATA_BULK_ACCESS: 'data.bulk_access',

  // PHI-Specific Events
  PHI_ACCESS: 'phi.access',
  PHI_MODIFY: 'phi.modify',
  PHI_EXPORT: 'phi.export',

  // Administrative Events
  ADMIN_USER_CREATE: 'admin.user.create',
  ADMIN_USER_UPDATE: 'admin.user.update',
  ADMIN_USER_DELETE: 'admin.user.delete',
  ADMIN_ROLE_CHANGE: 'admin.role.change',
  ADMIN_SETTINGS_CHANGE: 'admin.settings.change',
  ADMIN_API_KEY_CREATE: 'admin.api_key.create',
  ADMIN_API_KEY_REVOKE: 'admin.api_key.revoke',

  // Security Events
  SECURITY_RATE_LIMIT: 'security.rate_limit',
  SECURITY_CSRF_FAILURE: 'security.csrf_failure',
  SECURITY_UNAUTHORIZED: 'security.unauthorized',
  SECURITY_SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  SECURITY_IP_BLOCKED: 'security.ip_blocked',

  // System Events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_CONFIG_CHANGE: 'system.config_change',
};

/**
 * Audit Event Severity Levels
 */
export const AuditSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Audit Event Schema
 * All audit events must conform to this structure
 */
export const AuditEventSchema = {
  // Required fields
  id: 'string',           // Unique event ID (UUID)
  timestamp: 'string',    // ISO 8601 timestamp
  eventType: 'string',    // From AuditEventType enum
  severity: 'string',     // From AuditSeverity enum

  // Actor (who performed the action)
  actor: {
    userId: 'string',     // User ID or 'system' or 'anonymous'
    sessionId: 'string',  // Session ID if applicable
    userType: 'string',   // User type (admin, agency, etc.)
    userRole: 'string',   // User role
  },

  // Action details
  action: {
    type: 'string',       // Action type
    description: 'string', // Human-readable description
    resource: 'string',   // Resource being accessed
    resourceId: 'string', // ID of the resource
  },

  // Request context
  request: {
    method: 'string',     // HTTP method
    path: 'string',       // Request path
    ip: 'string',         // Client IP
    userAgent: 'string',  // User agent string
    referrer: 'string',   // Referrer URL
  },

  // Result
  result: {
    success: 'boolean',   // Whether action succeeded
    statusCode: 'number', // HTTP status code
    error: 'string',      // Error message if failed
  },

  // PHI indicator
  phiAccessed: 'boolean', // Whether PHI was accessed

  // Additional metadata
  metadata: 'object',     // Additional context-specific data
};
```

---

### Step 2: Create Audit Service

**New File**: `services/auditService.js`

```javascript
import { v4 as uuidv4 } from 'uuid';
import { AuditEventType, AuditSeverity } from '@/lib/audit/schema';

/**
 * Sensitive fields to redact from logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'ssn',
  'creditCard',
  'cvv',
];

/**
 * Sanitize object by redacting sensitive fields
 */
function sanitize(obj, depth = 0) {
  if (depth > 5) return '[MAX_DEPTH]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitize(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Audit log destinations
 */
const destinations = [];

/**
 * Register a log destination
 */
export function registerDestination(destination) {
  destinations.push(destination);
}

/**
 * Create an audit event
 */
export async function audit(eventData) {
  const event = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    eventType: eventData.eventType,
    severity: eventData.severity || AuditSeverity.INFO,

    actor: {
      userId: eventData.userId || 'anonymous',
      sessionId: eventData.sessionId || null,
      userType: eventData.userType || null,
      userRole: eventData.userRole || null,
    },

    action: {
      type: eventData.actionType || eventData.eventType,
      description: eventData.description || '',
      resource: eventData.resource || null,
      resourceId: eventData.resourceId || null,
    },

    request: {
      method: eventData.method || null,
      path: eventData.path || null,
      ip: eventData.ip || null,
      userAgent: eventData.userAgent || null,
      referrer: eventData.referrer || null,
    },

    result: {
      success: eventData.success !== false,
      statusCode: eventData.statusCode || null,
      error: eventData.error || null,
    },

    phiAccessed: eventData.phiAccessed || false,

    metadata: sanitize(eventData.metadata || {}),
  };

  // Write to all registered destinations
  await Promise.all(
    destinations.map(dest => dest.write(event).catch(err => {
      console.error('Audit log destination error:', err);
    }))
  );

  return event;
}

/**
 * Convenience methods for common event types
 */
export const auditAuth = {
  loginSuccess: (data) => audit({
    eventType: AuditEventType.AUTH_LOGIN_SUCCESS,
    severity: AuditSeverity.INFO,
    description: 'User logged in successfully',
    ...data,
  }),

  loginFailure: (data) => audit({
    eventType: AuditEventType.AUTH_LOGIN_FAILURE,
    severity: AuditSeverity.WARNING,
    description: 'Login attempt failed',
    success: false,
    ...data,
  }),

  logout: (data) => audit({
    eventType: AuditEventType.AUTH_LOGOUT,
    severity: AuditSeverity.INFO,
    description: 'User logged out',
    ...data,
  }),

  mfaSuccess: (data) => audit({
    eventType: AuditEventType.AUTH_MFA_SUCCESS,
    severity: AuditSeverity.INFO,
    description: 'MFA verification successful',
    ...data,
  }),

  mfaFailure: (data) => audit({
    eventType: AuditEventType.AUTH_MFA_FAILURE,
    severity: AuditSeverity.WARNING,
    description: 'MFA verification failed',
    success: false,
    ...data,
  }),

  sessionTimeout: (data) => audit({
    eventType: AuditEventType.AUTH_SESSION_TIMEOUT,
    severity: AuditSeverity.INFO,
    description: 'Session timed out',
    ...data,
  }),
};

export const auditData = {
  read: (data) => audit({
    eventType: AuditEventType.DATA_READ,
    severity: AuditSeverity.INFO,
    description: `Read ${data.resource}`,
    ...data,
  }),

  create: (data) => audit({
    eventType: AuditEventType.DATA_CREATE,
    severity: AuditSeverity.INFO,
    description: `Created ${data.resource}`,
    ...data,
  }),

  update: (data) => audit({
    eventType: AuditEventType.DATA_UPDATE,
    severity: AuditSeverity.INFO,
    description: `Updated ${data.resource}`,
    ...data,
  }),

  delete: (data) => audit({
    eventType: AuditEventType.DATA_DELETE,
    severity: AuditSeverity.WARNING,
    description: `Deleted ${data.resource}`,
    ...data,
  }),

  phiAccess: (data) => audit({
    eventType: AuditEventType.PHI_ACCESS,
    severity: AuditSeverity.INFO,
    description: `Accessed PHI: ${data.resource}`,
    phiAccessed: true,
    ...data,
  }),
};

export const auditSecurity = {
  rateLimit: (data) => audit({
    eventType: AuditEventType.SECURITY_RATE_LIMIT,
    severity: AuditSeverity.WARNING,
    description: 'Rate limit exceeded',
    success: false,
    ...data,
  }),

  csrfFailure: (data) => audit({
    eventType: AuditEventType.SECURITY_CSRF_FAILURE,
    severity: AuditSeverity.WARNING,
    description: 'CSRF validation failed',
    success: false,
    ...data,
  }),

  unauthorized: (data) => audit({
    eventType: AuditEventType.SECURITY_UNAUTHORIZED,
    severity: AuditSeverity.WARNING,
    description: 'Unauthorized access attempt',
    success: false,
    ...data,
  }),

  suspiciousActivity: (data) => audit({
    eventType: AuditEventType.SECURITY_SUSPICIOUS_ACTIVITY,
    severity: AuditSeverity.CRITICAL,
    description: data.description || 'Suspicious activity detected',
    ...data,
  }),
};
```

---

### Step 3: Create Log Destinations

**New File**: `services/audit/destinations/console.js`

```javascript
/**
 * Console destination for development
 */
export const consoleDestination = {
  name: 'console',

  async write(event) {
    if (process.env.NODE_ENV !== 'development') return;

    const color = {
      info: '\x1b[36m',    // Cyan
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      critical: '\x1b[35m', // Magenta
    }[event.severity] || '\x1b[0m';

    console.log(
      `${color}[AUDIT]`,
      event.timestamp,
      event.eventType,
      event.actor.userId,
      event.action.description,
      '\x1b[0m'
    );
  },
};
```

**New File**: `services/audit/destinations/database.js`

```javascript
/**
 * Database destination for persistent audit logs
 * Implement based on your database (PostgreSQL, MongoDB, etc.)
 */
export const databaseDestination = {
  name: 'database',

  async write(event) {
    // Example: PostgreSQL with Prisma
    // await prisma.auditLog.create({
    //   data: {
    //     id: event.id,
    //     timestamp: new Date(event.timestamp),
    //     eventType: event.eventType,
    //     severity: event.severity,
    //     actorUserId: event.actor.userId,
    //     actorSessionId: event.actor.sessionId,
    //     actionType: event.action.type,
    //     actionDescription: event.action.description,
    //     resource: event.action.resource,
    //     resourceId: event.action.resourceId,
    //     requestMethod: event.request.method,
    //     requestPath: event.request.path,
    //     requestIp: event.request.ip,
    //     requestUserAgent: event.request.userAgent,
    //     resultSuccess: event.result.success,
    //     resultStatusCode: event.result.statusCode,
    //     resultError: event.result.error,
    //     phiAccessed: event.phiAccessed,
    //     metadata: event.metadata,
    //   },
    // });

    // For now, store in a simple file (replace with real database)
    const fs = await import('fs/promises');
    const logLine = JSON.stringify(event) + '\n';
    await fs.appendFile('audit.log', logLine);
  },
};
```

**New File**: `services/audit/destinations/datadog.js`

```javascript
/**
 * Datadog destination for log aggregation
 */
export const datadogDestination = {
  name: 'datadog',

  async write(event) {
    if (!process.env.DD_API_KEY) return;

    try {
      await fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DD_API_KEY,
        },
        body: JSON.stringify({
          ddsource: 'assignx',
          ddtags: `env:${process.env.NODE_ENV},service:assignx-web`,
          hostname: process.env.VERCEL_URL || 'localhost',
          message: event.action.description,
          ...event,
        }),
      });
    } catch (error) {
      console.error('Datadog logging error:', error);
    }
  },
};
```

---

### Step 4: Create Audit Middleware

**New File**: `middleware/audit.js`

```javascript
import { NextResponse } from 'next/server';
import { audit, AuditEventType, AuditSeverity } from '@/services/auditService';

/**
 * Routes that should be audited
 */
const AUDITED_ROUTES = [
  '/api/auth',
  '/api/admin',
  '/api/users',
  '/api/leads',
  '/api/pipeline',
  '/api/agents',
];

/**
 * Routes containing PHI
 */
const PHI_ROUTES = [
  '/api/leads',
  '/api/calls',
  '/api/health',
];

/**
 * Extract request metadata for audit logging
 */
function extractRequestMeta(request) {
  return {
    method: request.method,
    path: request.nextUrl.pathname,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    referrer: request.headers.get('referer') || null,
  };
}

/**
 * Audit middleware
 */
export async function auditMiddleware(request, session) {
  const { pathname } = request.nextUrl;

  // Check if route should be audited
  const shouldAudit = AUDITED_ROUTES.some(route => pathname.startsWith(route));
  if (!shouldAudit) return;

  const requestMeta = extractRequestMeta(request);
  const isPHIRoute = PHI_ROUTES.some(route => pathname.startsWith(route));

  // Log the request (response logging happens in API route)
  const auditData = {
    eventType: AuditEventType.DATA_READ, // Default, will be updated based on method
    userId: session?.userId || 'anonymous',
    sessionId: session?.jti || null,
    userType: session?.userType || null,
    userRole: session?.userRole || null,
    ...requestMeta,
    phiAccessed: isPHIRoute,
    metadata: {
      query: Object.fromEntries(request.nextUrl.searchParams),
    },
  };

  // Determine event type based on HTTP method
  switch (request.method) {
    case 'POST':
      auditData.eventType = AuditEventType.DATA_CREATE;
      auditData.description = `Create request to ${pathname}`;
      break;
    case 'PUT':
    case 'PATCH':
      auditData.eventType = AuditEventType.DATA_UPDATE;
      auditData.description = `Update request to ${pathname}`;
      break;
    case 'DELETE':
      auditData.eventType = AuditEventType.DATA_DELETE;
      auditData.description = `Delete request to ${pathname}`;
      auditData.severity = AuditSeverity.WARNING;
      break;
    default:
      auditData.eventType = AuditEventType.DATA_READ;
      auditData.description = `Read request to ${pathname}`;
  }

  // Fire and forget - don't block the request
  audit(auditData).catch(err => {
    console.error('Audit middleware error:', err);
  });
}

/**
 * Log API response for audit trail
 */
export async function auditResponse(request, response, session, startTime) {
  const { pathname } = request.nextUrl;
  const requestMeta = extractRequestMeta(request);
  const duration = Date.now() - startTime;

  await audit({
    eventType: AuditEventType.DATA_READ,
    description: `Response for ${pathname}`,
    userId: session?.userId || 'anonymous',
    sessionId: session?.jti || null,
    ...requestMeta,
    statusCode: response.status,
    success: response.status < 400,
    error: response.status >= 400 ? `HTTP ${response.status}` : null,
    metadata: {
      durationMs: duration,
    },
  });
}
```

---

### Step 5: Integrate Audit Logging into API Routes

**Example**: Update `app/api/auth/login/route.js`

```javascript
import { NextResponse } from 'next/server';
import { auditAuth } from '@/services/auditService';

export async function POST(request) {
  const startTime = Date.now();
  const { phone, code } = await request.json();

  const requestMeta = {
    method: request.method,
    path: '/api/auth/login',
    ip: request.ip || request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
  };

  try {
    // Verify code (existing logic)
    const user = await verifyLoginCode(phone, code);

    if (!user) {
      // Log failed login
      await auditAuth.loginFailure({
        ...requestMeta,
        metadata: { phone: phone.slice(-4) }, // Last 4 digits only
        error: 'Invalid code',
      });

      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 401 }
      );
    }

    // Create session (existing logic)
    const session = await createSession(user, requestMeta);

    // Log successful login
    await auditAuth.loginSuccess({
      userId: user.id,
      sessionId: session.jti,
      userType: user.userType,
      userRole: user.userRole,
      ...requestMeta,
      metadata: {
        loginMethod: 'sms',
        durationMs: Date.now() - startTime,
      },
    });

    // Return success response
    const response = NextResponse.json({
      success: true,
      requiresMFA: user.mfaEnabled,
    });

    // Set session cookie
    setSessionCookie(response, session.token, session.expiresAt);

    return response;
  } catch (error) {
    // Log error
    await auditAuth.loginFailure({
      ...requestMeta,
      error: error.message,
      statusCode: 500,
    });

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

---

### Step 6: Initialize Audit Service

**Update**: `app/layout.js` or create `lib/audit/init.js`

```javascript
import { registerDestination } from '@/services/auditService';
import { consoleDestination } from '@/services/audit/destinations/console';
import { databaseDestination } from '@/services/audit/destinations/database';
import { datadogDestination } from '@/services/audit/destinations/datadog';

// Register audit log destinations
export function initAuditLogging() {
  // Always log to database
  registerDestination(databaseDestination);

  // Console in development
  if (process.env.NODE_ENV === 'development') {
    registerDestination(consoleDestination);
  }

  // Datadog in production
  if (process.env.DD_API_KEY) {
    registerDestination(datadogDestination);
  }
}

// Initialize on app start
initAuditLogging();
```

---

### Step 7: Configure Alerting

**New File**: `services/audit/alerting.js`

```javascript
import { AuditEventType, AuditSeverity } from '@/lib/audit/schema';

/**
 * Alert rules
 */
const alertRules = [
  {
    name: 'Multiple Failed Logins',
    condition: (events) => {
      const failedLogins = events.filter(
        e => e.eventType === AuditEventType.AUTH_LOGIN_FAILURE
      );
      // More than 5 failed logins from same IP in 5 minutes
      return failedLogins.length > 5;
    },
    severity: 'high',
    action: 'notify_security',
  },
  {
    name: 'PHI Bulk Export',
    condition: (events) => {
      const phiExports = events.filter(
        e => e.eventType === AuditEventType.PHI_EXPORT
      );
      return phiExports.length > 0;
    },
    severity: 'high',
    action: 'notify_security',
  },
  {
    name: 'Admin Role Change',
    condition: (events) => {
      return events.some(
        e => e.eventType === AuditEventType.ADMIN_ROLE_CHANGE
      );
    },
    severity: 'medium',
    action: 'notify_admin',
  },
  {
    name: 'Critical Security Event',
    condition: (events) => {
      return events.some(
        e => e.severity === AuditSeverity.CRITICAL
      );
    },
    severity: 'critical',
    action: 'page_oncall',
  },
];

/**
 * Check events against alert rules
 */
export async function checkAlertRules(events) {
  for (const rule of alertRules) {
    if (rule.condition(events)) {
      await triggerAlert(rule, events);
    }
  }
}

/**
 * Trigger an alert
 */
async function triggerAlert(rule, events) {
  const alert = {
    name: rule.name,
    severity: rule.severity,
    triggeredAt: new Date().toISOString(),
    eventCount: events.length,
    sampleEvents: events.slice(0, 5),
  };

  switch (rule.action) {
    case 'notify_security':
      await sendSlackAlert('#security-alerts', alert);
      await sendEmail('security@company.com', alert);
      break;
    case 'notify_admin':
      await sendSlackAlert('#admin-alerts', alert);
      break;
    case 'page_oncall':
      await sendPagerDutyAlert(alert);
      break;
  }
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(channel, alert) {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel,
      text: `🚨 Security Alert: ${alert.name}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Event Count', value: alert.eventCount.toString(), short: true },
          { title: 'Time', value: alert.triggeredAt, short: false },
        ],
      }],
    }),
  });
}

/**
 * Send email alert
 */
async function sendEmail(to, alert) {
  // Implement email sending via SendGrid, SES, etc.
}

/**
 * Send PagerDuty alert
 */
async function sendPagerDutyAlert(alert) {
  if (!process.env.PAGERDUTY_ROUTING_KEY) return;

  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: 'trigger',
      payload: {
        summary: `Security Alert: ${alert.name}`,
        severity: alert.severity,
        source: 'assignx-web',
        timestamp: alert.triggeredAt,
        custom_details: alert,
      },
    }),
  });
}
```

---

## Success Criteria

- [ ] Audit service created and operational
- [ ] All authentication events logged (login, logout, MFA, failures)
- [ ] All data access events logged (read, create, update, delete)
- [ ] PHI access flagged in audit logs
- [ ] Logs stored in persistent storage
- [ ] 7-year retention policy configured
- [ ] Logs are immutable (append-only)
- [ ] Alerting configured for suspicious activity
- [ ] Audit admin UI available for viewing logs
- [ ] All tests pass

## Troubleshooting

### Issue: Audit logs not appearing

**Solution**:
1. Verify destinations are registered
2. Check database connection
3. Verify audit middleware is running
4. Check for errors in console

### Issue: Performance degradation from logging

**Solution**:
1. Ensure async logging (fire-and-forget)
2. Add buffering for high-volume routes
3. Consider sampling for very high traffic

### Issue: Log storage growing too fast

**Solution**:
1. Review what's being logged
2. Implement log aggregation
3. Set up log archival to cold storage

---

## Next Steps

After completing Phase 3:
1. Verify all success criteria are met
2. Update [Implementation Status](../implementation-status.md)
3. Proceed to [Phase 4: Data Protection](./phase-4-data-protection.md)

---

## Related Documents

- [Index](../index.md)
- [Audit Service Guide](../impl/audit-service.md)
- [Phase 2](./phase-2-authentication-session.md)
- [Phase 4](./phase-4-data-protection.md)
