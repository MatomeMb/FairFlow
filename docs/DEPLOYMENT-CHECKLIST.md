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
| `ADMIN_SECRET_KEY` | Yes | Strong random in production |
| `STRIPE_SECRET_KEY` | Yes | sk_test_* or sk_live_* |
| `STRIPE_WEBHOOK_SECRET` | Yes | From Stripe webhook |
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
| `VITE_ADMIN_SECRET` | Yes (for KYC) |

---

## Post-Deploy Verification

| Check | Command |
|-------|---------|
| API health | `curl https://your-api/health` |
| Compile | `curl -X POST https://your-api/compile -H "Content-Type: application/json" -d '{"title":"Test","price":100,"currency":"USD"}'` |
| Admin KYC | `curl -H "Authorization: Bearer $ADMIN_SECRET_KEY" https://your-api/v1/admin/kyc/pending` |
| Portal login | Sign in at portal URL |
| Merchant flow | Register at /merchant/register, submit KYC |
| Admin KYC | Approve KYC at /dashboard/admin → KYC Approvals |

---

## Stripe Webhook

1. Create webhook endpoint: `https://your-api/webhooks/stripe`
2. Event: `checkout.session.completed`
3. Add signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Supabase

1. Add portal URL to Auth → URL Configuration → Redirect URLs
2. Add staging/production URLs as needed
