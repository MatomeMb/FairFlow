# @thingsthatmatter/shadow-index

> The fairflow commerce API. Production-grade backend for merchant onboarding, product management, checkout, KYC, analytics, and payouts.

**Status:** v0.6.0 — Production Ready  
**Last Updated:** March 19, 2026

## Overview

Shadow Index is the core backend service for the fairflow commerce platform. It handles:

- **Merchant authentication** — email/password and Google OAuth with JWT tokens
- **Product management** — CRUD operations for merchant catalogs
- **Order processing** — Paystack/Stripe payment gateway integration
- **Analytics ingestion** — View and click event pipeline (MVP-14)
- **Admin operations** — KYC approvals, merchant management, payouts
- **Webhook handling** — Payment confirmation and event processing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js ≥ 18 (ESM) |
| **Framework** | [Hono](https://hono.dev/) v4 |
| **Language** | TypeScript |
| **Storage** | Local JSON (dev) / Cloudflare R2 (prod) |
| **Authentication** | PBKDF2 password hashing + HMAC-SHA256 JWT |
| **Payments** | Paystack (primary) + Stripe (fallback) |
| **Validation** | Zod schema validation |
| **Testing** | Vitest |

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A Paystack account (for payment processing)
- A Supabase project (for database)

### Installation

```bash
npm install
```

### Configuration

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables (see [docs/API_KEYS_GUIDE.md](../../docs/API_KEYS_GUIDE.md) for detailed setup):

```env
# Server
PORT=3000

# Authentication
JWT_SECRET=your-64-char-random-string
ADMIN_SECRET_KEY=your-admin-secret

# Paystack (Primary payment processor)
PAYSTACK_SECRET_KEY=sk_live_...   # or sk_test_... for development
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_CALLBACK_URL=https://portal.fairflow.co.za/order/confirmation

# Stripe (Fallback)
STRIPE_SECRET_KEY=sk_test_... (optional)
STRIPE_WEBHOOK_SECRET=whsec_... (optional)

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.fairflow.co.za/v1/auth/google/callback

# Supabase (Database & Auth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Portal & URLs
AUTH_PORTAL_BASE_URL=https://portal.fairflow.co.za
PUBLIC_API_BASE_URL=https://api.fairflow.co.za

# Storage
STORAGE_MODE=local  # or 'r2' for production
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=fairflow-artifacts

# Analytics
ANALYTICS_EVENTS_DIR=./data/events
RETENTION_DAYS=90
```

### Running Locally

```bash
npm run dev
# → API available at http://localhost:3000
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm start` | Start production server (Node.js) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run type-check` | TypeScript type-checking (must pass before deploy) |
| `npm run lint` | ESLint on all TypeScript sources |
| `npm test` | Run Vitest test suite |
| `npm test:watch` | Watch mode for tests |
| `npm run format` | Prettier format (TS, JSON, MD) |

## API Reference

### Base URL

- **Development:** `http://localhost:3000`
- **Staging:** `https://staging-api.fairflow.co.za`
- **Production:** `https://api.fairflow.co.za`

### Authentication

Two authentication systems are supported:

1. **Merchant JWT** — Issued by `/v1/auth/merchant/login` or `/v1/auth/google/callback`
   - Use in header: `Authorization: Bearer <token>`
   - Tokens expire in 7 days

2. **Admin Secret** — For admin operations only
   - Use in header: `Authorization: <ADMIN_SECRET_KEY>`
   - Long-lived; rotate regularly

### Core Routes

#### Health & Monitoring

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Liveness check (returns 200) |
| `GET` | `/healthz` | None | Function-level health probe |

#### Merchant Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/auth/merchant/register` | None | Email/password signup |
| `POST` | `/v1/auth/merchant/login` | None | Email/password login (returns JWT) |
| `POST` | `/v1/auth/merchant/forgot-password` | None | Request password reset email |
| `GET` | `/v1/auth/google` | None | Redirect to Google OAuth consent screen |
| `GET` | `/v1/auth/google/callback` | None | OAuth callback (returns JWT in URL) |

**Example:** Register merchant
```bash
curl -X POST http://localhost:3000/v1/auth/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "password": "secure-password",
    "merchant_name": "My Store"
  }'

# Response: { token: "eyJhbGc...", merchant_id: "uuid" }
```

#### Merchant Portal (JWT Required)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/merchant/account` | Merchant JWT | Get profile info |
| `PATCH` | `/v1/merchant/account` | Merchant JWT | Update account details |
| `POST` | `/v1/merchant/products` | Merchant JWT | Create product |
| `GET` | `/v1/merchant/products` | Merchant JWT | List merchant products |
| `GET` | `/v1/merchant/products/:id` | Merchant JWT | Get product detail |
| `PATCH` | `/v1/merchant/products/:id` | Merchant JWT | Update product |
| `DELETE` | `/v1/merchant/products/:id` | Merchant JWT | Delete product |
| `POST` | `/v1/merchant/products/:id/restock` | Merchant JWT | Adjust stock level |
| `GET` | `/v1/merchant/orders` | Merchant JWT | List merchant orders |
| `PATCH` | `/v1/merchant/orders/:id/fulfill` | Merchant JWT | Mark order as fulfilled |
| `GET` | `/v1/merchant/payouts` | Merchant JWT | Payout history |
| `POST` | `/v1/merchant/kyc/submit` | Merchant JWT | Submit KYC documentation |
| `GET` | `/v1/merchant/kyc/status` | Merchant JWT | Get KYC approval status |

**Example:** Create product
```bash
curl -X POST http://localhost:3000/v1/merchant/products \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ceramic Mug",
    "description": "Handmade ceramic coffee mug",
    "price": 25000,
    "currency": "ZAR",
    "stock": 50,
    "image_url": "https://..."
  }'
```

#### Checkout & Payment (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/checkout/create-session` | None | Initialize Paystack checkout |
| `POST` | `/webhooks/paystack` | Signature | Paystack payment webhook |
| `POST` | `/webhooks/stripe` | Signature | Stripe payment webhook (fallback) |
| `GET` | `/orders/:session_id` | None | Fetch order by session ID |

**Example:** Create checkout session
```bash
curl -X POST http://localhost:3000/checkout/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "product_hash": "abc123def456",
    "customer_email": "customer@example.com",
    "delivery_address": {
      "name": "John Doe",
      "line1": "123 Main St",
      "city": "Cape Town",
      "postal_code": "8000",
      "phone": "+27821234567"
    }
  }'

# Response: { url: "https://checkout.paystack.com/xyz..." }
```

#### Analytics (MVP-14)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/analytics/event` | None | Ingest view/click event |
| `GET` | `/v1/analytics/report` | Merchant JWT | Aggregated merchant report |
| `GET` | `/v1/analytics/dashboard` | Admin Secret | HTML observability dashboard |

**Example:** Track event
```bash
curl -X POST http://localhost:3000/v1/analytics/event \
  -H "Content-Type: application/json" \
  -d '{
    "event": "view",
    "hash": "abc123",
    "anon_id": "uuid",
    "source_url": "https://example.com"
  }'
```

#### Admin Operations (Admin Secret Required)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/admin/kyc/pending` | Admin Secret | List pending KYC applications |
| `PATCH` | `/v1/admin/kyc/approve/:merchant_id` | Admin Secret | Approve KYC and activate merchant |
| `PATCH` | `/v1/admin/kyc/reject/:merchant_id` | Admin Secret | Reject KYC application |
| `GET` | `/v1/admin/merchants` | Admin Secret | List all merchants |
| `POST` | `/v1/admin/payouts/release` | Admin Secret | Release merchant payout |
| `GET` | `/v1/admin/dashboard` | Admin Secret | Admin dashboard summary |

**Example:** Approve KYC
```bash
curl -X PATCH http://localhost:3000/v1/admin/kyc/approve/merchant-uuid \
  -H "Authorization: Bearer your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{ "notes": "Document verification complete" }'
```

### Error Responses

All errors follow a standard format:

```json
{
  "code": "error_code",
  "message": "Human-readable error message",
  "details": {}
}
```

Common error codes:

| Code | HTTP | Description |
|------|------|-------------|
| `invalid_request` | 400 | Malformed request or validation failure |
| `unauthorized` | 401 | Missing or invalid authentication |
| `forbidden` | 403 | Authorized but not permitted |
| `not_found` | 404 | Resource not found |
| `conflict` | 409 | Duplicate resource (e.g., email exists) |
| `rate_limit_exceeded` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

## Data Storage

### Development
Local JSON files in the `data/` directory:
- `merchant_accounts.json` — Merchant credentials and profiles
- `orders.json` — Order records
- `merchant_products.json` — Product catalog
- `payout_logs.json` — Payout transaction log
- `events/` — Daily JSONL analytics files

### Production
Cloudflare R2 bucket:
- Metadata and indexes stored in JSON objects
- Binary artifacts compressed and stored
- Same API, different backend (abstracted via storage provider)

## Payment Processing

### Paystack (Primary)

fairflow uses Paystack for payment processing in South Africa.

**Flow:**
1. Consumer initiates checkout
2. API creates Paystack transaction
3. Consumer redirected to Paystack payment page
4. Consumer completes payment
5. Paystack sends webhook to `/webhooks/paystack`
6. API verifies webhook, updates order status
7. Merchant notified via email

**Keys to configure:**
- `PAYSTACK_SECRET_KEY` — API authentication
- `PAYSTACK_PUBLIC_KEY` — Merchant identification (optional)
- `PAYSTACK_CALLBACK_URL` — Webhook endpoint

### Stripe (Fallback)

Stripe is supported as a fallback payment processor.

**Configuration:**
- `STRIPE_SECRET_KEY` — API secret
- `STRIPE_WEBHOOK_SECRET` — Webhook verification

## KYC (Know Your Customer)

Merchants must complete KYC before accepting orders.

**KYC Workflow:**
1. Merchant submits KYC form (ID, bank details)
2. Data encrypted with `KYC_ENCRYPTION_KEY` and stored
3. Admin reviews in `/dashboard/admin` → KYC Approvals
4. Admin approves or rejects
5. Merchant receives email notification
6. Upon approval, merchant can accept orders

**Encryption:** AES-256-GCM over KYC data at rest

## Analytics

Analytics are ingested as events (view, click, purchase) and stored in JSONL format.

**Event Schema:**
```json
{
  "event": "view|click|purchase",
  "hash": "product-hash",
  "anon_id": "customer-anonymous-id",
  "source_url": "referring-page",
  "timestamp": "2026-03-19T12:34:56Z"
}
```

**Storage:** Daily JSONL files in `ANALYTICS_EVENTS_DIR`
**Retention:** Configurable via `RETENTION_DAYS` (default 90 days)
**Reporting:** Aggregated via `/v1/analytics/report`

## Architecture

```
src/
├── api/
│   ├── index.ts              — Hono app setup, middleware, routing
│   ├── merchant-products.ts  — Product CRUD routes
│   ├── merchant-auth.ts      — Authentication routes
│   ├── admin-kyc.ts          — KYC approval routes
│   ├── checkout.ts           — Payment checkout routes
│   ├── webhooks.ts           — Payment webhooks
│   └── analytics.ts          — Analytics ingestion and reporting
│
├── lib/
│   ├── storage.ts            — R2 / local file storage abstraction
│   ├── analytics-report.ts   — JSONL event aggregation
│   ├── dashboard-metrics.ts  — In-memory metric calculations
│   ├── api-key-registry.ts   — Multi-key auth with revocation
│   ├── error-logger.ts       — Structured error logging
│   └── retention-policy.ts   — Analytics data lifecycle
│
├── types/
│   ├── api.ts                — API request/response types
│   ├── merchant.ts           — Merchant domain types
│   └── orders.ts             — Order domain types
│
├── middleware/
│   ├── auth.ts               — JWT and secret key validation
│   ├── rate-limit.ts         — Request rate limiting
│   └── error-handler.ts      — Error handling and formatting
│
├── index.ts                  — Application entry point
└── env.ts                    — Environment variable validation
```

## Testing

Run the test suite:

```bash
npm test                # Run all tests once
npm test:watch         # Watch mode
npm test:coverage      # Coverage report
```

Tests cover:
- Merchant auth flows (email, Google OAuth)
- Product CRUD operations
- Payment processing and webhooks
- Analytics ingestion
- KYC workflows
- Error handling

## Deployment

### Build for Production

```bash
npm run type-check   # Must pass
npm run lint         # Must pass
npm run build        # Compile to dist/
```

### Vercel Deployment

The API is deployed to Vercel as a serverless function via `api/vercel-entry.ts`.

**Deployment process:**
1. Push to `main` branch
2. Vercel auto-builds from `packages/shadow-index` root
3. Environment variables configured in Vercel dashboard
4. API available at `https://api.fairflow.co.za`

See [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md) for full deployment guide.

## Performance & Monitoring

**Targets:**
- API latency: < 500ms (p95)
- Uptime: 98%+
- Webhook processing: < 2s

**Monitoring:**
- Health checks: `/health` endpoint polled every 60s
- Error logging: Structured logs for debugging
- Analytics dashboard: `/v1/analytics/dashboard` for internal metrics

## Security

- **Passwords:** PBKDF2 with 100,000 iterations
- **JWTs:** HS256 with 7-day expiry
- **Webhooks:** HMAC signature verification (Paystack, Stripe)
- **Rate limiting:** 100 requests per minute per IP
- **CORS:** Configured for production domains only

## Troubleshooting

**Port 3000 in use?**
```bash
PORT=3001 npm run dev
```

**Paystack webhook not being received?**
- Verify `PAYSTACK_CALLBACK_URL` matches your domain
- Check webhook configuration in Paystack dashboard
- Review server logs for webhook processing errors

**Authentication errors?**
- Verify `JWT_SECRET` is set and consistent
- Check token expiry: `jwt_decode(token).exp`
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

**Analytics not appearing?**
- Verify `ANALYTICS_EVENTS_DIR` directory exists and is writable
- Check `/v1/analytics/dashboard` for event counts
- Review server logs for event processing errors

## Contributing

Please follow [docs/DEVELOPMENT-STANDARDS.md](../../docs/DEVELOPMENT-STANDARDS.md):
- TypeScript strict mode required
- ESLint pass without errors
- 80%+ test coverage on critical paths
- Conventional commit messages

## License

MIT

```bash
npm test                    # Full suite
npm test -- --run           # Single pass (no watch)
npm test -- path/to/test    # Single file
```

Test files mirror the source layout: `api/index.test.ts`, `lib/analytics-report.ts`, etc.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for deep-dive design decisions.
