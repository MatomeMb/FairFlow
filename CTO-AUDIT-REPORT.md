# CTO Audit Report
**Date:** February 22, 2026
**Auditor:** Matome Mbowene
**Scope:** Full codebase — shadow-index, auth-portal
**Verdict:** SHIP WITH CAVEATS

---

## P0 Blockers (must fix before any real merchant goes live)
None found (all P0s resolved on February 21, 2026).

## P1 High Priority (fix within Week 3)
- No open P1 transaction-integrity blockers. Re-verified on February 22, 2026:
	- KYC PII redacted from `/v1/merchant/account` responses.
	- `packages/shadow-index/data/*` untracked from git and ignored via `.gitignore`.
	- Negative restock blocked with `{ ok: false }` response.
	- Duplicate webhook replay (`/test/webhook`) returns `{ skipped: true }`.
	- Checkout is blocked at `stock_count === 0` with `409`.

## P2 Medium Priority (fix before Series A)
- Validation mismatch: frontend allows category `beauty` but API rejects it (schema lacks `beauty`), causing hard-to-debug failures. Fix: align `CreateProductSchema` enum with UI options. See [mcj/packages/shadow-index/api/merchant-products.ts](mcj/packages/shadow-index/api/merchant-products.ts#L38-L54).
- Mixed error response shapes (`err(...)` vs `{ ok: false, error }`) complicate client error handling. Fix: standardize on `{ ok: false, error, code }` across all endpoints. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1460-L1616) and [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L960-L1034).
- Console logs in API include operational details (email results, webhook warnings). Fix: route through structured logger with levels and redaction. Examples: [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1212-L1329).

## P3 Backlog (nice to have)
- `any` type holes in email notifications and thing compilation. Fix: add typed interfaces for `thing_file` and `order` payloads. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1212-L1212) and [mcj/packages/shadow-index/api/merchant-products.ts](mcj/packages/shadow-index/api/merchant-products.ts#L67-L185).

---

## Security
- Merchant/admin routes now require `SHADOW_INDEX_API_KEY` (fail-closed). Retest confirmed unauthenticated requests are blocked and authenticated requests succeed.
- Public/product routes remain accessible without API key (`/resolve/:hash`, `/checkout/create-session`, `/webhooks/stripe`).
- Dev test route `/test/webhook` is API-key protected in current config and duplicate events are idempotently skipped.
- No per-merchant authorization: `/v1/merchant/orders`, `/v1/merchant/account`, `/v1/merchant/notifications`, `/v1/merchant/payouts` return a global store with no tenant isolation. Fix: require merchant identity and filter on merchant_id. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1460-L1616).
- Stripe webhook signature is verified in non-dev paths, but dev simulations accept unsigned payloads. Ensure production requires `STRIPE_WEBHOOK_SECRET` and disables `/test/webhook`. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1312-L1392).
- `POST /v1/admin/payouts/batch` does not exist (no exposure).

## Data Integrity
- Orders persistence is now normalized to a keyed map on load and merged on save; concurrent webhook retest persisted both orders. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L295-L334).
- Products split-brain resolved: `merchant-products.json` is the source of truth and legacy `products.json` has been migrated and renamed to `products.json.migrated`.
- File concurrency: every data file uses read-modify-write without locks (`orders.json`, `notifications.json`, `merchant_accounts.json`, `payout_logs.json`, `merchant-products.json`, `index.json`). Parallel webhooks can clobber updates. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L295-L566).
- Validation gaps: many endpoints parse JSON and write directly (account patch, kyc start, notifications) without Zod validation, allowing malformed input. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1478-L1562).

## Error Handling
- Async handler count exceeds try blocks (25 async handlers vs 19 try blocks); several handlers have no try/catch and will throw on unexpected IO failures. Fix: wrap all async routes. See counts from audit script.
- No ErrorBoundary in portal (auth-portal). Fix: add global and per-route boundaries.
- Error responses are inconsistent (`err()` vs `{ ok: false, error }`). Fix: standardize.

## Code Quality
- Console logging in API: 24 instances. Some include operational details (email send results) that should be structured and redacted. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1212-L1329).
- TODO/FIXME: no critical TODOs in production code; only test temp usage.
- Type safety: multiple `any` usages remain in API and modal callback. See [mcj/packages/shadow-index/api/index.ts](mcj/packages/shadow-index/api/index.ts#L1212-L1212) and [mcj/packages/shadow-index/api/merchant-products.ts](mcj/packages/shadow-index/api/merchant-products.ts#L67-L185).

## Functional Completeness
E2E happy path results:
- Step 1: Create product — ✓ (matter_uri present)
- Step 2: Product appears in list — ✓
- Step 3: Resolve product by hash (`/resolve/:hash`) — ✓
- Step 4: Create checkout session (`/checkout/create-session`) — ✓
- Step 5: Simulated webhook (`/test/webhook` with API key + `session_id`) — ✓
- Step 6: Side effects — ✓ (orders/payouts remain single-entry per session; duplicate replay returns `{ skipped: true }`).

## Edge Cases
1. Duplicate webhook replay (`/test/webhook` with same `session_id`): second call returns `{ skipped: true }` and does not duplicate orders/payouts.
2. Stock enforcement: checkout at `stock_count === 0` now returns `409` with `This product is out of stock`.
3. Fulfill already-fulfilled order: ✓ returns ok with message "Already fulfilled".
4. Invalid webhook session_id: ✓ returns not_found.
5. Restock negative/non-positive quantity: ✓ returns `{ ok: false, error: ... }`.

## Performance Baseline
- orders.json: 8.3KB | 11 records
- notifications.json: 8.8KB | 14 records
- merchant_accounts.json: 0.5KB | 12 records
- payout_logs.json: 4.3KB | 14 records
- merchant-products.json: 6.1KB | 7 records
- products.json.migrated: 3.7KB | 4 records
- `/v1/merchant/orders` avg latency: 25ms | max: 153ms

---

## Recommended Week 3 fixes (in priority order)
1. Add per-merchant authorization and tenancy scoping for merchant endpoints.
2. Add frontend ErrorBoundaries across portal entry points.
3. Normalize API error shapes (`err(...)` vs `{ ok: false, error }`) for client consistency.
