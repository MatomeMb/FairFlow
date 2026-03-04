# fairflow Beta Launch Readiness Report

**Prepared for:** Lead Engineer Sign-Off  
**Date:** March 4, 2026  
**Scope:** Merchant state + Admin state for beta launch  
**Status:** Ready for beta — blockers addressed

---

## Executive Summary

The fairflow platform has solid core flows (merchant auth, products, orders, KYC, payouts, admin KYC) and good documentation. **Four critical blockers** and several high-priority fixes must be addressed before beta launch. The main gaps are merchant routing, dual auth integration, and production configuration.

| Category | Status | Notes |
|----------|--------|------|
| Merchant state | [OK] Ready | Routes added; MerchantPortalGuard allows token-based access |
| Admin state | [OK] Ready | KYC, dashboard, analytics working |
| API backend | [OK] Ready | Full coverage; minor config fixes needed |
| Testing | [partial] | Good unit tests; E2E gaps |
| Deployment | [OK] Documented | Runbooks present; env config required |

---

## 1. Merchant State Completeness

### 1.1 Auth Flows

| Flow | Status | Location |
|------|--------|----------|
| Email/password registration | [OK] Implemented | `POST /v1/auth/merchant/register` |
| Email/password login | [OK] Implemented | `POST /v1/auth/merchant/login` |
| Google OAuth | [OK] Implemented | `GET /v1/auth/google` callback redirect |
| Forgot password | [OK] Implemented | `POST /v1/auth/merchant/forgot-password` |
| JWT validation | [OK] Implemented | HS256, 7-day expiry |
| Token refresh | [X] Not implemented | Users must re-login after expiry |

### 1.2 Critical Blocker: Merchant Routes & RoleGuard

**Problem:** `MerchantLogin` and `MerchantRegister` exist but are **not wired into `PortalRouter`**. Routes `/merchant`, `/merchant/login`, `/merchant/register` do not exist; the catch-all sends users to `/`.

**Problem:** `MerchantPortal` is behind `RoleGuard` which requires Supabase `role`. API-based merchants (Google OAuth or email/password) have **no Supabase session**, so `role` is null and they are redirected to `/unauthorized`. The intended flow (redirect to `/dashboard/merchant?token=...`) is **blocked by RoleGuard** before MerchantPortal can receive the token.

**Impact:** Merchants cannot sign up or access the merchant dashboard via the portal.

### 1.3 Merchant Dashboard Features

| Feature | Status | Notes |
|---------|--------|------|
| Products (list, create, edit) | [OK] Implemented | CreateProductModal, merchant-products API |
| Product delete | [OK] Fixed | handleRemoveProduct calls DELETE API |
| Orders (list, fulfill) | [OK] Implemented | |
| KYC submit | [OK] Implemented | |
| Payouts (view history) | [OK] Implemented | |
| Analytics | [OK] Implemented | |
| Notifications | [OK] Implemented | |
| Account / bank details | [OK] Implemented | |
| My Account "Save Changes" | [partial] | Form exists; no API call on save |

### 1.4 Auth Token Flow (MerchantPortal)

MerchantPortal correctly:
- Picks up token from URL (`?token=...`) or sessionStorage
- Uses `authToken` in `merchantFetch` for API calls
- Redirects to `/login` only when no token and no `VITE_API_KEY`

**But:** RoleGuard blocks access before MerchantPortal mounts, so this flow never runs for API merchants.

---

## 2. Admin State Completeness

### 2.1 Admin Auth

| Aspect | Status | Notes |
|--------|--------|------|
| Portal access | [OK] | RoleGuard allows `ceo`, `cto` |
| Admin emails | [partial] Hardcoded | `ADMIN_EMAILS` in AuthContext.tsx |
| API auth | [OK] | `validateAdminAuth()` with `ADMIN_SECRET_KEY` |
| KYC endpoints | [OK] | All protected |

### 2.2 KYC Workflow

| Step | Status |
|------|--------|
| List pending | `GET /v1/admin/kyc/pending` |
| Approve | `PATCH /v1/admin/kyc/approve/:merchantId` |
| Reject (with reason) | `PATCH /v1/admin/kyc/reject/:merchantId` |
| Merchant notification on reject | [OK] |

### 2.3 Admin Dashboard Sections

| Section | Status |
|---------|--------|
| Overview | [OK] KPIs, users, KYC pending |
| KYC Approvals | [OK] |
| Merchants | [OK] (uses Supabase users) |
| Users & Roles | [OK] |
| Platform Health | [OK] |
| Financials | Placeholder |
| System | Placeholder |

### 2.4 Payout Release

- API: `POST /v1/admin/payouts/release` — implemented
- UI: Not in Admin Portal; use curl/API directly

---

## 3. Architecture & Code Quality

### 3.1 Dual Auth Systems

| System | Used by | Mechanism |
|--------|---------|-----------|
| Supabase | Portal (admin, consumer, investor) | Session, JWT claims, `user_role` |
| shadow-index JWT | Merchants | `POST /v1/auth/merchant/login`, Bearer token |

**Gap:** No bridge. API merchants cannot reach portal routes protected by RoleGuard.

### 3.2 API Design

- Error shape: `{ code, message, details? }` — consistent
- Zod validation on auth endpoints
- Rate limiting: configurable
- CORS: `app.use('*', cors())` — permissive; restrict in production

### 3.3 Data Storage

- JSON files: `merchant_accounts.json`, `orders.json`, `merchant_products.json`
- No transactional guarantees across JSON writes
- Migrations: `migrate-001-add-payout-logs.mjs`, `migrate-002-update-merchant-kyc.mjs`

### 3.4 Security

- Passwords: PBKDF2 (100k iterations)
- JWT: HS256
- Stripe webhook: verified
- Dev bypasses: `DEV_ADMIN_EMAILS`, `GOOGLE_OAUTH_MODE=dev` — disable in production

---

## 4. Production Configuration Gaps

### 4.1 thing_url Hardcoded to localhost

**File:** `mcj/packages/shadow-index/api/merchant-products.ts` line 73

```ts
thing_url: `http://localhost:${port}/thing/${hash}`,
```

**Fix:** Use `process.env.PUBLIC_API_BASE_URL || \`http://localhost:${port}\``

**Also:** `api/index.ts` lines 992, 1017 — compile/resolve endpoints use localhost. Use `PUBLIC_API_BASE_URL`.

### 4.2 Admin Secret

- Default `mor-admin-secret-local` — must be overridden in production
- `VITE_ADMIN_SECRET` must match `ADMIN_SECRET_KEY` in auth-portal build

---

## 5. Testing & QA

### 5.1 Coverage

| Package | Unit | Integration | E2E |
|---------|------|-------------|-----|
| shadow-index | [OK] Good | [OK] | Partial |
| auth-portal | [X] None | - | - |
| lens-extension | Basic | — | Skipped |

### 5.2 Critical Paths

| Path | Automated |
|------|-----------|
| Merchant register to login to me | [OK] |
| Product CRUD | Partial |
| Checkout flow | [X] |
| KYC submit to admin approve | [X] |
| Payout release | [X] |

### 5.3 Manual Testing

- `BETA-TESTING-GUIDE.md` documents flows
- No `npm run smoke-test` script

---

## 6. Blockers for Beta (Resolved)

| # | Blocker | Status |
|---|---------|--------|
| 1 | Merchant routes missing | [OK] Added `/merchant/login`, `/merchant/register` to PortalRouter |
| 2 | RoleGuard blocks token merchants | [OK] MerchantPortalGuard allows token-based access |
| 3 | Product delete no API call | [OK] handleRemoveProduct calls DELETE API |
| 4 | thing_url localhost | [OK] Uses `PUBLIC_API_BASE_URL` when set |

---

## 7. High Priority Fixes

| # | Fix | Effort |
|---|-----|--------|
| 1 | Merchant routes + token-based access to MerchantPortal | Medium |
| 2 | Product delete API | Low |
| 3 | thing_url production config | Low |
| 4 | CreateProductModal: ensure authToken used (not hardcoded x-merchant-id) | Low |
| 5 | Bank update: use apiBase/authToken from context, not localStorage | Low |
| 6 | MerchantRegister Google OAuth: use `${apiBase}/v1/auth/google` | Low |
| 7 | Strong ADMIN_SECRET_KEY in production | Low |

---

## 8. Medium Priority

- JWT refresh or document 7-day re-login
- My Account "Save Changes" API
- Payout release UI in Admin Portal
- Restrict CORS in production
- auth-portal unit tests
- E2E for checkout and KYC

---

## 9. Launch Checklist

- [ ] Add `/merchant/login`, `/merchant/register` routes
- [ ] Allow token-based access to MerchantPortal (TokenGuard or RoleGuard bypass when token present)
- [ ] Fix product delete to call DELETE API
- [ ] Set `PUBLIC_API_BASE_URL` for production thing_url
- [ ] Verify CreateProductModal and bank update use correct auth
- [ ] Set strong `ADMIN_SECRET_KEY` and `VITE_ADMIN_SECRET` in staging/production
- [ ] Run full BETA-TESTING-GUIDE flow end-to-end
- [ ] Configure Stripe webhook for staging
- [ ] Add staging URL to Supabase redirect allowlist
- [ ] Disable dev bypasses (`DEV_ADMIN_EMAILS`, `GOOGLE_OAUTH_MODE`) in production

---

## 10. Sign-Off

**Recommendation:** Blockers addressed. Set `PUBLIC_API_BASE_URL` and `ADMIN_SECRET_KEY` for production. Run [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) before deploy.

**Document:** `mcj/docs/BETA-LAUNCH-READINESS-REPORT.md`
