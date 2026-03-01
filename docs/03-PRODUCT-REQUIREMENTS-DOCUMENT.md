# Product Requirements Document

High-level functional and non-functional requirements for fairflow.

---

## Functional Requirements

### Core Pipeline

- Compile product JSON to verifiable .thing artifact (content-addressed by SHA-256)
- Resolve hash via API to gist (title, price, image, checkout URL)
- Display product in browser extension overlay and auth-portal
- Support matter:// URI protocol

### Commerce

- Stripe checkout integration
- Merchant-of-Record (MoR) with commission calculation
- Order fulfillment workflow
- Payout release (admin)

### Analytics

- View and click event ingestion
- Aggregated reporting by date and hash
- Internal observability dashboard

### Auth

- Merchant: password + Google OAuth, JWT sessions
- Portal: Supabase Auth, role-based access (CEO, CTO, merchant, investor, consumer)
- API: key-based access with optional revocation

---

## Non-Functional Requirements

- Resolve latency: under 500ms (p95)
- Uptime: 95%+ for beta
- Storage: local JSON (dev), Cloudflare R2 (prod)
- Browser support: Chrome (extension), modern browsers (portal)

---

## Out of Scope (Current Phase)

- Mobile apps
- Blockchain integration
- Multi-currency beyond ZAR
- Enterprise SSO
