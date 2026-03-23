# fairflow Deployment Guide

Production and staging deployment procedures for fairflow.

---

## Prerequisites

- Node.js 18+
- Environment variables configured (see [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) and [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md))
- Cloudflare R2 bucket (production, when `STORAGE_MODE=r2`)
- Paystack account (test keys for staging, live for production)
- Supabase project (Postgres + Auth for staff; service role used server-side)

---

## Environment Variables

### shadow-index

| Variable | Purpose |
|----------|---------|
| `PORT` | API server port (default: 3000) |
| `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_CALLBACK_URL` | Paystack (primary ZAR checkout and webhooks) |
| `JWT_SECRET` | Merchant JWT signing (≥32 chars) |
| `ADMIN_SECRET_KEY` | `/v1/admin/*` cron and tooling (server-only) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Server-side Postgres + `admin-proxy` CEO/CTO validation |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Merchant Google OAuth |
| `AUTH_PORTAL_BASE_URL` | Portal URL (e.g. https://portal.fairflow.co.za) |
| `PUBLIC_API_BASE_URL` | Public API URL for thing URLs and callbacks (e.g. https://api.fairflow.co.za) |
| `SHADOW_INDEX_API_KEY` / `SHADOW_INDEX_API_KEYS` | Optional API key gate for public routes (see middleware) |
| `STORAGE_MODE` | `local` or `r2` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | R2 (when STORAGE_MODE=r2) |
| `RESEND_API_KEY` | Transactional email (optional in dev) |

Optional Stripe envs remain only if you enable that rail (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

### auth-portal (build-time)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_BASE_URL` | shadow-index API URL |
| `VITE_API_KEY` | Optional; must match a registered shadow-index API key when the API enforces keys |

Staff admin actions (KYC, payouts in the UI) use the **Supabase session** and `POST`/`GET` `/v1/admin-proxy/*` on the API — do **not** put `ADMIN_SECRET_KEY` in any `VITE_*` variable.

---

## Staging Deployment

### Pre-Deploy Checklist

- [ ] Tests pass: `cd packages/shadow-index && npm test -- --run`
- [ ] Type-check: `npm run type-check`
- [ ] Lint: `npm run lint`
- [ ] `.env` not committed (use platform secrets)
- [ ] Staging Paystack keys (test mode)
- [ ] Staging Supabase project

### 1. Shadow Index API (Vercel)

1. Set environment variables in Vercel project → Settings → Environment Variables
2. Deploy from `packages/shadow-index`:
   ```bash
   cd packages/shadow-index
   npx vercel
   ```
   The API runs as a serverless function via `api/vercel-entry.ts`.
3. Verify: `curl https://staging-api.fairflow.co.za/health` (and `/healthz` if exposed by the edge config)
4. Configure Paystack webhook: `https://staging-api.fairflow.co.za/webhooks/paystack`

### 2. Auth Portal (Vercel)

1. Set build env in Vercel: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_KEY` if your API requires it
2. Deploy from `packages/auth-portal`:
   ```bash
   cd packages/auth-portal
   npx vercel
   ```
3. Add staging URL to Supabase Auth redirect allowlist

### 3. Post-Deploy Verification

| Check | Command / Action |
|-------|------------------|
| API health | `curl https://staging-api/health` |
| Compile | POST product JSON to `/compile` |
| Resolve | GET `/resolve/:hash` |
| Login | Sign in at auth-portal staging URL |
| Admin KYC (secret) | `curl -H "Authorization: Bearer $ADMIN_SECRET_KEY" https://staging-api/v1/admin/kyc/pending` |
| Admin KYC (portal) | Browser: KYC Approvals uses `/v1/admin-proxy/kyc/pending` with Supabase `Authorization: Bearer` |

---

## Production Deployment

### Pre-Deployment Verification

```bash
cd packages/shadow-index
npm run type-check
npm run lint
npm test -- --run
npm run build
npm audit
```

### Deployment Steps

1. **Backup** (if applicable):
   ```bash
   cp -r data/ data-backup-$(date +%s)/
   ```

2. **Deploy code** (both projects deploy via Vercel on push to `main`, or manually):
   ```bash
   cd packages/shadow-index && npx vercel --prod
   cd packages/auth-portal && npx vercel --prod
   ```

3. **Migrations** (if needed):
   ```bash
   node scripts/migrate-001-add-payout-logs.mjs
   node scripts/migrate-002-update-merchant-kyc.mjs
   ```

4. **Verify**:
   ```bash
   curl https://api.fairflow.co.za/health
   ```

### Rollback

1. Revert to previous deployment in Vercel (Deployments → select previous → Promote to Production)
2. If data corrupted, restore from backup
3. Notify team

---

## Lens Extension

1. Build: `cd packages/lens-extension && npm run build`
2. Produces `.zip` for Chrome Web Store
3. Submit via [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. See [CHROME-WEB-STORE-CHECKLIST.md](./CHROME-WEB-STORE-CHECKLIST.md)

---

## Admin Payout Release

To release payouts to a merchant's bank:

```bash
curl -X POST https://your-api/v1/admin/payouts/release-to-merchant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_SECRET_KEY" \
  -d '{"merchant_id": "<merchant-id>"}'
```

---

## Health Check

After deployment:

```bash
curl https://your-api/health
```

Expected: `{"status":"ok","service":"shadow-index",...}` with `checks` object.
