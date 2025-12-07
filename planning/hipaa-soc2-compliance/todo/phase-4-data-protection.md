---
Document: Phase 4 - Data Protection & Encryption
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Phase 4: Data Protection & Encryption

[← Back to Index](../index.md) | [Implementation Plan](../IMPLEMENTATION-PLAN.md)

## Context

HIPAA requires encryption of PHI at rest (164.312(a)(2)(iv)) and in transit (164.312(e)(1)). This phase implements field-level encryption for sensitive data, secure key management, and data classification policies. Encryption ensures that even if data is accessed by unauthorized parties, it remains unreadable.

## Prerequisites

- [ ] Phase 1-3 completed
- [ ] Audit logging operational (to log encryption operations)
- [ ] Key Management Service selected (AWS KMS, HashiCorp Vault, etc.)
- [ ] Database access for storing encrypted data

## References

- [Architecture Document](../ARCHITECTURE.md)
- [Encryption Service Guide](../impl/encryption-service.md)
- HIPAA 164.312(a)(2)(iv) - Encryption and Decryption
- HIPAA 164.312(e)(1) - Transmission Security

## Current State

### What Exists
- HTTPS for data in transit (via hosting provider)
- Database may have transparent data encryption (TDE)

### What's Missing
- No field-level encryption for PHI/PII
- No key management system
- No data classification
- No key rotation procedures
- No encryption at rest for application-level data

---

## What to Implement

### Task 1: Create Encryption Service

- [ ] Create `services/encryptionService.js`
- [ ] Implement AES-256-GCM encryption
- [ ] Create encrypt/decrypt functions
- [ ] Handle encryption metadata (IV, auth tag)
- [ ] Implement key versioning for rotation

### Task 2: Set Up Key Management

- [ ] Configure AWS KMS (or alternative)
- [ ] Create data encryption keys (DEK)
- [ ] Set up key encryption keys (KEK)
- [ ] Implement key retrieval with caching
- [ ] Configure key access policies

### Task 3: Implement Data Classification

- [ ] Define data classification levels
- [ ] Identify PHI/PII fields in database
- [ ] Create field-level encryption decorators
- [ ] Document classification in schema

### Task 4: Encrypt Existing Data

- [ ] Create migration script for existing data
- [ ] Implement incremental encryption
- [ ] Verify data integrity after encryption
- [ ] Update application to use encrypted fields

### Task 5: Implement Key Rotation

- [ ] Create key rotation procedure
- [ ] Implement re-encryption with new keys
- [ ] Set up automated rotation schedule (90 days)
- [ ] Document emergency key revocation

---

## Implementation Steps

### Step 1: Define Data Classification

**New File**: `lib/encryption/classification.js`

```javascript
/**
 * Data Classification Levels
 */
export const DataClassification = {
  /**
   * PHI - Protected Health Information
   * Highest protection level. Must be encrypted at rest and in transit.
   * Examples: Medical records, diagnoses, treatment information
   */
  PHI: 'phi',

  /**
   * PII - Personally Identifiable Information
   * High protection level. Must be encrypted at rest.
   * Examples: SSN, date of birth, financial information
   */
  PII: 'pii',

  /**
   * CONFIDENTIAL - Business Sensitive
   * Standard protection. Should be encrypted at rest.
   * Examples: API keys, internal reports, customer lists
   */
  CONFIDENTIAL: 'confidential',

  /**
   * INTERNAL - Internal Use Only
   * Basic protection. Database-level encryption sufficient.
   * Examples: Business metrics, non-sensitive configuration
   */
  INTERNAL: 'internal',

  /**
   * PUBLIC - No Restrictions
   * No encryption required.
   * Examples: Marketing content, public documentation
   */
  PUBLIC: 'public',
};

/**
 * Field classifications for common data types
 */
export const FieldClassifications = {
  // PHI Fields
  medicalRecord: DataClassification.PHI,
  diagnosis: DataClassification.PHI,
  prescription: DataClassification.PHI,
  labResult: DataClassification.PHI,
  healthInsuranceId: DataClassification.PHI,
  callTranscript: DataClassification.PHI, // May contain health info

  // PII Fields
  ssn: DataClassification.PII,
  dateOfBirth: DataClassification.PII,
  driversLicense: DataClassification.PII,
  passport: DataClassification.PII,
  bankAccount: DataClassification.PII,
  creditCard: DataClassification.PII,
  taxId: DataClassification.PII,
  fullAddress: DataClassification.PII,

  // Confidential Fields
  apiKey: DataClassification.CONFIDENTIAL,
  accessToken: DataClassification.CONFIDENTIAL,
  refreshToken: DataClassification.CONFIDENTIAL,
  password: DataClassification.CONFIDENTIAL, // Should be hashed, not encrypted
  secretKey: DataClassification.CONFIDENTIAL,

  // Internal Fields
  email: DataClassification.INTERNAL,
  phone: DataClassification.INTERNAL,
  name: DataClassification.INTERNAL,
  userId: DataClassification.INTERNAL,

  // Public Fields
  publicId: DataClassification.PUBLIC,
  timestamp: DataClassification.PUBLIC,
};

/**
 * Encryption requirements by classification
 */
export const EncryptionRequirements = {
  [DataClassification.PHI]: {
    encryptAtRest: true,
    encryptInTransit: true,
    fieldLevel: true,
    auditAccess: true,
    keyRotation: 90, // days
  },
  [DataClassification.PII]: {
    encryptAtRest: true,
    encryptInTransit: true,
    fieldLevel: true,
    auditAccess: true,
    keyRotation: 90,
  },
  [DataClassification.CONFIDENTIAL]: {
    encryptAtRest: true,
    encryptInTransit: true,
    fieldLevel: true,
    auditAccess: false,
    keyRotation: 180,
  },
  [DataClassification.INTERNAL]: {
    encryptAtRest: true,
    encryptInTransit: true,
    fieldLevel: false, // TDE sufficient
    auditAccess: false,
    keyRotation: 365,
  },
  [DataClassification.PUBLIC]: {
    encryptAtRest: false,
    encryptInTransit: true, // HTTPS
    fieldLevel: false,
    auditAccess: false,
    keyRotation: null,
  },
};
```

---

### Step 2: Create Encryption Service

**New File**: `services/encryptionService.js`

```javascript
import crypto from 'crypto';
import { audit, AuditEventType } from './auditService';

/**
 * Encryption configuration
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Encrypted data format:
 * {
 *   v: 1,                    // Version
 *   k: 'key-id',            // Key ID used for encryption
 *   iv: 'base64...',        // Initialization vector
 *   d: 'base64...',         // Encrypted data
 *   t: 'base64...',         // Auth tag
 * }
 */

// In-memory key cache (short TTL)
const keyCache = new Map();
const KEY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get encryption key from KMS
 */
async function getKey(keyId) {
  // Check cache
  const cached = keyCache.get(keyId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.key;
  }

  // Fetch from KMS
  const key = await fetchKeyFromKMS(keyId);

  // Cache key
  keyCache.set(keyId, {
    key,
    expiresAt: Date.now() + KEY_CACHE_TTL,
  });

  return key;
}

/**
 * Fetch key from AWS KMS (example implementation)
 */
async function fetchKeyFromKMS(keyId) {
  // Using AWS SDK v3
  // const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
  // const client = new KMSClient({ region: process.env.AWS_REGION });

  // For development/testing, use environment variable
  if (process.env.NODE_ENV === 'development') {
    const devKey = process.env.ENCRYPTION_KEY;
    if (!devKey) {
      throw new Error('ENCRYPTION_KEY not set in development');
    }
    return Buffer.from(devKey, 'hex');
  }

  // Production: fetch from KMS
  // const command = new DecryptCommand({
  //   KeyId: keyId,
  //   CiphertextBlob: encryptedKey,
  // });
  // const response = await client.send(command);
  // return response.Plaintext;

  throw new Error('KMS integration not implemented');
}

/**
 * Get current key ID for encryption
 */
function getCurrentKeyId() {
  return process.env.CURRENT_KEY_ID || 'dev-key-1';
}

/**
 * Encrypt a value
 * @param {string} plaintext - Value to encrypt
 * @param {object} options - Encryption options
 * @returns {string} - JSON string of encrypted data
 */
export async function encrypt(plaintext, options = {}) {
  if (!plaintext) return null;

  const keyId = options.keyId || getCurrentKeyId();
  const key = await getKey(keyId);

  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Build encrypted payload
  const payload = {
    v: 1,
    k: keyId,
    iv: iv.toString('base64'),
    d: encrypted.toString('base64'),
    t: authTag.toString('base64'),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypt a value
 * @param {string} encryptedJson - JSON string from encrypt()
 * @returns {string} - Decrypted plaintext
 */
export async function decrypt(encryptedJson) {
  if (!encryptedJson) return null;

  let payload;
  try {
    payload = JSON.parse(encryptedJson);
  } catch {
    throw new Error('Invalid encrypted data format');
  }

  // Validate version
  if (payload.v !== 1) {
    throw new Error(`Unsupported encryption version: ${payload.v}`);
  }

  const key = await getKey(payload.k);
  const iv = Buffer.from(payload.iv, 'base64');
  const encrypted = Buffer.from(payload.d, 'base64');
  const authTag = Buffer.from(payload.t, 'base64');

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Encrypt an object's sensitive fields
 * @param {object} obj - Object with sensitive fields
 * @param {string[]} fields - Field names to encrypt
 * @returns {object} - Object with encrypted fields
 */
export async function encryptFields(obj, fields) {
  const encrypted = { ...obj };

  for (const field of fields) {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      encrypted[field] = await encrypt(String(encrypted[field]));
    }
  }

  return encrypted;
}

/**
 * Decrypt an object's encrypted fields
 * @param {object} obj - Object with encrypted fields
 * @param {string[]} fields - Field names to decrypt
 * @returns {object} - Object with decrypted fields
 */
export async function decryptFields(obj, fields) {
  const decrypted = { ...obj };

  for (const field of fields) {
    if (decrypted[field]) {
      try {
        decrypted[field] = await decrypt(decrypted[field]);
      } catch (error) {
        // Field may not be encrypted (legacy data)
        console.warn(`Failed to decrypt field ${field}:`, error.message);
      }
    }
  }

  return decrypted;
}

/**
 * Re-encrypt data with a new key
 * @param {string} encryptedJson - Currently encrypted data
 * @param {string} newKeyId - New key ID to use
 * @returns {string} - Re-encrypted data
 */
export async function reencrypt(encryptedJson, newKeyId) {
  const plaintext = await decrypt(encryptedJson);
  return encrypt(plaintext, { keyId: newKeyId });
}

/**
 * Check if a value is encrypted
 * @param {string} value - Value to check
 * @returns {boolean}
 */
export function isEncrypted(value) {
  if (!value || typeof value !== 'string') return false;

  try {
    const payload = JSON.parse(value);
    return payload.v && payload.k && payload.iv && payload.d && payload.t;
  } catch {
    return false;
  }
}

/**
 * Generate a new encryption key (for key rotation)
 * @returns {string} - Hex-encoded key
 */
export function generateKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
```

---

### Step 3: Create Encrypted Model Helpers

**New File**: `lib/encryption/model.js`

```javascript
import { encrypt, decrypt, encryptFields, decryptFields, isEncrypted } from '@/services/encryptionService';
import { FieldClassifications, DataClassification, EncryptionRequirements } from './classification';
import { auditData } from '@/services/auditService';

/**
 * Define encrypted fields for a model
 * @param {object} schema - Field to classification mapping
 * @returns {object} - Helper functions for the model
 */
export function createEncryptedModel(modelName, schema) {
  // Determine which fields need encryption
  const encryptedFields = Object.entries(schema)
    .filter(([field, classification]) => {
      const requirements = EncryptionRequirements[classification];
      return requirements?.fieldLevel;
    })
    .map(([field]) => field);

  return {
    /**
     * Encrypt sensitive fields before saving
     */
    async beforeSave(data, userId) {
      const encrypted = await encryptFields(data, encryptedFields);

      // Audit the write operation
      if (userId) {
        await auditData.update({
          userId,
          resource: modelName,
          resourceId: data.id,
          phiAccessed: encryptedFields.some(f =>
            schema[f] === DataClassification.PHI
          ),
          metadata: { encryptedFields },
        });
      }

      return encrypted;
    },

    /**
     * Decrypt sensitive fields after loading
     */
    async afterLoad(data, userId) {
      const decrypted = await decryptFields(data, encryptedFields);

      // Audit the read operation
      if (userId) {
        await auditData.read({
          userId,
          resource: modelName,
          resourceId: data.id,
          phiAccessed: encryptedFields.some(f =>
            schema[f] === DataClassification.PHI
          ),
          metadata: { decryptedFields: encryptedFields },
        });
      }

      return decrypted;
    },

    /**
     * Get list of encrypted field names
     */
    getEncryptedFields() {
      return encryptedFields;
    },

    /**
     * Check if all encrypted fields are actually encrypted
     */
    async validateEncryption(data) {
      const unencrypted = [];
      for (const field of encryptedFields) {
        if (data[field] && !isEncrypted(data[field])) {
          unencrypted.push(field);
        }
      }
      return {
        valid: unencrypted.length === 0,
        unencryptedFields: unencrypted,
      };
    },
  };
}

/**
 * Example: Lead model with encryption
 */
export const LeadModel = createEncryptedModel('Lead', {
  // PHI fields
  healthInfo: DataClassification.PHI,
  medicalNotes: DataClassification.PHI,

  // PII fields
  ssn: DataClassification.PII,
  dateOfBirth: DataClassification.PII,
  fullAddress: DataClassification.PII,

  // Internal fields (not field-level encrypted)
  email: DataClassification.INTERNAL,
  phone: DataClassification.INTERNAL,
  name: DataClassification.INTERNAL,

  // Public fields
  leadId: DataClassification.PUBLIC,
  createdAt: DataClassification.PUBLIC,
});

/**
 * Example: User model with encryption
 */
export const UserModel = createEncryptedModel('User', {
  ssn: DataClassification.PII,
  dateOfBirth: DataClassification.PII,
  apiKeys: DataClassification.CONFIDENTIAL,
});

/**
 * Example: CallLog model with encryption
 */
export const CallLogModel = createEncryptedModel('CallLog', {
  transcript: DataClassification.PHI,
  summary: DataClassification.PHI,
  callerInfo: DataClassification.PII,
});
```

---

### Step 4: Create Key Rotation Service

**New File**: `services/keyRotationService.js`

```javascript
import { reencrypt, generateKey } from './encryptionService';
import { audit, AuditEventType } from './auditService';

/**
 * Key rotation configuration
 */
const ROTATION_BATCH_SIZE = 100;
const ROTATION_DELAY_MS = 100; // Delay between batches

/**
 * Rotate encryption key for a model
 * @param {object} model - Encrypted model helper
 * @param {function} getAllRecords - Function to get all records
 * @param {function} updateRecord - Function to update a record
 * @param {string} newKeyId - New key ID to use
 */
export async function rotateKeyForModel(
  modelName,
  encryptedFields,
  getAllRecords,
  updateRecord,
  newKeyId
) {
  // Log rotation start
  await audit({
    eventType: AuditEventType.SYSTEM_CONFIG_CHANGE,
    userId: 'system',
    description: `Key rotation started for ${modelName}`,
    metadata: { newKeyId, fields: encryptedFields },
  });

  let processed = 0;
  let errors = [];

  try {
    // Get all records (implement pagination in getAllRecords)
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const records = await getAllRecords(ROTATION_BATCH_SIZE, offset);

      if (records.length === 0) {
        hasMore = false;
        break;
      }

      // Re-encrypt each record
      for (const record of records) {
        try {
          const updates = {};

          for (const field of encryptedFields) {
            if (record[field]) {
              updates[field] = await reencrypt(record[field], newKeyId);
            }
          }

          if (Object.keys(updates).length > 0) {
            await updateRecord(record.id, updates);
            processed++;
          }
        } catch (error) {
          errors.push({ recordId: record.id, error: error.message });
        }
      }

      offset += ROTATION_BATCH_SIZE;

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, ROTATION_DELAY_MS));
    }

    // Log rotation complete
    await audit({
      eventType: AuditEventType.SYSTEM_CONFIG_CHANGE,
      userId: 'system',
      description: `Key rotation completed for ${modelName}`,
      metadata: {
        newKeyId,
        processed,
        errors: errors.length,
        errorDetails: errors.slice(0, 10), // First 10 errors
      },
    });

    return { success: true, processed, errors };
  } catch (error) {
    // Log rotation failure
    await audit({
      eventType: AuditEventType.SYSTEM_ERROR,
      userId: 'system',
      description: `Key rotation failed for ${modelName}`,
      error: error.message,
      metadata: { newKeyId, processed, errors },
    });

    throw error;
  }
}

/**
 * Create a new key and store in KMS
 */
export async function createNewKey() {
  const keyId = `key-${Date.now()}`;
  const key = generateKey();

  // Store in KMS (implementation depends on KMS provider)
  // await storeKeyInKMS(keyId, key);

  // For development, return the key
  if (process.env.NODE_ENV === 'development') {
    console.log(`New key created: ${keyId}`);
    console.log(`Key value (dev only): ${key}`);
  }

  return keyId;
}

/**
 * Schedule automated key rotation
 */
export function scheduleKeyRotation() {
  // Run every 90 days (or use cron job)
  const ROTATION_INTERVAL = 90 * 24 * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      const newKeyId = await createNewKey();

      // Rotate keys for all encrypted models
      // Implementation depends on your data layer

      console.log('Automated key rotation completed');
    } catch (error) {
      console.error('Automated key rotation failed:', error);
      // Alert security team
    }
  }, ROTATION_INTERVAL);
}
```

---

### Step 5: Update API Routes to Use Encryption

**Example**: Update lead creation/retrieval

```javascript
// app/api/leads/route.js
import { NextResponse } from 'next/server';
import { LeadModel } from '@/lib/encryption/model';
import { validateSession, getSessionFromRequest } from '@/services/sessionService';

export async function POST(request) {
  const sessionToken = getSessionFromRequest(request);
  const { valid, session } = await validateSession(sessionToken);

  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Encrypt sensitive fields before saving
  const encryptedData = await LeadModel.beforeSave(body, session.userId);

  // Save to database
  const lead = await saveLead(encryptedData);

  return NextResponse.json({ id: lead.id });
}

export async function GET(request) {
  const sessionToken = getSessionFromRequest(request);
  const { valid, session } = await validateSession(sessionToken);

  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('id');

  // Get from database
  const lead = await getLead(leadId);

  if (!lead) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Decrypt sensitive fields after loading
  const decryptedLead = await LeadModel.afterLoad(lead, session.userId);

  return NextResponse.json(decryptedLead);
}
```

---

### Step 6: Create Data Migration Script

**New File**: `scripts/encrypt-existing-data.js`

```javascript
#!/usr/bin/env node
/**
 * Migration script to encrypt existing unencrypted data
 * Run with: node scripts/encrypt-existing-data.js
 */

import { LeadModel, UserModel, CallLogModel } from '../lib/encryption/model';
import { isEncrypted } from '../services/encryptionService';

const BATCH_SIZE = 100;

async function migrateModel(modelName, model, getAllRecords, updateRecord) {
  console.log(`\nMigrating ${modelName}...`);

  const encryptedFields = model.getEncryptedFields();
  let migrated = 0;
  let skipped = 0;
  let errors = [];
  let offset = 0;

  while (true) {
    const records = await getAllRecords(BATCH_SIZE, offset);

    if (records.length === 0) break;

    for (const record of records) {
      try {
        // Check if already encrypted
        const validation = await model.validateEncryption(record);

        if (validation.valid) {
          skipped++;
          continue;
        }

        // Encrypt unencrypted fields
        const encrypted = await model.beforeSave(record, 'migration-script');
        await updateRecord(record.id, encrypted);
        migrated++;

        if (migrated % 100 === 0) {
          console.log(`  Migrated ${migrated} records...`);
        }
      } catch (error) {
        errors.push({ id: record.id, error: error.message });
      }
    }

    offset += BATCH_SIZE;
  }

  console.log(`\n${modelName} migration complete:`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped (already encrypted): ${skipped}`);
  console.log(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('  First 10 errors:', errors.slice(0, 10));
  }

  return { migrated, skipped, errors };
}

async function main() {
  console.log('Starting data encryption migration...');
  console.log('='.repeat(50));

  // Migrate each model
  // Implement getAllRecords and updateRecord based on your database

  // Example for Leads:
  // await migrateModel('Lead', LeadModel, getLeadsFromDB, updateLeadInDB);

  // Example for Users:
  // await migrateModel('User', UserModel, getUsersFromDB, updateUserInDB);

  // Example for CallLogs:
  // await migrateModel('CallLog', CallLogModel, getCallLogsFromDB, updateCallLogInDB);

  console.log('\n' + '='.repeat(50));
  console.log('Migration complete!');
}

main().catch(console.error);
```

---

## Success Criteria

- [ ] Encryption service created and tested
- [ ] KMS integration configured
- [ ] Data classification documented
- [ ] All PHI fields encrypted at rest
- [ ] All PII fields encrypted at rest
- [ ] Existing data migrated to encrypted format
- [ ] Key rotation procedure documented and tested
- [ ] Encryption operations logged to audit trail
- [ ] Performance impact acceptable (<50ms overhead per operation)
- [ ] All tests pass

## Troubleshooting

### Issue: Decryption fails for some records

**Solution**:
1. Check if data was encrypted with a different key
2. Verify key is available in KMS
3. Check for data corruption during migration

### Issue: Performance degradation

**Solution**:
1. Enable key caching
2. Reduce encrypted field count if possible
3. Consider async encryption for bulk operations

### Issue: Key not found in KMS

**Solution**:
1. Verify KMS permissions
2. Check key ID is correct
3. Ensure key hasn't been deleted

---

## Next Steps

After completing Phase 4:
1. Verify all success criteria are met
2. Update [Implementation Status](../implementation-status.md)
3. Proceed to [Phase 5: API Security Hardening](./phase-5-api-security.md)

---

## Related Documents

- [Index](../index.md)
- [Encryption Service Guide](../impl/encryption-service.md)
- [Phase 3](./phase-3-audit-logging.md)
- [Phase 5](./phase-5-api-security.md)
