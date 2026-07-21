# Deployment Guide — Fairflow on Vercel

Both **frontend** (auth-portal) and **API** (shadow-index) are deployed on **Vercel**. Deploy the API first, then the frontend.

---

## 1. Deploy API (Vercel — shadow-index)

The API runs as a Vercel serverless function via `api/vercel-entry.ts` (Hono + Node.js adapter).

### Step 1: Create Vercel project for the API

1. Go to [vercel.com](https://vercel.com) and sign up (GitHub).
2. Click **Add New** → **Project**.
3. Import your repo.
4. Set **Root Directory** to `packages/shadow-index`.
5. Vercel will use the `vercel.json` in that directory (routes all traffic through the Hono serverless function).

### Step 2: Set environment variables

In Vercel → API project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `PAYSTACK_SECRET_KEY` | your Paystack secret key |
| `PAYSTACK_PUBLIC_KEY` | your Paystack public key |
| `PAYSTACK_CALLBACK_URL` | `https://portal.fairflow.co.za/order/confirmation` |
| `AUTH_PORTAL_BASE_URL` | `https://portal.fairflow.co.za` |
| `PUBLIC_API_BASE_URL` | `https://api.fairflow.co.za` |
| `JWT_SECRET` | (generate a random 64-char string) |
| `ADMIN_SECRET_KEY` | (choose a secure admin secret) |
| `GOOGLE_CLIENT_ID` | your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | your Google OAuth client secret |
| `STORAGE_MODE` | `r2` (for production) |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key |
| `R2_BUCKET_NAME` | your R2 bucket name |

### Step 3: Deploy and get URL

1. Click **Deploy** (or push to your production branch).
2. Your API URL: `https://api.fairflow.co.za`
3. Optionally assign a custom domain (e.g. `api.fairflow.co.za`).

---

## 2. Deploy Frontend (Vercel — auth-portal)

### Step 1: Create Vercel project for the frontend

1. Click **Add New** → **Project**.
2. Import the same repo.
3. Set **Root Directory** to `packages/auth-portal`.
4. Vercel will auto-detect Vite. Build command: `npm run build`, output: `dist`.

### Step 2: Set environment variables

In Vercel → Frontend project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://api.fairflow.co.za` |
| `VITE_API_KEY` | (optional, if you use API key auth) |
| `VITE_ADMIN_SECRET` | (same as `ADMIN_SECRET_KEY` in the API project) |
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

### Step 3: Deploy

1. Click **Deploy** (or push to your production branch).
2. Your frontend URL: `https://portal.fairflow.co.za`
3. Optionally assign a custom domain (e.g. `portal.fairflow.co.za`).

---

## 3. Update URLs (cross-reference)

1. In the **API** project on Vercel, set `PAYSTACK_CALLBACK_URL` and `AUTH_PORTAL_BASE_URL` to `https://portal.fairflow.co.za`.
2. In the **Frontend** project on Vercel, set `VITE_API_BASE_URL` to `https://api.fairflow.co.za`.
3. In **Paystack Dashboard**, add your webhook URL: `https://api.fairflow.co.za/webhooks/paystack`.
4. In **Google Cloud Console**, update OAuth redirect URIs to use the API Vercel URL.

---

## 4. Connect Sobuhle’s domain (GoDaddy)

1. In **Vercel** → Project → **Settings** → **Domains**:
   - API: add `api.fairflow.co.za` (or your API subdomain).
   - Frontend: add `portal.fairflow.co.za` (or your portal subdomain).
   - Vercel will show the CNAME and A record values.

2. In **GoDaddy** (Sobuhle):
   - DNS → Add records.
   - For **CNAME**: Host = `api`, Value = `cname.vercel-dns.com`.
   - For **CNAME**: Host = `portal` (or `www`), Value = `cname.vercel-dns.com`.
   - For **A record** (root): Host = `@`, Value = `76.76.21.21` (Vercel’s IP).

3. Wait for DNS propagation (usually 5–60 minutes).

---

## Quick deploy (CLI)

```bash
# Deploy API (from repo root)
cd packages/shadow-index
npx vercel --prod

# Deploy frontend (from repo root)
cd packages/auth-portal
npx vercel --prod
```

(Requires `vercel` CLI installed and logged in: `npm i -g vercel && vercel login`.)

---

## Vercel-specific notes

- **API cold starts**: Serverless functions may have ~1-2s cold starts. The `maxDuration` is set to 30s in `api/vercel-entry.ts`.
- **Health check**: `GET /healthz` hits a standalone Vercel function (`api/health.ts`) for fast uptime monitoring.
- **File storage**: Vercel functions are stateless — all artifact storage uses Cloudflare R2 (`STORAGE_MODE=r2`). Do **not** use `STORAGE_MODE=local` in production.
