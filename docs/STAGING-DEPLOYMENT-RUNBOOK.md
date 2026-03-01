# Staging Deployment Runbook

Step-by-step deployment to staging environment.

---

## Pre-Deploy Checklist

- [ ] All tests pass (`npm test -- --run` in packages/shadow-index)
- [ ] Type-check passes (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)
- [ ] `.env` files not committed (use platform secrets)
- [ ] Staging Stripe keys (test mode)
- [ ] Staging Supabase project
- [ ] R2 bucket for staging (optional)

---

## 1. Shadow Index API (Staging)

1. Set environment variables in hosting platform
2. Deploy from `packages/shadow-index`
3. Verify health: `curl https://staging-api.fairflow.co.za/health`
4. Verify Stripe webhook: create endpoint `https://staging-api.fairflow.co.za/webhooks/stripe`, event `checkout.session.completed`

---

## 2. Auth Portal (Staging)

1. Set `VITE_API_BASE_URL` to staging API URL
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (staging Supabase)
3. Build: `npm run build`
4. Deploy `dist/` to static host
5. Add staging URL to Supabase Auth redirect allowlist

---

## 3. Post-Deploy Verification

| Check | Command / Action |
|-------|------------------|
| API health | `curl https://staging-api/health` |
| Compile | POST product JSON to `/compile` |
| Resolve | GET `/resolve/:hash` |
| Login | Sign in at auth-portal staging URL |
| Checkout | Create test checkout session |

---

## Rollback

1. Revert to previous deployment in hosting platform
2. If data corrupted, restore from backup (if configured)
3. Notify team of rollback
