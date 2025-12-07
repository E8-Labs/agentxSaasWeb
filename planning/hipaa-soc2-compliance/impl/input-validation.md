---
Document: Input Validation Implementation Guide
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Input Validation Implementation Guide

[← Back to Index](../index.md)

## Overview

This guide covers implementing input validation using Zod schemas for all API endpoints.

## Step 1: Install Zod

```bash
npm install zod
```

## Step 2: Create Validation Utilities

Create `lib/validation/index.js`:

```javascript
import { z } from 'zod';

// Common schemas
export const schemas = {
  uuid: z.string().uuid(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};

// XSS sanitization
export function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export const sanitizedString = z.string().transform(sanitize);

// Validator factory
export function createValidator(schema) {
  return async (request) => {
    let data = {};

    if (request.method === 'GET') {
      data = Object.fromEntries(request.nextUrl.searchParams);
    } else {
      try {
        data = await request.json();
      } catch {
        data = {};
      }
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          details: result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      };
    }

    return { success: true, data: result.data };
  };
}
```

## Step 3: Create Route Schemas

Create `lib/validation/schemas/leads.js`:

```javascript
import { z } from 'zod';
import { schemas, sanitizedString } from '../index';

export const createLeadSchema = z.object({
  name: sanitizedString.min(1).max(255),
  email: schemas.email.optional(),
  phone: schemas.phone.optional(),
  notes: sanitizedString.max(5000).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadQuerySchema = schemas.pagination.extend({
  search: sanitizedString.max(100).optional(),
  status: z.enum(['new', 'contacted', 'qualified']).optional(),
});
```

## Step 4: Use in API Routes

```javascript
import { NextResponse } from 'next/server';
import { createValidator } from '@/lib/validation';
import { createLeadSchema, leadQuerySchema } from '@/lib/validation/schemas/leads';

const validateCreate = createValidator(createLeadSchema);
const validateQuery = createValidator(leadQuerySchema);

export async function POST(request) {
  const validation = await validateCreate(request);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { data } = validation;
  // Use validated data safely
}

export async function GET(request) {
  const validation = await validateQuery(request);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { page, limit, search } = validation.data;
  // Query with validated params
}
```

## Common Patterns

### Required Fields
```javascript
z.object({
  name: z.string().min(1),
  email: z.string().email(),
})
```

### Optional with Default
```javascript
z.object({
  status: z.enum(['active', 'inactive']).default('active'),
})
```

### Nested Objects
```javascript
z.object({
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
})
```

### Arrays
```javascript
z.object({
  tags: z.array(z.string()).max(10),
})
```

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email"
      }
    ]
  }
}
```

## Related Documents

- [Phase 5: API Security](../todo/phase-5-api-security.md)
- [Architecture](../ARCHITECTURE.md)
