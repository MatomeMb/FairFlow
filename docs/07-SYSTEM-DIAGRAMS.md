# System Diagrams

UML and system architecture diagrams showing platform topology, authentication flows, and order processing. See [02-TECHNICAL-ARCHITECTURE.md](./02-TECHNICAL-ARCHITECTURE.md) for narrative description.

---

## Platform Architecture

High-level view of all system components and data flows.

```mermaid
graph TB
    Consumer["👤 Consumer<br/>(Anonymous)"]
    ProductPage["🛍️ Product Page<br/>(fairflow.co.za)"]
    MerchantPortal["👨‍💼 Merchant Portal<br/>(React/auth-portal)"]
    AdminPortal["⚙️ Admin Portal<br/>(React/auth-portal)"]
    
    ShadowAPI["🔌 Shadow Index API<br/>(Hono/Node.js)<br/>Vercel Serverless"]
    AuthService["🔐 Authentication<br/>(Supabase Auth)"]
    Database["💾 Supabase DB<br/>(PostgreSQL)"]
    Storage["☁️ Storage<br/>(Cloudflare R2)"]
    PayStack["💳 PayStack<br/>(Payments)"]
    Resend["📧 Resend<br/>(Email)"]
    Sumsub["🪪 Sumsub<br/>(KYC)"]
    
    Consumer -->|View Product| ProductPage
    ProductPage -->|POST /analytics/event| ShadowAPI
    ProductPage -->|GET /v1/merchant/*| ShadowAPI
    
    Consumer -->|Checkout| ShadowAPI
    ShadowAPI -->|Verify Payment| PayStack
    PayStack -->|Webhook| ShadowAPI
    
    MerchantPortal -->|Login| AuthService
    MerchantPortal -->|Merchant API| ShadowAPI
    MerchantPortal -->|Fetch Analytics| ShadowAPI
    
    AdminPortal -->|Admin Login| AuthService
    AdminPortal -->|Admin API| ShadowAPI
    
    ShadowAPI -->|Read/Write| Database
    ShadowAPI -->|Store Files| Storage
    ShadowAPI -->|Transactional email| Resend
    ShadowAPI -->|KYC webhooks / SDK| Sumsub
    AuthService -->|User/Role Data| Database
    
    style Consumer fill:#e1f5ff
    style ProductPage fill:#fff3e0
    style MerchantPortal fill:#f3e5f5
    style AdminPortal fill:#f3e5f5
    style ShadowAPI fill:#e8f5e9
    style AuthService fill:#fce4ec
    style Database fill:#f1f8e9
    style Storage fill:#f1f8e9
    style PayStack fill:#ffe0b2
    style Resend fill:#e3f2fd
    style Sumsub fill:#fff8e1
```

**API structure:** Cross-cutting layers live under `packages/shadow-index/api/middleware/` and `api/shared/`; route handlers are composed from `api/index.ts` (see `docs/adr/ADR-001-api-framework.md`).

### Shadow Index API route modules (composition root)

```mermaid
graph TB
    subgraph "packages/shadow-index/api"
        IDX["index.ts\ncomposition root"]
        IDX --> AUTH["routes/auth.ts\n/v1/auth/*"]
        IDX --> MERCH["routes/merchant.ts\n/v1/merchant/*"]
        IDX --> PROD["merchant-products.ts\n/v1/merchant/products/*"]
        IDX --> ADMIN["routes/admin.ts\n/v1/admin/*"]
        IDX --> PROXY["routes/admin-proxy.ts\n/v1/admin-proxy/*\n(Supabase session auth)"]
        IDX --> CHECKOUT["routes/checkout.ts\n/checkout/*"]
        IDX --> WEBHOOKS["routes/webhooks.ts\n/webhooks/*"]
        IDX --> ANALYTICS["routes/analytics.ts\n/v1/analytics/*"]
        IDX --> COMPILER["routes/compiler.ts\n/compile /resolve /thing"]
        IDX --> SCHED["routes/scheduler.ts\n/v1/cron/*"]
        IDX --> PLATFORM["routes/platform.ts\nGET / and /health"]
    end
```

### Services layer (selected)

```mermaid
graph LR
    subgraph "api/services/"
        KYC["admin-kyc-service.ts"]
        PAYOUT["admin-payout-service.ts"]
        COMMERCE["commerce-store.ts"]
        PAYSTACK["paystack-client.ts"]
        FLOW["paystack-order-flow.ts"]
    end
```

**Components:**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Consumer Shop** | Static/Vite SPA | Public-facing product browsing |
| **Merchant Portal** | React/Vite + Supabase | Merchant dashboard (login, products, analytics, KYC) |
| **Admin Portal** | React/Vite + Supabase | Admin panel (user management, platform metrics) |
| **Shadow Index API** | Node.js/Hono on Vercel | Business logic: auth, products, orders, payments, analytics |
| **Supabase Auth** | PostgreSQL + Row-Level Security | User authentication (email/password, Google OAuth) |
| **PostgreSQL Database** | RLS Policies | Merchants, products, orders, KYC, payouts, events |
| **Cloudflare R2** | S3-compatible Object Storage | Product catalogs (CSV), compiled .thing files, exports |
| **PayStack** | Payment Gateway | Credit card processing, webhook notifications |
| **Resend** | Email API | Order and KYC notifications from shadow-index |
| **Sumsub** | Identity verification | KYC applicant flow and webhooks |

---

## Authentication Flow (OAuth + JWT)

Sequence diagram for user authentication via Google OAuth and JWT session management.

```mermaid
sequenceDiagram
    participant Consumer as Consumer
    participant AuthPortal as Auth Portal<br/>(React)
    participant SupabaseAuth as Supabase Auth
    participant GoogleOAuth as Google OAuth
    participant ShadowAPI as Shadow API
    participant Database as Database
    
    Consumer->>AuthPortal: Click "Login with Google"
    AuthPortal->>SupabaseAuth: signInWithOAuth('google')
    SupabaseAuth->>GoogleOAuth: Initiate OAuth flow
    GoogleOAuth->>Consumer: Redirect to Google login
    Consumer->>GoogleOAuth: Authenticate + Consent
    GoogleOAuth->>SupabaseAuth: Return auth code + email
    SupabaseAuth->>SupabaseAuth: Create/Update user
    SupabaseAuth->>AuthPortal: Return JWT + Session
    AuthPortal->>AuthPortal: Store JWT in localStorage
    
    Consumer->>ShadowAPI: GET /v1/merchant/products<br/>Header: Authorization: Bearer JWT
    ShadowAPI->>ShadowAPI: Verify JWT signature
    ShadowAPI->>Database: Query user_id from JWT
    Database->>ShadowAPI: User metadata
    ShadowAPI->>ShadowAPI: RLS: Filter products<br/>by user's merchant_id
    ShadowAPI->>Consumer: [UserProducts]
    
    Note over Consumer,Database: JWT expires after 1 hour<br/>Refresh token stored in Supabase session
```

**Key Points:**

- **Google OAuth:** Merchants and admins authenticate via Google; single sign-on
- **JWT Tokens:** Short-lived (1 hour), verified on every API request
- **Row-Level Security:** PostgreSQL RLS policies ensure merchants only see their own data
- **Session Management:** Supabase handles token refresh automatically via session management

---

## Merchant Order Flow

End-to-end flow: Product view → Checkout → Payment → Fulfillment.

```mermaid
sequenceDiagram
    participant Consumer as 👤 Consumer
    participant Shop as 🛍️ Product Page
    participant ShadowAPI as 🔌 Shadow API
    participant PayStack as 💳 PayStack
    participant Merchant as 👨‍💼 Merchant
    
    Consumer->>Shop: View product<br/>(hash: abc123)
    Shop->>ShadowAPI: POST /v1/analytics/event<br/>{"event":"view", "hash":"abc123"}
    ShadowAPI->>ShadowAPI: Append to JSONL
    
    Consumer->>Shop: Click "Buy Now"
    Shop->>ShadowAPI: POST /v1/analytics/event<br/>{"event":"click", "hash":"abc123"}
    Shop->>ShadowAPI: GET /v1/merchant/product/abc123<br/>(Fetch price, merchant_id)
    ShadowAPI->>ShadowAPI: Lookup product metadata
    ShadowAPI->>Shop: {product_id, merchant_id, price}
    
    Shop->>Consumer: Show checkout form
    Consumer->>Shop: Enter email, name, quantity
    Shop->>ShadowAPI: POST /checkout<br/>{merchant_id, product_id, amount_cents}
    ShadowAPI->>ShadowAPI: Create Order record<br/>(status: pending)
    ShadowAPI->>Shop: {reference}
    
    Shop->>PayStack: Initialize transaction<br/>{reference, amount_cents, email}
    PayStack->>Consumer: Show payment form
    Consumer->>PayStack: Enter card details
    PayStack->>PayStack: Process payment
    PayStack->>Shop: Redirect to success page<br/>(reference)
    
    Shop->>ShadowAPI: GET /checkout/verify?ref=xyz
    ShadowAPI->>PayStack: Verify payment status
    PayStack->>ShadowAPI: {status: success, amount}
    ShadowAPI->>ShadowAPI: Update Order<br/>(status: completed)
    ShadowAPI->>ShadowAPI: POST /v1/analytics/event<br/>{"event":"purchase", merchant_id, order_id, amount_cents}
    ShadowAPI->>Shop: {status: success, order_id}
    
    Shop->>Consumer: Show confirmation<br/>(Order ID, receipt)
    ShadowAPI->>Merchant: Email notification<br/>(New order received)
    Merchant->>Merchant: Log in, view order in dashboard
    Merchant->>ShadowAPI: PATCH /v1/merchant/order/:id<br/>{status: fulfilled}
    
    Note over Consumer,Merchant: Order lifecycle complete<br/>Analytics recorded for all events<br/>Merchant can view in dashboard
```

**Event Timeline:**

| Step | Event | Recorded? |
|------|-------|-----------|
| 1 | Consumer views product | ✅ view event |
| 2 | Consumer clicks Buy Now | ✅ click event |
| 3 | Order created (pending) | — |
| 4 | Payment initiation | — |
| 5 | Payment success | ✅ purchase event (includes merchant_id, order_id, amount) |
| 6 | Order marked fulfilled | — |

**Data Models Created:**

```
Order:
  - id (UUID)
  - merchant_id (FK)
  - product_id (FK)
  - customer_email
  - amount_cents
  - currency
  - status (pending → completed → fulfilled)
  - paystack_reference
  - created_at
  - updated_at

AnalyticsEvent:
  - event (view|click|purchase)
  - hash (product identifier)
  - anon_id (consumer session)
  - merchant_id (on purchase only)
  - order_id (on purchase only)
  - amount_cents (on purchase only)
  - timestamp
```

---

## KYC (Know Your Customer) Flow

Merchant account verification for payout eligibility.

```mermaid
graph LR
    MerchantSignup["Merchant Signs Up"]
    PortalDashboard["Merchant Portal<br/>Dashboard"]
    KYC_Form["Complete KYC Form<br/>(ID, Tax #, Bank)"]
    Submit["Submit for Review"]
    AdminReview["Admin Review<br/>Documents"]
    Approved["Approved/<br/>Rejected"]
    Payouts["Enabled for<br/>Payouts"]
    Failed["Resubmit or<br/>Account Closed"]
    
    MerchantSignup -->|OAuth Login| PortalDashboard
    PortalDashboard -->|Status: Pending KYC| KYC_Form
    KYC_Form -->|Fields: ID, Tax, Bank, Account| Submit
    Submit -->|POST /v1/merchant/kyc| AdminReview
    AdminReview -->|Verify documents| Approved
    Approved -->|Status: Approved| Payouts
    Approved -->|Status: Rejected| Failed
    Failed -->|Update form fields| KYC_Form
    
    style MerchantSignup fill:#e1f5ff
    style PortalDashboard fill:#f3e5f5
    style KYC_Form fill:#fff3e0
    style AdminReview fill:#f1f8e9
    style Approved fill:#c8e6c9
    style Payouts fill:#c8e6c9
    style Failed fill:#ffcdd2
```

**KYC Fields:**

```json
{
  "id_type": "national_id|passport|drivers_license",
  "id_number": "string",
  "id_expiry_date": "2028-12-31",
  "tax_number": "string (SARS TAX ID)",
  "bank_account_number": "string",
  "bank_account_holder": "string",
  "bank_code": "string",
  "business_registration": "optional",
  "status": "pending|approved|rejected",
  "rejection_reason": "optional",
  "submitted_at": "2026-03-19T12:00:00Z",
  "reviewed_at": "optional"
}
```

---

## Analytics Data Pipeline

How events flow from ingestion to merchant dashboard.

```mermaid
graph LR
    Event["Consumer Event<br/>(view/click/purchase)"]
    Ingest["POST /v1/analytics/event"]
    Validation["Validate<br/>Schema"]
    Store["Append to<br/>JSONL File<br/>(daily paritioned)"]
    MerchantQuery["Merchant Requests<br/>Report"]
    Aggregate["Aggregate<br/>Events<br/>(in-memory)"]
    Dashboard["Display in<br/>Merchant Dashboard"]
    
    Event -->|JSON payload| Ingest
    Ingest -->|Field validation| Validation
    Validation -->|Passed| Store
    Validation -->|Failed| Reject["Return 400<br/>Bad Request"]
    Store -->|data/events/YYYY-MM-DD.jsonl| MerchantQuery
    MerchantQuery -->|GET /v1/analytics/report| Aggregate
    Aggregate -->|Group by date/event| Dashboard
    
    style Event fill:#e1f5ff
    style Ingest fill:#e8f5e9
    style Validation fill:#fff3e0
    style Store fill:#f1f8e9
    style Dashboard fill:#f3e5f5
    style Reject fill:#ffcdd2
```

**Key Characteristics:**

- **Write-once:** Events only appended, never updated
- **Daily partitioning:** Immutable daily JSONL files
- **Stateless aggregation:** Reports computed on-demand from raw events
- **No indexes:** Suitable for < 1M events/day; scale to database for larger volume

---

## Data at Rest - Storage Layout

```
fairflow/
├── data/
│   ├── events/
│   │   ├── 2026-03-19.jsonl         (latest events)
│   │   ├── 2026-03-18.jsonl
│   │   └── ...
│   ├── merchants.json               (merchant metadata)
│   ├── products.json                (product catalog)
│   ├── orders.json                  (order records)
│   ├── kyc_records.json             (KYC submissions)
│   └── payout_logs.json             (admin audit trail)
│
├── data/uploads/
│   ├── catalogs/
│   │   ├── merchant-uuid-1.csv      (uploaded product catalogs)
│   │   └── ...
│   └── kyc_docs/                    (KYC document uploads - binary)
│
├── compiled/
│   ├── product-hash-abc123.thing.bin (compiled .thing binaries)
│   └── ...
```

**Storage Backends:**

- **Local Development:** `data/` directory (file system)
- **Production:** Cloudflare R2 (S3-compatible object storage)

---

## Deployment Architecture

How the system is deployed across cloud providers.

```mermaid
graph TB
    subgraph "Vercel"
        AuthPortal["Auth Portal<br/>(React SPA)"]
        ShadowAPI["Shadow API<br/>(Hono Serverless)"]
    end
    
    subgraph "Supabase"
        Auth["Supabase Auth<br/>(Managed Auth)"]
        PostgreSQL["PostgreSQL<br/>(Managed DB)"]
    end
    
    subgraph "Cloudflare"
        R2["R2 Storage<br/>(Object Storage)"]
        DNS["DNS + CDN<br/>(fairflow.co.za)"]
    end
    
    PayStack["PayStack API<br/>(External)"]
    
    GitHub["GitHub Repo<br/>(Source)"]
    
    GitHub -->|Deploy Push| ShadowAPI
    GitHub -->|Deploy Push| AuthPortal
    
    AuthPortal -->|HTTPS| DNS
    ShadowAPI -->|HTTPS| DNS
    
    AuthPortal -->|Auth Requests| Auth
    ShadowAPI -->|Auth Requests| Auth
    ShadowAPI -->|SQL Queries| PostgreSQL
    ShadowAPI -->|API Calls| PayStack
    ShadowAPI -->|S3 API| R2
    
    style GitHub fill:#f5f5f5
    style Vercel fill:#000000,color:#fff
    style Supabase fill:#2eca89,color:#000
    style Cloudflare fill:#f38020,color:#fff
    style PayStack fill:#ffe0b2
```

**Deployment Characteristics:**

- **Vercel:** Auto-deploys on `git push` to main
- **Supabase:** Hosted PostgreSQL + managed authentication
- **Cloudflare R2:** S3-compatible object storage, automatic failover
- **PayStack:** Third-party payment processor (webhook callbacks)

---

## See Also

- [02-TECHNICAL-ARCHITECTURE.md](./02-TECHNICAL-ARCHITECTURE.md) — Detailed narrative description
- [03-PRODUCT-REQUIREMENTS-DOCUMENT.md](./03-PRODUCT-REQUIREMENTS-DOCUMENT.md) — Feature specifications
- [20-SECURITY-HARDENING.md](./20-SECURITY-HARDENING.md) — Security architecture and data protection

---

## Component Diagram

- matter-core: Rust compiler
- shadow-index: Node.js/Hono API (`api/index.ts` composes `routes/*` and `middleware/*`)
- auth-portal: React/Vite
- lens-extension: Chrome MV3
