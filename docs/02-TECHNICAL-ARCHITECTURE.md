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

A role-based dashboard built with React, Vite, and Tailwind CSS. Supabase handles authentication. Five portal views:

- **CEO Portal** — revenue dashboards, platform metrics, strategic reporting
- **CTO Portal** — system health, deployment status, technical analytics
- **Merchant Portal** — product management, upload artifacts, view sales
- **Investor Portal** — growth metrics, investor-facing KPIs
- **Consumer Portal** — purchase history, artifact verification

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

The Hono application organizes routes into four groups:

### Auth Routes (`/auth/*`)
- `POST /auth/register` — merchant registration (PBKDF2 password hashing)
- `POST /auth/login` — issue JWT access token
- `POST /auth/refresh` — rotate refresh token
- `GET /auth/me` — current merchant profile

### Merchant Routes (`/merchant/*`)
- `POST /merchant/artifacts` — upload compiled artifact
- `GET /merchant/artifacts` — list merchant artifacts
- `PUT /merchant/artifacts/:hash` — update artifact metadata
- `DELETE /merchant/artifacts/:hash` — delist artifact

### Analytics Routes (`/analytics/*`)
- `POST /analytics/events` — ingest interaction events
- `GET /analytics/reports/:merchantId` — aggregated merchant reports
- `GET /analytics/dashboard` — platform-wide metrics

### Commerce Routes (`/commerce/*`)
- `GET /commerce/resolve/:hash` — resolve hash to artifact
- `POST /commerce/checkout` — initiate Stripe checkout session
- `POST /commerce/webhook` — handle Stripe webhook events

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
3. Service worker checks local cache, then calls `GET /commerce/resolve/:hash`
4. On cache hit or API response, posts artifact metadata back to content script
5. Content script renders a non-intrusive overlay adjacent to the hash element

### Caching
Resolved artifacts are cached in `chrome.storage.local` with a 1-hour TTL. The service worker performs cache eviction on startup.

## Analytics Pipeline

```
User interaction (view, click, purchase)
    |
    v
[lens-extension / auth-portal] --POST /analytics/events-->
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
Stripe webhooks are verified using the `stripe-signature` header and the webhook signing secret. Unverified payloads are rejected with `400`.
