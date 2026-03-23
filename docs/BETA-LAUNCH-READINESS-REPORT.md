# fairflow — Beta launch readiness

**Audience:** Engineering and operations  
**Last updated:** March 2026  
**Scope:** Merchant portal, consumer checkout, admin operations, API (`packages/auth-portal`, `packages/shadow-index`)

---

## Executive summary

The platform is **ready for a closed beta** once production configuration is verified and a **single manual end-to-end run** completes without regressions. Automated checks in-repo (`auth-portal` unit tests, `shadow-index` tests) should pass on the release commit.

---

## What is verified in code (high level)

| Area | Status |
|------|--------|
| Merchant access | `/merchant/login`, `/merchant/register`; `MerchantPortalGuard` allows JWT-backed merchant sessions without requiring a Supabase `merchant` role for the dashboard shell. |
| Merchant JWT | Issued by shadow-index; **refresh** supported via `POST /v1/auth/merchant/refresh` (client refreshes proactively). |
| Products | Create flow sends **`price_cents`** (integer); listing uses **soft archive** (`status: archived`); public thing JSON / product page hide checkout when archived or out of stock. |
| Checkout | Server returns **409** when product is archived or out of stock before Paystack session creation; stock decrement on successful payment is guarded in the webhook path. |
| Portable links | **`matter://`** URI and HTTPS product link surfaced in merchant product list with copy actions where compilation succeeded. |
| Admin portal | KYC queue maps API **snake_case** to UI fields; **KYC / payouts** use **`/v1/admin-proxy/*`** with the Supabase **`Authorization`** bearer. **Payouts** may still send **`x-api-key`** when the API enforces a public API key on other routes. |
| Theming | Dark shell / no white flash on load (inline HTML + global CSS). |
| Documentation | User manuals **v1.1** in `docs/manuals/`; optional errata file for engineering deltas. |

---

## Configuration required for production / staging

Align these before external testers use the live stack:

| Concern | Frontend (e.g. Vercel) | Backend (API) |
|--------|-------------------------|----------------|
| API base | `VITE_API_BASE_URL` | `PUBLIC_API_BASE_URL` (thing URLs, callbacks) |
| Shadow Index access | `VITE_API_KEY` must match a registered key when enforced | `SHADOW_INDEX_API_KEY` / `SHADOW_INDEX_API_KEYS` |
| Staff admin (KYC queue, payouts UI) | Supabase session only; calls `/v1/admin-proxy/*` | `SUPABASE_SERVICE_KEY`, `SUPABASE_URL`; CEO/CTO in `user_roles` |
| Server-only admin/cron | — | `ADMIN_SECRET_KEY` for `/v1/admin/*` (not in any `VITE_*` build) |
| Paystack | — | `PAYSTACK_*`, webhook URL, callback URL |
| Supabase | `VITE_SUPABASE_*` | Redirect allowlists for auth |

**Smoke check (admin):** Open **KYC Approvals** or **Payouts** on the live admin portal while signed in as CEO/CTO. If the list returns **401** or **403**, confirm the user has the correct `user_roles` row and the API has valid `SUPABASE_*` service configuration. If merchant or public calls fail with **401**, confirm `VITE_API_KEY` matches the backend key registry when API keys are required.

---

## Known limitations (acceptable for beta)

- **Admin — Merchants:** Read-only stub (IDs / roles), not a full CRM.
- **Admin — Users & Roles:** Driven by Supabase `user_roles`; visibility depends on **RLS** policies — validate in staging.
- **Admin — Financials / System:** Placeholder sections.
- **Admin — Header bell:** Disabled with an explicit **coming soon** accessible label (no notifications product in admin yet).

---

## Final gate before wider beta

1. Run **`docs/BETA-TESTING-GUIDE.md`** (or the **beta tester manual** script) once on **production-like** URLs.
2. Confirm **Payouts** and **KYC Approvals** against real data.
3. Record commit SHA and deploy ID in your release notes.

---

## Related documents

- [BETA-TESTING-GUIDE.md](./BETA-TESTING-GUIDE.md) — operator workflow
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) — deploy verification
- [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) — secrets and keys
- [manuals](./manuals/) — PDF manuals and optional errata

---

*This file is the single launch-readiness summary for beta; older sections that duplicated or contradicted it have been removed.*
