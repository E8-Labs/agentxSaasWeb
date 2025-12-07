---
Document: Encryption Service Implementation Guide
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Encryption Service Implementation Guide

[← Back to Index](../index.md)

## Overview

This guide covers implementing field-level encryption for PHI/PII using AES-256-GCM.

## Prerequisites

- Node.js crypto module (built-in)
- Environment variable for encryption key

## Step 1: Configure Environment

```env
ENCRYPTION_KEY=your_64_character_hex_key_here
CURRENT_KEY_ID=key-v1
```

Generate key:
```bash
openssl rand -hex 32
```

## Step 2: Create Encryption Service

Create `services/encryptionService.js`:

```javascript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(keyId) {
  // In production, fetch from KMS
  // For development, use env var
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY not set');
  return Buffer.from(key, 'hex');
}

export async function encrypt(plaintext) {
  if (!plaintext) return null;

  const keyId = process.env.CURRENT_KEY_ID || 'key-v1';
  const key = getKey(keyId);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    v: 1,
    k: keyId,
    iv: iv.toString('base64'),
    d: encrypted.toString('base64'),
    t: authTag.toString('base64'),
  });
}

export async function decrypt(encryptedJson) {
  if (!encryptedJson) return null;

  const payload = JSON.parse(encryptedJson);
  const key = getKey(payload.k);
  const iv = Buffer.from(payload.iv, 'base64');
  const encrypted = Buffer.from(payload.d, 'base64');
  const authTag = Buffer.from(payload.t, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}

export async function encryptFields(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] != null) {
      result[field] = await encrypt(String(result[field]));
    }
  }
  return result;
}

export async function decryptFields(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field]) {
      try {
        result[field] = await decrypt(result[field]);
      } catch {
        // Field may not be encrypted
      }
    }
  }
  return result;
}

export function isEncrypted(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const p = JSON.parse(value);
    return p.v && p.k && p.iv && p.d && p.t;
  } catch {
    return false;
  }
}
```

## Step 3: Create Encrypted Model Helper

```javascript
import { encryptFields, decryptFields } from '@/services/encryptionService';

export function createEncryptedModel(fields) {
  return {
    async beforeSave(data) {
      return encryptFields(data, fields);
    },
    async afterLoad(data) {
      return decryptFields(data, fields);
    },
  };
}

// Usage
export const LeadModel = createEncryptedModel([
  'ssn',
  'dateOfBirth',
  'medicalNotes',
]);
```

## Step 4: Use in API Routes

```javascript
import { LeadModel } from '@/lib/encryption/models';

export async function POST(request) {
  const body = await request.json();

  // Encrypt before saving
  const encrypted = await LeadModel.beforeSave(body);
  const lead = await saveLead(encrypted);

  return NextResponse.json({ id: lead.id });
}

export async function GET(request) {
  const lead = await getLead(id);

  // Decrypt after loading
  const decrypted = await LeadModel.afterLoad(lead);

  return NextResponse.json(decrypted);
}
```

## Data Classification

| Field Type | Encryption |
|------------|------------|
| PHI (medical) | Field-level required |
| PII (SSN, DOB) | Field-level required |
| Confidential | Field-level required |
| Internal | Database TDE only |
| Public | None |

## Key Rotation

```javascript
export async function reencrypt(encryptedJson, newKeyId) {
  const plaintext = await decrypt(encryptedJson);
  return encrypt(plaintext, { keyId: newKeyId });
}
```

## Related Documents

- [Phase 4: Data Protection](../todo/phase-4-data-protection.md)
- [Architecture](../ARCHITECTURE.md)
