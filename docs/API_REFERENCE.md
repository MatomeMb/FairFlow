# API Reference

Base URLs:

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:3000` |
| Production | Configure via `PUBLIC_API_BASE_URL` (e.g. `https://api.fairflow.co.za`) |

Machine-readable spec: [`packages/shadow-index/openapi.yaml`](../packages/shadow-index/openapi.yaml)

Unless noted, JSON request/response bodies use `Content-Type: application/json`.

---

## Conventions

### Success

```json
{ "ok": true, "data": {} }
```

Some legacy/health routes return flat objects without `ok`.

### Error

```json
{
  "ok": false,
  "error": "Human readable message",
  "code": "OPTIONAL_STABLE_CODE"
}
```

### Auth headers

| Header | When |
|--------|------|
| `Authorization: Bearer <merchant_jwt>` | Merchant routes |
| `Authorization: Bearer <supabase_access_token>` | `/v1/admin-proxy/*` |
| `Authorization: Bearer <ADMIN_SECRET_KEY>` | `/v1/admin/*` |
| `x-api-key: <SHADOW_INDEX_API_KEY>` | Key-protected routes |

---

## Health & platform

### `GET /health`

**Purpose:** Liveness  
**Auth:** None  

**Response `200`:**

```json
{
  "status": "ok",
  "service": "shadow-index",
  "company": "fairflow",
  "version": "0.6.0",
  "timestamp": "2026-03-19T12:00:00.000Z"
}
```

### `GET /`

**Purpose:** Service metadata  
**Auth:** None  

---

## Auth — merchants

### `POST /v1/auth/merchant/register`

**Purpose:** Create merchant account  
**Auth:** None (may still require API key depending on middleware config)

**Request:**

```json
{
  "business_name": "Demo Coffee Co",
  "email": "merchant@example.com",
  "password": "Str0ng-Pass-Here"
}
```

**Validation:** email format, password minimum length, non-empty business name  

**Response `201/200`:** merchant profile + JWT  

**Errors:** `400` validation, `409` email taken  

### `POST /v1/auth/merchant/login`

**Purpose:** Password login  
**Auth:** None  

**Request:**

```json
{
  "email": "merchant@example.com",
  "password": "Str0ng-Pass-Here"
}
```

**Errors:** `401` invalid credentials  

### `POST /v1/auth/merchant/refresh`

**Purpose:** Refresh session token  
**Auth:** Valid refresh/access per implementation  

### `GET /v1/auth/merchant/me`

**Purpose:** Current merchant profile  
**Auth:** Merchant JWT  

### `GET /v1/auth/google`

**Purpose:** Start Google OAuth  
**Auth:** None  

### `GET /v1/auth/google/callback`

**Purpose:** OAuth callback; issues merchant session  
**Auth:** Google authorization code  

---

## Merchant catalog

### `GET /v1/merchant/products`

**Purpose:** List products for authenticated merchant  
**Auth:** Merchant JWT (+ API key if required)  

### `POST /v1/merchant/products`

**Purpose:** Create product  
**Auth:** Merchant JWT  

**Request (example):**

```json
{
  "title": "Single Origin Coffee",
  "price_cents": 12500,
  "currency": "ZAR",
  "status": "active",
  "stock_count": 50,
  "category": "beverages"
}
```

### `GET /v1/merchant/products/:id`

### `PATCH /v1/merchant/products/:id`

### `DELETE /v1/merchant/products/:id`

**Auth:** Merchant JWT; must own resource  

**Errors:** `401`, `403`, `404`, `400`  

---

## Merchant operations

Mounted primarily from `routes/merchant.ts` (orders, KYC, payouts, notifications, uploads).

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/v1/merchant/orders` | List orders | Merchant JWT |
| PATCH | `/v1/merchant/orders/:id` | Update fulfillment | Merchant JWT |
| POST | `/v1/merchant/kyc/*` | Start/submit KYC | Merchant JWT |
| GET | `/v1/merchant/notifications` | List notifications | Merchant JWT |
| GET/POST | payout-related routes | Payout eligibility / request | Merchant JWT |

Exact paths: see OpenAPI and `api/routes/merchant.ts`.

---

## Checkout & payments

### `POST /checkout/create-session`

**Purpose:** Start Paystack checkout for a product  
**Auth:** Typically public/consumer with API key rules per middleware  

**Request (illustrative):**

```json
{
  "product_id": "…",
  "customer_email": "customer@example.com",
  "quantity": 1,
  "delivery_address": {
    "name": "Demo Customer",
    "line1": "100 Example Street",
    "city": "Cape Town",
    "postal_code": "8001",
    "phone": "+27000000000"
  }
}
```

**Response:** payment URL / reference  

**Errors:** `400` validation, `404` product, `502` provider  

### `POST /webhooks/paystack`

**Purpose:** Payment confirmation  
**Auth:** `x-paystack-signature` HMAC  

**Possible errors:** `401` bad signature, `400` bad payload  

---

## Analytics

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/v1/analytics/event` | Ingest view/click/purchase | Per allowlist / API key |
| GET | `/v1/analytics/report` | Aggregated merchant report | Merchant JWT |
| GET | `/v1/analytics/dashboard` | Ops HTML dashboard | Admin / key allowlist |

Event schema: [ANALYTICS-EVENT-SCHEMA.md](./ANALYTICS-EVENT-SCHEMA.md)

---

## Admin

### ` /v1/admin/*`

**Auth:** `Authorization: Bearer <ADMIN_SECRET_KEY>`  

KYC queue, payout release, retention/cron helpers.

### ` /v1/admin-proxy/*`

**Auth:** Supabase staff JWT with CEO/CTO role  

Same business operations without exposing admin secret to browsers.

---

## Compiler / resolution

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/compile` | Compile product → `.thing` |
| GET | `/resolve/:hash` | Resolve metadata by hash |
| GET | `/thing/:hash` | Fetch artifact |
| POST | `/batch` or catalog import | Batch compile/import |

---

## Scheduler

### `POST /v1/cron/order-checkins`

**Auth:** Cron secret / admin configuration  
**Purpose:** Background order follow-ups  

---

## Rate limiting

Configurable via:

```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

Exceeded limits → `429`.

See [adr/ADR-006-rate-limiting.md](./adr/ADR-006-rate-limiting.md).

---

## Versioning

- URL prefix `/v1` for stable product APIs  
- Breaking changes require version bump or documented migration in [CHANGELOG.md](../CHANGELOG.md)  
