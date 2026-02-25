# Stripe Integration Setup Guide
## Matter Commerce Portability System

---

## ✅ Implementation Complete

The following features have been successfully implemented:

### Backend (Shadow Index API)
- ✅ Stripe SDK integrated
- ✅ .thing file schema (v1.0) implemented
- ✅ `GET /thing/:hash.json` - Serve .thing files with CORS
- ✅ `POST /checkout/create-session` - Create Stripe checkout
- ✅ `POST /webhooks/stripe` - Handle payment webhooks with signature verification
- ✅ `GET /orders/:sessionId` - Retrieve order details
- ✅ Orders storage (JSON file-based)

### Frontend (Auth Portal)
- ✅ ProductPage component (`/product/:hash`)
- ✅ OrderConfirmation component (`/order/success`)
- ✅ Merchant Portal updated with .thing URL display
- ✅ Copy-to-clipboard for matter:// URI and .thing URL
- ✅ "Preview Product Page" link in Merchant Portal

---

## 🚀 Quick Start Guide

### Step 1: Get Stripe Test Keys (5 minutes)

1. **Create Stripe Account** (if you don't have one)
   - Go to: https://dashboard.stripe.com/register
   - Sign up with your email
   - Skip business details (you can use test mode immediately)

2. **Get Your Test API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - **IMPORTANT:** Make sure "Test mode" toggle is ON (top-right corner)
   - Copy:
     - `Publishable key` (starts with `pk_test_`)
     - `Secret key` (click "Reveal" first, starts with `sk_test_`)

3. **Create a Webhook Endpoint**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "+ Add endpoint"
   - **Endpoint URL:** `http://localhost:3000/webhooks/stripe`
   - **Events to listen to:** Select `checkout.session.completed`
   - Click "Add endpoint"
   - Click "Reveal" under "Signing secret" — copy this (starts with `whsec_`)

### Step 2: Configure Environment Variables

1. Navigate to the Shadow Index directory:
   ```bash
   cd mcj/packages/shadow-index
   ```

2. Create `.env.local` file:
   ```bash
   # Copy the template
   cp .env.local.template .env.local
   ```

3. Edit `.env.local` and replace the placeholder values:
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
   ```

4. **Verify `.env.local` is in `.gitignore`** (it already is — just confirming you won't commit secrets)

### Step 3: Start the Servers

1. **Terminal 1 - Start Shadow Index API:**
   ```bash
   cd mcj/packages/shadow-index
   npm run dev
   ```
   Expected output:
   ```
  fairflow - Shadow Index API
   ---------------------------------------
   API:       http://localhost:3000
   Health:    http://localhost:3000/health
   Dashboard: http://localhost:3000/v1/analytics/dashboard
   ```

2. **Terminal 2 - Start Auth Portal:**
   ```bash
   cd mcj/packages/auth-portal
   npm run dev
   ```
   Expected output:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5178/
   ➜  Network: use --host to expose
   ```

### Step 4: Test the Complete Flow (10 minutes)

#### 4.1. Upload a Product Catalog

1. Open: http://localhost:5178/
2. Log in as **Merchant** (use "merchant" role)
3. Click "Upload Catalog" tab
4. Download the CSV template or create your own:
   ```csv
   Title,Price,Currency
   Fair Trade Coffee,12999,ZAR
   Organic Cotton T-Shirt,29900,ZAR
   ```
   **Price format:** Integer in smallest currency unit (cents for ZAR)
   - R 129.99 → `12999`
   - R 299.00 → `29900`

5. Drop the CSV file into the upload area
6. Click "Confirm Upload"

#### 4.2. Compile to Matter URIs

1. Go to "Compile" tab
2. Click "Compile Pending Products"
3. You should see:
   - Matter URI (e.g., `matter://abc123...`)
   - .thing File URL (e.g., `http://localhost:3000/thing/abc123.json`)
   - "Preview Product Page" link
   - "Copy" buttons for both URLs

#### 4.3. Test the Product Page

1. Click "Preview Product Page" (opens in new tab)
2. You should see:
   - Product title and price (formatted correctly, e.g., "R 129.99")
   - Product image (if provided in CSV)
   - Email input field
   - "Buy Now" button

3. Enter a test email: `test@example.com`
4. Click "Buy Now"
5. You should be redirected to Stripe Checkout

#### 4.4. Complete a Test Payment

1. On Stripe Checkout page, enter test card:
   ```
   Card number:  4242 4242 4242 4242
   Expiry:       12/28 (any future date)
   CVC:          123 (any 3 digits)
   ZIP:          90210 (any 5 digits)
   ```

2. Click "Pay"
3. You should be redirected to: `http://localhost:5178/order/success?session_id=...`

#### 4.5. Verify Order Confirmation

1. On the confirmation page, you should see:
   - ✅ "Payment Successful!" message
   - Order ID
   - Product title
   - Amount paid (formatted correctly)
   - Customer email
   - Payment timestamp

2. **Check the webhook was received:**
   - Look at Terminal 1 (Shadow Index API)
   - You should  see webhook event logs (if logging is enabled)

3. **Verify order status in database:**
   ```bash
   # From mcj/packages/shadow-index:
   cat data/orders.json
   ```
   You should see:
   ```json
   {
     "cs_test_...": {
       "id": "...",
       "session_id": "cs_test_...",
       "product_hash": "...",
       "merchant_id": "...",
       "amount": 12999,
       "currency": "ZAR",
       "customer_email": "test@example.com",
       "status": "paid",
       "created_at": "2026-02-18T...",
       "paid_at": "2026-02-18T..."
     }
   }
   ```

---

## 🧪 Testing with Stripe CLI (Optional but Recommended)

For local webhook testing without exposing your localhost to the internet:

### Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases/latest

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xzf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Login to Stripe CLI

```bash
stripe login
```

### Forward Webhooks to Localhost

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

This will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**Update your `.env.local`** with this secret:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Now when you complete test payments, the webhook will be forwarded to your local API automatically.

---

## 📋 API Endpoints Reference

### Product Compilation & Retrieval

#### `POST /catalog/import`
Upload CSV or JSON array of products to compile into matter:// URIs

**Request (CSV):**
```
Content-Type: text/csv

Title,Price,Currency
Fair Trade Coffee,12999,ZAR
```

**Request (JSON):**
```json
{
  "products": [
    {
      "title": "Fair Trade Coffee",
      "price": 12999,
      "currency": "ZAR",
      "description": "Ethically sourced",
      "image_url": "https://..."
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "hash": "abc123...",
      "matter_uri": "matter://abc123...",
      "thing_url": "http://localhost:3000/thing/abc123.json",
      "gist": {
        "title": "Fair Trade Coffee",
        "price": 12999,
        "currency": "ZAR"
      }
    }
  ],
  "errors": [],
  "imported": 1,
  "failed": 0
}
```

#### `GET /thing/:hash.json`
Retrieve .thing file for a product

**Response:**
```json
{
  "product": {
    "id": "abc123...",
    "title": "Fair Trade Coffee",
    "description": "Ethically sourced",
    "price": 12999,
    "currency": "ZAR",
    "image_url": "https://..."
  },
  "commerce": {
    "merchant_id": "merchant-uuid",
    "payment_gateway": "stripe",
    "supported_currencies": ["ZAR"],
    "shipping_available": false
  },
  "metadata": {
    "schema_version": "1.0",
    "created_at": "2026-02-18T10:00:00Z",
    "matter_uri": "matter://abc123...",
    "thing_url": "http://localhost:3000/thing/abc123.json"
  }
}
```

### Payment Flow

#### `POST /checkout/create-session`
Create a Stripe Checkout session

**Request:**
```json
{
  "product_hash": "abc123...",
  "customer_email": "buyer@example.com"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Product not found
- `500` - Stripe API error

#### `POST /webhooks/stripe`
Receive Stripe webhook events (Stripe calls this, not you)

**Headers:**
```
stripe-signature: t=xxx,v1=yyy
```

**Body:** Raw Stripe event JSON

**Response:**
```json
{ "received": true }
```

#### `GET /orders/:sessionId`
Retrieve order details by Stripe session ID

**Response:**
```json
{
  "id": "order-uuid",
  "session_id": "cs_test_...",
  "product_hash": "abc123...",
  "merchant_id": "merchant-uuid",
  "amount": 12999,
  "currency": "ZAR",
  "customer_email": "buyer@example.com",
  "status": "paid",
  "created_at": "2026-02-18T10:00:00Z",
  "paid_at": "2026-02-18T10:05:00Z"
}
```

---

## 🔧 Troubleshooting

### "Stripe is not configured" error
**Solution:** Check that `.env.local` exists and contains valid `STRIPE_SECRET_KEY`

### Webhook signature verification fails
**Causes:**
- Wrong `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Using dashboard webhook secret instead of CLI secret (if using `stripe listen`)
- Request body was parsed before signature check (shouldn't happen with current code)

**Solution:**
1. If using Stripe CLI: Copy the secret from `stripe listen` output
2. If using dashboard webhook: Copy from https://dashboard.stripe.com/test/webhooks
3. Make sure `.env.local` is updated and server is restarted

### Order status stays "pending"
**Causes:**
- Webhook not received
- Webhook signature verification failed
- Session ID mismatch

**Solution:**
1. Check Terminal 1 (API logs) for webhook errors
2. Use `stripe listen` to test locally
3. Check `data/orders.json` — if order exists but status is "pending", webhook didn't fire
4. Test the webhook manually:
   ```bash
   stripe trigger checkout.session.completed
   ```

### Product page shows "Product Not Found"
**Causes:**
- Wrong hash in URL
- .thing file not generated during compile

**Solutions:**
1. Check `data/index.json` — does the hash exist?
2. Try fetching the .thing file directly: `http://localhost:3000/thing/HASH.json`
3. Re-compile the product from Merchant Portal

### CORS errors on ProductPage
**Cause:** .thing endpoint not serving CORS headers

**Solution:** Already fixed in code — `GET /thing/:hash.json` includes:
```typescript
'Access-Control-Allow-Origin': '*'
```

If still seeing errors, check browser console for the actual endpoint being called.

---

## 📦 File Structure

```
mcj/
├── packages/
│   ├── shadow-index/
│   │   ├── api/
│   │   │   └── index.ts          # 🔧 Main API file (Stripe integration here)
│   │   ├── data/
│   │   │   ├── index.json        # Product hash → .thing file mapping
│   │   │   ├── orders.json       # Order storage
│   │   │   └── things/           # .thing file storage
│   │   ├── .env.local            # 🔐 Stripe keys (create this!)
│   │   └── .env.local.template   # Template for .env.local
│   │
│   └── auth-portal/
│       └── src/
│           ├── pages/
│           │   ├── ProductPage.tsx         # 🛍️ Public product page
│           │   ├── OrderConfirmation.tsx   # ✅ Order success page
│           │   └── portals/
│           │       └── MerchantPortal.tsx  # 📊 Updated with .thing URLs
│           └── router/
│               └── PortalRouter.tsx        # 🔀 Routes added
```

---

## 🎯 Next Steps

1. **Test with multiple products** - Upload a CSV with 5-10 products
2. **Test different price points** - Ensure formatting works for all amounts
3. **Test error cases** - Invalid email, expired card, etc.
4. **Add product images** - Include `image_url` in CSV to see full product page
5. **Share a matter:// link** - Copy the URI and test distribution (email, WhatsApp, etc.)

---

## ⚠️ Important Reminders

- **NEVER commit `.env.local`** - It's in `.gitignore`, but double-check
- **Test mode only** - All keys should start with `pk_test_` / `sk_test_` / `whsec_`
- **No real charges** - Test cards never create actual charges
- **Webhook secret** - Dashboard secret ≠ CLI secret (use the right one for your setup)
- **Integer prices** - Always use smallest currency unit (cents for ZAR/USD)

---

## 📚 Additional Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

**Implementation Status:** ✅ Complete and ready for testing  
**Last Updated:** February 18, 2026  
**Next Review:** After first production transaction (when moving to live keys)
