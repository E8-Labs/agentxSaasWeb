---
Document: Brand Theming - CDN Integration Plan
Version: 1.0
Status: Ready for Implementation
Last Updated: 2025-12-13
Author: Claude Code
---

# Brand Theming - CDN Integration Plan

[← Back to Planning](../CLAUDE.md)

## Overview

This planning directory contains the architecture and implementation plan for integrating a CDN with the server-side brand theming system. The goal is to optimize favicon and branding asset delivery for better performance and reduced origin server load.

## Current State

The brand theming system was recently migrated from client-side to server-side (December 2025):

- **Favicon**: Served via dynamic Next.js routes (`/icon`, `/apple-icon`) that read branding from cookies
- **Colors**: CSS variables injected server-side in `layout.js`
- **Assets**: Fetched on-demand from S3/upload server with Next.js `revalidate` caching

## Documents

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | CDN architecture and design decisions |
| [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) | Step-by-step implementation guide |

## Key Files (Current Implementation)

| File | Purpose |
|------|---------|
| `app/icon.js` | Dynamic favicon route |
| `app/apple-icon.js` | Apple touch icon route |
| `lib/getServerBranding.js` | Server-side branding utility |
| `app/layout.js` | Root layout with server-side CSS injection |

## Related Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [AWS CloudFront](https://docs.aws.amazon.com/cloudfront/)
