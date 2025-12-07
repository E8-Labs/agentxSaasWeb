---
Document: Security Headers Implementation Guide
Version: 1.0
Status: Ready for Implementation
Last Updated: 2024-12-05
Author: Security & Compliance Team
---

# Security Headers Implementation Guide

[← Back to Index](../index.md)

## Overview

This guide explains how to configure security headers in Next.js to protect against common web vulnerabilities.

## Step 1: Update next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
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
};

export default nextConfig;
```

## Header Explanations

| Header | Purpose |
|--------|---------|
| Strict-Transport-Security | Forces HTTPS |
| X-Content-Type-Options | Prevents MIME sniffing |
| X-Frame-Options | Prevents clickjacking |
| X-XSS-Protection | Legacy XSS filter |
| Referrer-Policy | Controls referrer info |
| Permissions-Policy | Restricts browser features |
| Content-Security-Policy | Controls resource loading |

## Step 2: Verify Headers

```bash
curl -I https://your-domain.com/ 2>/dev/null | grep -E \
  "Strict-Transport|X-Content-Type|X-Frame|X-XSS|Referrer-Policy|Content-Security"
```

## CSP Customization

Adjust CSP based on your needs:

```javascript
// Add external scripts
"script-src 'self' https://cdn.example.com"

// Add analytics
"connect-src 'self' https://analytics.example.com"

// Add image CDN
"img-src 'self' https://images.example.com"
```

## Testing

Use [Security Headers](https://securityheaders.com) to verify your configuration.

## Related Documents

- [Phase 1: Critical Security Fixes](../todo/phase-1-critical-security-fixes.md)
- [Architecture](../ARCHITECTURE.md)
