# API Keys Guide

Step-by-step setup for API keys used by fairflow. Never commit real keys to the repository.

---

## Shadow Index API

### Required Keys

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| SHADOW_INDEX_API_KEY | API access for services | Generate a random 32+ char string |
| JWT_SECRET | Merchant session tokens | openssl rand -hex 32 |
| ADMIN_SECRET_KEY | Admin payout release | Generate random string |

### Stripe

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| STRIPE_SECRET_KEY | Checkout, webhooks | Stripe Dashboard test/apikeys |
| STRIPE_WEBHOOK_SECRET | Webhook verification | Create webhook, event checkout.session.completed |
| STRIPE_PUBLISHABLE_KEY | Client-side | Same dashboard |

### Google OAuth

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| GOOGLE_CLIENT_ID | OAuth client | Google Cloud Console |
| GOOGLE_CLIENT_SECRET | OAuth secret | Same |
| GOOGLE_REDIRECT_URI | Callback | https://your-api/v1/auth/google/callback |

---

## Auth Portal

| Variable | Purpose |
|----------|---------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anon key |
| VITE_API_BASE_URL | Shadow Index API base |
| VITE_API_KEY | Must match SHADOW_INDEX_API_KEY |

---

## Setup

1. Copy packages/shadow-index/.env.example to .env
2. Copy packages/auth-portal/.env.example to .env
3. Fill in real values
4. For local dev use Stripe test keys and localhost URLs

---

## Revocation

Set SHADOW_INDEX_REVOKED_KEYS=old-key-1,old-key-2 to reject keys without redeploy.
