---
Document: Audit Service Implementation Guide
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Audit Service Implementation Guide

[← Back to Index](../index.md)

## Overview

This guide provides step-by-step instructions for implementing the centralized audit logging service required for HIPAA and SOC-2 compliance.

## Prerequisites

- Node.js 22+
- Database (PostgreSQL recommended)
- Optional: External log service (Datadog, Splunk)

## File Structure

```
services/
├── auditService.js           # Main audit service
├── audit/
│   ├── destinations/
│   │   ├── console.js        # Dev logging
│   │   ├── database.js       # Persistent storage
│   │   └── datadog.js        # External aggregation
│   └── schema.js             # Event schemas
lib/
└── audit/
    └── schema.js             # Event types and severity
middleware/
└── audit.js                  # Request audit middleware
```

## Step 1: Install Dependencies

```bash
npm install uuid
```

## Step 2: Create Event Schema

Create `lib/audit/schema.js`:

```javascript
export const AuditEventType = {
  // Authentication
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_MFA_SUCCESS: 'auth.mfa.success',
  AUTH_MFA_FAILURE: 'auth.mfa.failure',
  AUTH_SESSION_TIMEOUT: 'auth.session.timeout',

  // Data Access
  DATA_READ: 'data.read',
  DATA_CREATE: 'data.create',
  DATA_UPDATE: 'data.update',
  DATA_DELETE: 'data.delete',
  DATA_EXPORT: 'data.export',

  // PHI Access
  PHI_ACCESS: 'phi.access',
  PHI_MODIFY: 'phi.modify',

  // Admin
  ADMIN_USER_CREATE: 'admin.user.create',
  ADMIN_USER_UPDATE: 'admin.user.update',
  ADMIN_ROLE_CHANGE: 'admin.role.change',

  // Security
  SECURITY_RATE_LIMIT: 'security.rate_limit',
  SECURITY_CSRF_FAILURE: 'security.csrf_failure',
  SECURITY_UNAUTHORIZED: 'security.unauthorized',
};

export const AuditSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};
```

## Step 3: Create Audit Service

Create `services/auditService.js`:

```javascript
import { v4 as uuidv4 } from 'uuid';
import { AuditSeverity } from '@/lib/audit/schema';

const SENSITIVE_FIELDS = [
  'password', 'token', 'secret', 'apiKey',
  'authorization', 'ssn', 'creditCard',
];

function sanitize(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(f => lowerKey.includes(f))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitize(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const destinations = [];

export function registerDestination(destination) {
  destinations.push(destination);
}

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
    },
    action: {
      description: eventData.description || '',
      resource: eventData.resource || null,
      resourceId: eventData.resourceId || null,
    },
    request: {
      method: eventData.method || null,
      path: eventData.path || null,
      ip: eventData.ip || null,
      userAgent: eventData.userAgent || null,
    },
    result: {
      success: eventData.success !== false,
      statusCode: eventData.statusCode || null,
      error: eventData.error || null,
    },
    phiAccessed: eventData.phiAccessed || false,
    metadata: sanitize(eventData.metadata || {}),
  };

  await Promise.all(
    destinations.map(d => d.write(event).catch(console.error))
  );

  return event;
}
```

## Step 4: Create Log Destinations

Create `services/audit/destinations/database.js`:

```javascript
// Implement based on your database
// Example: Prisma with PostgreSQL

export const databaseDestination = {
  name: 'database',
  async write(event) {
    // await prisma.auditLog.create({ data: event });

    // For now, append to file
    const fs = await import('fs/promises');
    await fs.appendFile(
      'audit.log',
      JSON.stringify(event) + '\n'
    );
  },
};
```

## Step 5: Initialize Service

Create `lib/audit/init.js`:

```javascript
import { registerDestination } from '@/services/auditService';
import { databaseDestination } from '@/services/audit/destinations/database';

let initialized = false;

export function initAuditLogging() {
  if (initialized) return;

  registerDestination(databaseDestination);

  if (process.env.NODE_ENV === 'development') {
    registerDestination({
      name: 'console',
      write: (e) => console.log('[AUDIT]', e.eventType, e.action.description),
    });
  }

  initialized = true;
}
```

## Step 6: Add to API Routes

```javascript
import { audit, AuditEventType } from '@/services/auditService';

export async function POST(request) {
  // ... your logic ...

  await audit({
    eventType: AuditEventType.DATA_CREATE,
    userId: session.userId,
    description: 'Created new lead',
    resource: 'lead',
    resourceId: lead.id,
    method: 'POST',
    path: '/api/leads',
    ip: request.ip,
  });
}
```

## Validation

```bash
# Check audit logs are being written
tail -f audit.log

# Verify log format
cat audit.log | jq .
```

## Related Documents

- [Phase 3: Audit Logging](../todo/phase-3-audit-logging.md)
- [Architecture](../ARCHITECTURE.md)
