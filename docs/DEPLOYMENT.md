# fairflow Deployment Guide

Production and staging deployment procedures for fairflow.

---

## Prerequisites

- Node.js 18+
- Environment variables configured (see [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md))
- Cloudflare R2 bucket (production)
- Stripe account (test keys for staging, live for production)
- Supabase project

---

## Environment Variables

### shadow-index

| Variable | Purpose |
|----------|---------|
| `PORT` | API server port (default: 3000) |
| `STRIPE_SECRET_KEY` | Stripe API secret (sk_test_* or sk_live_*) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `JWT_SECRET` | Merchant JWT signing (≥32 chars) |
| `ADMIN_SECRET_KEY` | Admin API access (use strong random in production) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | OAuth |
| `AUTH_PORTAL_BASE_URL` | Portal URL (e.g. https://portal.fairflow.co.za) |
| `PUBLIC_API_BASE_URL` | Public API URL for thing_url (e.g. https://api.fairflow.co.za) |
| `STORAGE_MODE` | `local` or `r2` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | R2 (when STORAGE_MODE=r2) |

### auth-portal (build-time)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_BASE_URL` | shadow-index API URL |
| `VITE_ADMIN_SECRET` | Must match shadow-index ADMIN_SECRET_KEY |

---

## Staging Deployment

### Pre-Deploy Checklist

- [ ] Tests pass: `cd packages/shadow-index && npm test -- --run`
- [ ] Type-check: `npm run type-check`
- [ ] Lint: `npm run lint`
- [ ] `.env` not committed (use platform secrets)
- [ ] Staging Stripe keys (test mode)
- [ ] Staging Supabase project

### 1. Shadow Index API (Vercel)

1. Set environment variables in Vercel project → Settings → Environment Variables
2. Deploy from `packages/shadow-index`:
   ```bash
   cd packages/shadow-index
   npx vercel
   ```
   The API runs as a serverless function via `api/vercel-entry.ts`.
3. Verify: `curl https://staging-api.fairflow.co.za/healthz`
4. Configure Paystack webhook: `https://staging-api.fairflow.co.za/webhooks/paystack`

### 2. Auth Portal (Vercel)

1. Set build env in Vercel: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_SECRET`
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
| Admin KYC | `curl -H "Authorization: Bearer $ADMIN_SECRET_KEY" https://staging-api/v1/admin/kyc/pending` |

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
   curl https://api.fairflow.co.za/healthz
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
