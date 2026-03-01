# @thingsthatmatter/shadow-index

> Fast hash-to-artifact resolution API for the fairflow commerce platform.

## Overview

Shadow Index is the core backend service that powers the **compile → resolve → display** pipeline for `.thing` commerce objects. It provides:

- **Product compilation** — deterministic SHA-256 hashing of product data into portable `matter://` URIs
- **Artifact resolution** — fast lookup of hashed products with full metadata
- **Analytics ingestion** — view/click event pipeline (MVP-14)
- **Merchant portal API** — product management, order tracking, payout routing
- **Stripe checkout** — MoR (Merchant-of-Record) checkout flow with webhook settlement

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js ≥ 18 (ESM) |
| Framework | [Hono](https://hono.dev/) v4 |
| Storage | Local JSON files (dev) / Cloudflare R2 (prod) |
| Auth | PBKDF2 passwords + HMAC-SHA256 JWT |
| Payments | Stripe Checkout |
| Validation | Zod |
| Testing | Vitest |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy template, fill in real values)
cp .env.local.template .env.local
# Edit .env.local with your Stripe, Resend, and Google OAuth keys

# 3. Start dev server (hot reload)
npm run dev
# → http://localhost:3000
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm start` | Start production server (reads .env / .env.local) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run type-check` | Type-check without emitting (must pass cleanly) |
| `npm run lint` | ESLint pass on all TypeScript sources |
| `npm test` | Run Vitest test suite |
| `npm run format` | Prettier format all `.ts` / `.json` / `.md` files |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes (checkout) | Stripe secret key (`sk_test_...` in dev) |
| `STRIPE_WEBHOOK_SECRET` | Yes (webhooks) | Stripe webhook signing secret |
| `SHADOW_INDEX_API_KEY` | No | If set, gates all non-public routes |
| `JWT_SECRET` | Yes (merchant auth) | HMAC-SHA256 JWT signing secret (≥ 32 chars) |
| `KYC_ENCRYPTION_KEY` | Yes (KYC) | 64-char hex AES-256 key for KYC data at rest |
| `GOOGLE_CLIENT_ID` | Yes (OAuth) | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes (OAuth) | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Yes (OAuth) | OAuth callback URL |
| `AUTH_PORTAL_BASE_URL` | Yes | Base URL of the auth portal frontend |
| `STORAGE_MODE` | No | `local` (default) or `r2` |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: 60000) |
| `ANALYTICS_EVENTS_DIR` | No | Override events dir (used by tests) |
| `RETENTION_DAYS` | No | Analytics data retention (default: 90) |

See [docs/API_KEYS_GUIDE.md](../../docs/API_KEYS_GUIDE.md) for step-by-step setup.

## API Surface

### Core

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/compile` | Hash + store a product object |
| `GET` | `/resolve/:hash` | Resolve a hash to full product data |
| `GET` | `/health` | Liveness check |
| `POST` | `/batch` | Compile up to 100 products in one request |
| `POST` | `/catalog/import` | Bulk import from JSON or CSV |
| `GET` | `/catalog/public` | List published in-stock products |

### Analytics (MVP-14)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/analytics/event` | Ingest view or click event |
| `GET` | `/v1/analytics/report` | Aggregated report (`from`, `to`, `groupBy`) |
| `GET` | `/v1/analytics/dashboard` | Internal HTML observability dashboard |

### Merchant Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/auth/merchant/register` | Email/password registration |
| `POST` | `/v1/auth/merchant/login` | Email/password login |
| `POST` | `/v1/auth/merchant/forgot-password` | Password reset flow |
| `GET` | `/v1/auth/google` | Google OAuth redirect |
| `GET` | `/v1/auth/google/callback` | Google OAuth callback |

### Merchant Portal (JWT-protected)

| Method | Path | Description |
|--------|------|-------------|
| `GET/POST` | `/v1/merchant/products` | Product CRUD |
| `PATCH` | `/v1/merchant/products/:id` | Update product |
| `DELETE` | `/v1/merchant/products/:id` | Delete product |
| `POST` | `/v1/merchant/products/:id/restock` | Adjust stock level |
| `GET` | `/v1/merchant/orders` | List orders |
| `PATCH` | `/v1/merchant/orders/:id/fulfill` | Mark order fulfilled |
| `GET` | `/v1/merchant/account` | Get merchant profile |
| `GET` | `/v1/merchant/payouts` | Payout history |

### Checkout & Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/checkout/create-session` | Create Stripe checkout session |
| `POST` | `/webhooks/stripe` | Stripe payment webhook |
| `GET` | `/orders/:sessionId` | Fetch order by Stripe session ID |

## Architecture

```
api/
  index.ts          — Hono app: middleware, route registration, server entry
  merchant-products.ts — Merchant products CRUD router + sync read/write helpers
  dashboard.ts      — Analytics HTML dashboard handler
lib/
  storage.ts        — R2 / local file storage abstraction
  analytics-report.ts — JSONL event aggregation engine
  dashboard-metrics.ts — In-memory query metrics for dashboard
  query-cache.ts    — In-memory report cache with TTL
  api-key-registry.ts  — Multi-key auth registry with revocation
  error-logger.ts   — Structured error log
  retention-policy.ts  — JSONL analytics data retention/archiving
data/
  things/           — Per-hash product JSON artifacts
  events/           — Daily JSONL analytics event files
  merchant_products.json — Merchant product catalogue
  orders.json       — Order records (keyed by session ID)
  payout_logs.json  — MoR payout queue
```

## Testing

```bash
npm test                    # Full suite
npm test -- --run           # Single pass (no watch)
npm test -- path/to/test    # Single file
```

Test files mirror the source layout: `api/index.test.ts`, `lib/analytics-report.ts`, etc.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for deep-dive design decisions.
