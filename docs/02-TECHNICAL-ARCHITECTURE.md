# Technical Architecture

## Overview

fairflow is structured as a monorepo containing four packages that form a complete commerce pipeline: a Rust compiler that produces verifiable artifacts, a Node.js API that indexes and resolves them, a React portal for stakeholder management, and a browser extension that surfaces artifacts on any web page. Each package is independently deployable but designed to operate as a cohesive system.

## Package Architecture

### matter-core (Rust Compiler)

The commerce compiler accepts `.thing` source files — structured product/service definitions — and produces content-addressed artifacts. The compilation pipeline:

1. **Parse** the `.thing` source into an AST
2. **Validate** required fields, pricing rules, and merchant signatures
3. **Serialize** the validated object using FlatBuffers for zero-copy reads
4. **Sign** the serialized payload with Ed25519 (merchant key pair)
5. **Compress** the signed bundle with Zstd
6. **Hash** the final output (SHA-256) to produce the content address

Output: a `.thing.bin` artifact identified by its hash, suitable for upload to shadow-index.

### shadow-index (Node.js/Hono API)

The resolution and commerce API, built on Hono running on Node.js (v0.6.0). Serves as the central coordination layer between compiled artifacts, merchants, payments, and analytics.

### auth-portal (React/Vite Frontend)

A role-based dashboard built with React, Vite, and Tailwind CSS. Supabase handles **staff** authentication (CEO/CTO). Merchants use **custom JWTs** issued by shadow-index after login/OAuth. Primary portal views:

- **Admin Portal** (CEO and CTO roles) — unified shell: overview, KYC queue, merchants, payouts, platform health, users and roles
- **Merchant Portal** — products (Supabase `merchant_products`), orders, analytics, KYC and payouts, notifications
- **Investor Mode** — read-only investor view
- **Consumer shop** — product browse and checkout (Paystack)

### lens-extension (Chrome Extension)

A Manifest V3 browser extension that detects artifact hashes on web pages and renders interactive overlays with product details, pricing, and verification status.

## Data Flow

```
.thing source
    |
    v
[matter-core] --compile--> .thing.bin artifact (hashed, signed, compressed)
    |
    v
[shadow-index] <--upload-- merchant uploads artifact via API
    |
    |--- stores metadata in local JSON (dev) or R2 (prod)
    |--- indexes hash -> artifact mapping
    |
    v
[lens-extension] --resolve(hash)--> [shadow-index] --returns--> artifact metadata
    |
    v
Content script renders overlay on the host page
    |
    v
[auth-portal] <--analytics/management-- merchants and stakeholders
```

## API Layer

The Hono application mounts domain routers from `packages/shadow-index/api/index.ts` (composition root). Prefixes below are the live paths.

### Auth (`/v1/auth/*`) — `routes/auth.ts`
- `POST /v1/auth/merchant/register`, `POST /v1/auth/merchant/login`, `POST /v1/auth/merchant/refresh`
- `GET /v1/auth/merchant/me`
- `GET /v1/auth/google`, `GET /v1/auth/google/callback` — Google OAuth for merchants

### Merchant catalog and operations
- `merchant-products.ts` — `GET|POST /v1/merchant/products`, `GET|PATCH|DELETE /v1/merchant/products/:id`
- `routes/merchant.ts` — orders, KYC submit/start/callback, payouts, uploads, notifications, public `/uploads/*` and `/v1/slips/*`

### Analytics (`/v1/analytics/*`) — `routes/analytics.ts`
- `POST /v1/analytics/event` — ingest view / click / purchase events
- `GET /v1/analytics/report` — merchant JWT; aggregated report
- `GET /v1/analytics/dashboard` — HTML ops dashboard (see `middleware/apiKey.ts` public allowlist)

### Admin
- `routes/admin.ts` — `/v1/admin/*` — KYC queue, payouts, retention, cron helpers; `Authorization: Bearer <ADMIN_SECRET_KEY>` (and/or `x-api-key` per deployment)
- `routes/admin-proxy.ts` — `/v1/admin-proxy/*` — same mutations for portal staff; `Authorization: Bearer <Supabase access_token>` with CEO/CTO in `user_roles` (no admin secret in the browser)

### Commerce, compiler, platform
- `routes/checkout.ts` — `POST /checkout/create-session`, order status / confirm-receipt helpers
- `routes/webhooks.ts` — `POST /webhooks/paystack` (HMAC-SHA512 via `x-paystack-signature`)
- `routes/compiler.ts` — `POST /compile`, `GET /resolve/:hash`, `GET /thing/:hash`, batch, catalog import, etc.
- `routes/platform.ts` — `GET /`, `GET /health`
- `routes/scheduler.ts` — `POST /v1/cron/order-checkins` (cron secret)

### API layout (shadow-index)
- **Middleware:** `api/middleware/` — CORS (allowlisted origins), per-IP rate limit (ADR-006), API key + merchant-JWT gate
- **Shared:** `api/shared/` — errors, **single** JWT implementation (`jwt.ts`), runtime paths and config
- **Routes:** `api/routes/*` plus `merchant-products.ts`; all mounted from `api/index.ts` (see `api/routes/README.md`)

### Email and KYC integrations
- **Resend** — transactional email (`packages/shadow-index/api/email.ts`); disabled in dev/test when no API key
- **Sumsub** — KYC webhook and SDK token helpers (`sumsub-kyc.ts`, merchant KYC flows)

## Storage Strategy

### Development
Local JSON files stored in a `data/` directory. Separate files for merchants, artifacts, analytics events, and sessions. File-based storage enables zero-dependency local development.

### Production
Cloudflare R2 for artifact binary storage. Metadata and indexes stored in structured JSON objects on R2. The storage layer is abstracted behind a provider interface, allowing seamless switching between local and R2 backends via environment configuration.

### Analytics Storage
Events are appended to JSONL (JSON Lines) files partitioned by date. Aggregation jobs read raw JSONL, compute metrics, and write summary reports. This append-only design ensures no data loss and supports replay.

## Authentication Model

Three distinct auth mechanisms serve different consumers:

| Consumer | Mechanism | Token Lifetime | Storage |
|---|---|---|---|
| Merchants | JWT (access + refresh) | 15 min / 7 days | API-issued, stateless validation |
| Internal Services | API keys | No expiry (rotatable) | Stored hashed in config |
| Portal Users | Supabase Auth | Session-based | Supabase-managed |

Merchant passwords are hashed with PBKDF2 (SHA-256, 100k iterations, 32-byte salt). JWTs are signed with HS256 using a server-side secret.

## Browser Extension Architecture

### Manifest V3 Components

- **Background Service Worker** — handles API communication with shadow-index, manages auth tokens, caches resolved artifacts
- **Content Script** — scans page DOM for artifact hashes (pattern: 64-char hex strings matching known prefixes), injects overlay UI
- **Popup** — extension settings, connection status, recent resolutions

### Resolution Flow
1. Content script detects candidate hashes via DOM mutation observer
2. Sends resolution request to background service worker
3. Service worker checks local cache, then calls `GET /resolve/:hash`
4. On cache hit or API response, posts artifact metadata back to content script
5. Content script renders a non-intrusive overlay adjacent to the hash element

### Caching
Resolved artifacts are cached in `chrome.storage.local` with a 1-hour TTL. The service worker performs cache eviction on startup.

## Analytics Pipeline

```
User interaction (view, click, purchase)
    |
    v
[lens-extension / auth-portal] --POST /v1/analytics/event-->
    |
    v
[shadow-index] --append--> JSONL file (partitioned by YYYY-MM-DD)
    |
    v
[Aggregation job] --reads JSONL, computes--> daily/weekly/monthly summaries
    |
    v
[Reports API] --serves--> auth-portal dashboards
```

Event schema: `{ timestamp, eventType, artifactHash, merchantId, sessionId, metadata }`.

Aggregation produces: view counts, unique viewers, conversion rates, revenue per artifact, and trending artifacts.

## Security Model

### CORS
Allowlist-based origin validation. In development, `localhost` origins are permitted. In production, only `fairflow.co.za` and the extension origin are allowed.

### Rate Limiting
Token-bucket rate limiter applied per IP. Default: 100 requests per minute for public endpoints, 1000 per minute for authenticated merchants.

### API Key Validation
Service-to-service calls require an `X-API-Key` header. Keys are validated against PBKDF2-hashed values stored in server configuration. Invalid keys return `401` with no error detail.

### Input Validation
All request bodies are validated against TypeScript schemas at the Hono middleware layer. Artifact hashes are validated as 64-character lowercase hex strings. File uploads are size-limited and type-checked.

### Webhook Security
Paystack webhooks are verified using the `x-paystack-signature` header and HMAC-SHA512 with `PAYSTACK_SECRET_KEY`. Sumsub webhooks use `verifySumsubWebhookSignature` when configured. Unverified payloads are rejected with `400`.
