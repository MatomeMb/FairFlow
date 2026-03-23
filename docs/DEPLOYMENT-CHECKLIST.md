# Deployment Checklist

Pre-deployment verification for fairflow staging and production.

---

## Pre-Deploy (Run from repo root)

```bash
# 1. shadow-index
cd packages/shadow-index
npm run type-check
npm run lint
npm test -- --run
npm run build

# 2. auth-portal
cd ../auth-portal
npm run build

# 3. E2E (optional; requires dev servers)
cd ../..
npm run test:e2e
```

---

## Environment Variables

### shadow-index (required)

| Variable | Required | Notes |
|----------|----------|-------|
| `PORT` | No | Default 3000 |
| `JWT_SECRET` | Yes | ≥32 chars |
| `ADMIN_SECRET_KEY` | Yes | Strong random in production; `/v1/admin/*` only |
| `PAYSTACK_SECRET_KEY` | Yes | Test or live secret; webhook HMAC |
| `PAYSTACK_PUBLIC_KEY` | Often | Client/initialize flows |
| `SUPABASE_URL` | Yes | Postgres + Auth integration |
| `SUPABASE_SERVICE_KEY` | Yes | `admin-proxy`, server-side DB |
| `GOOGLE_CLIENT_ID` | Yes | OAuth |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth |
| `GOOGLE_REDIRECT_URI` | Yes | Callback URL |
| `AUTH_PORTAL_BASE_URL` | Yes | Portal URL |
| `PUBLIC_API_BASE_URL` | Production | e.g. https://api.fairflow.co.za |
| `STORAGE_MODE` | No | `local` or `r2` |
| `R2_*` | When r2 | Account, keys, bucket |

### auth-portal (build-time)

| Variable | Required |
|----------|----------|
| `VITE_SUPABASE_URL` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Yes |
| `VITE_API_BASE_URL` | Yes |
| `VITE_API_KEY` | Optional (public product/analytics calls when configured) |

Staff KYC and payout actions use the Supabase session and `/v1/admin-proxy/*`; do not set `VITE_ADMIN_SECRET`.

---

## Environment Variables — API (Vercel)

- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_KEY` set (used by `admin-proxy.ts` and server-side DB access)
- [ ] `SUPABASE_ANON_KEY` set (only if a server path uses the anon client; not required for `admin-proxy` alone)
- [ ] `JWT_SECRET` set (min 32 chars)
- [ ] `ADMIN_SECRET_KEY` set (strong random value, never the default)
- [ ] `PAYSTACK_SECRET_KEY` set
- [ ] `PAYSTACK_PUBLIC_KEY` set (where required for client flows)
- [ ] `PUBLIC_API_BASE_URL` set to `https://api.fairflow.co.za` (artifact URLs and callbacks)
- [ ] `AUTH_PORTAL_BASE_URL` set to the portal origin (e.g. `https://portal.fairflow.co.za`)
- [ ] `RESEND_API_KEY` set (transactional email)
- [ ] `NODE_ENV` set to `production`

## Environment Variables — Edge Functions (Supabase)

If you use Supabase Edge Functions, align names with the Supabase dashboard (often `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_SERVICE_KEY`). Keep service-role material out of client bundles.

- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (when the function needs service role)
- [ ] `SUPABASE_ANON_KEY` set (when the function validates or proxies anon-scoped calls)

## Post-deployment verification

- [ ] `GET https://api.fairflow.co.za/health` returns 200
- [ ] Admin proxy: `GET /v1/admin-proxy/kyc/pending` with `Authorization: Bearer <valid Supabase CEO/CTO access_token>` returns 200
- [ ] Merchant login returns a valid merchant JWT (`POST /v1/auth/merchant/login` or OAuth callback)
- [ ] Paystack webhook HMAC verification passes on a signed test event (`POST /webhooks/paystack` with `x-paystack-signature`)

---

## Post-Deploy Verification (manual)

| Check | Command |
|-------|---------|
| Smoke suite (recommended first) | `cd packages/shadow-index && npm run smoke:prod -- https://your-api-domain` |
| API health | `curl https://your-api/health` |
| Compile | `curl -X POST https://your-api/compile -H "Content-Type: application/json" -d '{"title":"Test","price":100,"currency":"USD"}'` |
| Admin KYC (server secret) | `curl -H "Authorization: Bearer $ADMIN_SECRET_KEY" https://your-api/v1/admin/kyc/pending` |
| Portal login | Sign in at portal URL |
| Merchant flow | Register at /merchant/register, submit KYC |
| Admin KYC (UI) | Approve KYC at /dashboard/admin → KYC Approvals (uses admin-proxy + Supabase session) |

---

## Uptime Monitoring (Production)

Use this minimum monitor set for the backend:

1. `GET /health` every 60s (critical liveness check)
2. `GET /healthz` every 60s (function-level probe)
3. `GET /` every 5m (basic routing + status check)

Trigger alert when any endpoint fails 2 consecutive checks or latency exceeds 4s for 5 minutes.
Send alerts to both email and Slack/WhatsApp pager channel.

For full setup template, see `docs/VERCEL-UPTIME-RUNBOOK.md`.

---

## Paystack webhook

1. Register `POST https://your-api/webhooks/paystack` in the Paystack dashboard.
2. Verification uses HMAC-SHA512 with `PAYSTACK_SECRET_KEY` and header `x-paystack-signature`.

Optional **Stripe** webhook (only if that rail is enabled): `https://your-api/webhooks/stripe`, event `checkout.session.completed`, secret `STRIPE_WEBHOOK_SECRET`.

---

## Supabase

1. Add portal URL to Auth → URL Configuration → Redirect URLs
2. Add staging/production URLs as needed
