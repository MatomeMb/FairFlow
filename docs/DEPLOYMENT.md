# Deployment Guide

Production deployment procedures for fairflow.

---

## Prerequisites

- Node.js 18+
- Environment variables configured (see [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md))
- Cloudflare R2 bucket (for production artifact storage)
- Stripe account (live keys for production)
- Supabase project (for auth-portal)

---

## Shadow Index API

### Build

```bash
cd packages/shadow-index
npm ci
npm run build
```

### Run

```bash
npm run start
```

Or with explicit env:

```bash
PORT=3000 node run-with-env.mjs
```

### Environment

Set in hosting platform (Vercel, Railway, Fly.io, etc.):

- `PORT`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`, `SHADOW_INDEX_API_KEY`, `ADMIN_SECRET_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `STORAGE_MODE=r2`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
- `PUBLIC_API_BASE_URL` (e.g. `https://api.fairflow.co.za`)

---

## Auth Portal

### Build

```bash
cd packages/auth-portal
npm ci
npm run build
```

Output: `dist/` (static files).

### Hosting

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront).

### Environment (Build-Time)

Vite embeds these at build time:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `VITE_API_KEY`

---

## Lens Extension

1. Build: `cd packages/lens-extension && npm run build`
2. Produces `.zip` for Chrome Web Store
3. Submit via [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## Health Check

After deployment, verify:

```bash
curl https://your-api/health
```

Expected: `{"status":"ok","service":"shadow-index",...}` with `checks` object.
