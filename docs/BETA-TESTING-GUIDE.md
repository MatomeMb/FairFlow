# Beta Testing Guide — Full End-to-End Workflow

**Purpose:** Test authorizations, deployment, full functionality, and admin KYC approval before beta launch.

---

## 1. Pre-Flight: Environment Setup

### 1.1 Run checks

```powershell
cd mcj
.\scripts\setup-check.ps1
cd packages\shadow-index
.\scripts\test-setup.ps1   # if in shadow-index
```

### 1.2 Shadow-index `.env`

Ensure `mcj/packages/shadow-index/.env` has:

```env
ADMIN_SECRET_KEY=mor-admin-secret-local
JWT_SECRET=<64-char-hex-string>
STRIPE_SECRET_KEY=sk_test_...
# ... other vars from .env.example
```

### 1.3 Auth-portal `.env`

Ensure `mcj/packages/auth-portal/.env` has:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3000
VITE_ADMIN_SECRET=mor-admin-secret-local
```

### 1.4 Admin access

Admin emails must be in `AuthContext.tsx` (e.g. `matome@fairflow.dev`, `sobuhle@fairflow.dev`). Sign in with one of these to access the Admin Portal.

---

## 2. Start Dev Stack (for deployment testing)

### Terminal 1 — API

```powershell
cd mcj\packages\shadow-index
npm run dev
```

- API: http://localhost:3000/health

### Terminal 2 — Auth Portal

```powershell
cd mcj\packages\auth-portal
npm run dev
```

- Portal: http://localhost:5178

---

## 3. Full End-to-End Test Flow

### 3.1 Auth (Merchant)

1. Open http://localhost:5178/login
2. **Register** — Sign up as merchant (email/password or Google OAuth)
3. **Login** — Verify merchant portal loads at `/dashboard/merchant`

### 3.2 Auth (Admin)

1. Sign in with an admin email (e.g. `matome@fairflow.dev`)
2. Redirect to `/dashboard/admin` (Admin Portal)
3. Verify dashboard, health, and analytics load

### 3.3 Merchant KYC Submit

1. As merchant: `/dashboard/merchant` → **KYC & Payouts** tab
2. Click **Start KYC** and fill in:
   - ID number, DOB, phone, address
   - Business name
   - Bank account (holder, bank, account number, branch, type)
3. Submit → status should become `pending`

### 3.4 Admin KYC Approval

1. Sign in as admin → `/dashboard/admin`
2. Sidebar → **KYC Approvals**
3. Click **Refresh** — pending merchant appears
4. Approve or reject:
   - **Approve** — add notes, confirm
   - **Reject** — add reason, confirm
5. Confirm merchant status updates in portal

### 3.5 Commerce Flow (Optional)

1. **Compile** — POST product JSON to `/compile`
2. **Resolve** — GET `/resolve/:hash`
3. **Checkout** — Create Stripe checkout session
4. **Webhook** — Verify `checkout.session.completed` handled

---

## 4. Smoke Tests (Post-Deploy)

```powershell
# Health
curl http://localhost:3000/health

# Compile (requires API key)
curl -X POST http://localhost:3000/compile -H "Content-Type: application/json" -H "x-api-key: YOUR_KEY" -d "{\"title\":\"Test\",\"price\":100,\"currency\":\"USD\"}"

# Admin KYC (requires ADMIN_SECRET_KEY)
curl -H "Authorization: Bearer mor-admin-secret-local" http://localhost:3000/v1/admin/kyc/pending
```

---

## 5. Staging Deployment (Beta Launch Prep)

### 5.1 Shadow-index

1. Set env vars in Vercel project (Settings → Environment Variables):
   - `ADMIN_SECRET_KEY` — strong random secret
   - `JWT_SECRET`, `PAYSTACK_*`, `GOOGLE_*`, etc.
2. Deploy from `packages/shadow-index` via `npx vercel --prod`
3. Verify: `curl https://staging-api.fairflow.co.za/healthz`
4. Configure Paystack webhook: `https://staging-api.fairflow.co.za/webhooks/paystack`

### 5.2 Auth-portal

1. Set env vars in build:
   - `VITE_API_BASE_URL=https://staging-api.fairflow.co.za`
   - `VITE_ADMIN_SECRET=<same as ADMIN_SECRET_KEY>`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (staging Supabase)
2. Build: `npm run build`
3. Deploy `dist/` to static host
4. Add staging URL to Supabase Auth redirect allowlist

### 5.3 Post-deploy

- [ ] API health
- [ ] Login (Supabase + merchant)
- [ ] Admin KYC list/approve/reject
- [ ] Checkout flow

---

## 6. Beta User Checklist

| Step | Action |
|------|--------|
| 1 | Add beta users to `BETA-USER-LIST.md` |
| 2 | Invite via `BETA-OUTREACH-TEMPLATE.md` |
| 3 | Onboard via `BETA-USER-ONBOARDING.md` |
| 4 | Track feedback via `BETA-FEEDBACK-TEMPLATE.md` |

---

## 7. Quick Reference

| Service | Port | URL |
|---------|------|-----|
| shadow-index API | 3000 | http://localhost:3000 |
| auth-portal | 5178 | http://localhost:5178 |
| demo server | 5177 | http://localhost:5177 |

| Key | Location |
|-----|----------|
| `ADMIN_SECRET_KEY` | shadow-index `.env` |
| `VITE_ADMIN_SECRET` | auth-portal `.env` (must match) |
| Admin emails | `AuthContext.tsx` `ADMIN_EMAILS` |

---

*Document: BETA-TESTING-GUIDE.md*
