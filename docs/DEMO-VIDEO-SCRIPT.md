# fairflow Exhaustive Functionality Demo Video Script

**Purpose:** Step-by-step script for recording a complete platform demo.  
**Duration:** ~25-35 minutes  
**Prerequisites:** API and portal running (ports 3000, 5178)

**Flow:** Admin workflows (incl. KYC approval) precede complete merchant workflows.

---

## Part 1: Introduction (1 min)

**Narration:**
"fairflow is an Object-Oriented Commerce platform. Products become portable digital objects (.thing files) that are cryptographically signed and transactable anywhere on the web. This demo covers the full merchant lifecycle, admin operations, and commerce flow."

**On screen:**
- Show README or landing
- Briefly show monorepo structure in IDE: shadow-index, auth-portal, lens-extension, matter-core

---

## Part 2: API Health and Compile (2 min)

**Narration:**
"The shadow-index API powers hash-to-artifact resolution, merchant auth, and Stripe payments."

**Actions:**
1. Open terminal. Run: `curl http://localhost:3000/health`
2. Show response: status ok, service shadow-index, checks
3. Run compile (replace YOUR_KEY with x-api-key from .env):
   ```
   curl -X POST http://localhost:3000/compile -H "Content-Type: application/json" -H "x-api-key: YOUR_KEY" -d "{\"title\":\"Demo Product\",\"price\":2999,\"currency\":\"ZAR\"}"
   ```
4. Show response: hash, matter_uri, thing_url
5. Copy the hash. Run: `curl http://localhost:3000/resolve/HASH`
6. Show resolved JSON with gist

---

## Part 3: Merchant Registration + KYC Submit (4 min)

**Narration:**
"Merchants register and submit KYC for admin approval."

**Actions:**
1. Open http://localhost:5178/merchant/register
2. Fill form: business "Demo Store", email demo@test.com, password SecurePass123
3. Submit, show redirect to /dashboard/merchant
4. Click KYC & Payouts tab
5. Fill KYC form: ID, DOB, address, phone, bank account (ABSA, account 9–11 digits, branch 6 digits)
6. Submit KYC — status shows "Pending Review"

---

## Part 4: Admin Portal - Login and KYC Approval (5 min)

**Narration:**
"Admins approve merchant KYC before merchants can receive payouts."

**Actions:**
1. Sign out from merchant
2. Open http://localhost:5178/login
3. Sign in with admin email (matome@fairflow.dev)
4. Show Dashboard
5. Click KYC Approvals — Refresh to fetch pending
6. Click Approve on merchant card, confirm in modal
7. Show Merchants, Users & Roles, Platform Health

---

## Part 5: Merchant Portal - Products (4 min)

**Narration:**
"The merchant dashboard has six tabs. We start with Products."

**Actions:**
1. On Products tab, click "Create Product" or "Add Product"
2. Fill CreateProductModal: title, price, currency, category, image URL (optional)
3. Submit. Show product appears in table
4. Show product row: name, price, status, stock, ethical score
5. Show "Restock" button - click and add stock
6. Show "Remove" button - click and confirm product is deleted (calls API)
7. Create another product. Show "Copy Product Page" and "Copy Matter ID" if available
8. Show thing_url / matter URI for the product

---

## Part 5: Merchant Portal - Analytics (2 min)

**Narration:**
"Analytics shows views, clicks, and engagement by product."

**Actions:**
1. Click Analytics tab
2. Show engagement trend chart (views/clicks over time)
3. Show top products by engagement
4. Show funnel: Views to Checkout Clicks
5. Show category engagement if data exists

---

## Part 6: Merchant Portal - Orders (2 min)

**Narration:**
"Orders tab lists incoming orders and fulfillment status."

**Actions:**
1. Click Orders tab
2. Show order list (or empty state)
3. If orders exist: show order row, fulfillment status, "Mark Fulfilled" action
4. Demonstrate marking an order as fulfilled

---

## Part 7: Merchant Portal - Notifications (1 min)

**Narration:**
"Notifications keep merchants informed."

**Actions:**
1. Click Notifications tab
2. Show notification list (or empty state)
3. Show "Mark all as read" if unread exist

---

## Part 8: Merchant Portal - KYC and Payouts (4 min)

**Narration:**
"KYC and Payouts is required for merchants to receive funds."

**Actions:**
1. Click KYC & Payouts tab
2. Show KYC form: ID number, DOB, phone, address, business name
3. Show bank account section: account holder, bank name, account number, branch code, account type
4. Fill form and submit
5. Show status changes to "pending"
6. Show payout history section (empty or with entries)
7. Show bank account details (masked) if already submitted

---

## Part 9: Merchant Portal - My Account (2 min)

**Narration:**
"My Account holds business profile and bank details."

**Actions:**
1. Click My Account tab
2. Show business profile: business name, year established
3. Show bank account details section
4. Show "Update" for bank details if editable

---

## Part 10: Admin Portal - Login and Dashboard (2 min)

**Narration:**
"Admins use the main portal with CEO/CTO roles."

**Actions:**
1. Sign out from merchant (or use incognito)
2. Open http://localhost:5178/login
3. Sign in with admin email (e.g. matome@fairflow.dev)
4. Show redirect to /dashboard/admin
5. Show Admin sidebar: Dashboard, KYC Approvals, Merchants, Users & Roles, Platform Health, Financials, System, Settings
6. Show Dashboard overview: Active Merchants, Heap Memory, Storage Used, Pending KYC, Errors
7. Show Platform Users, CEOs, CTOs, KYC Pending quick stats

---

## Part 11: Admin Portal - KYC Approvals (3 min)

**Narration:**
"Admins approve or reject merchant KYC submissions."

**Actions:**
1. Click "KYC Approvals" in sidebar
2. Click "Refresh" to fetch pending KYC
3. If pending: show merchant card with business name, email, ID, DOB, bank details
4. Click "Approve" - add optional notes, confirm
5. Or demonstrate "Reject" - add reason, confirm
6. Show toast success
7. Show list updates (pending removed)

---

## Part 12: Admin Portal - Merchants and Users (2 min)

**Narration:**
"Merchants and Users sections show platform users."

**Actions:**
1. Click "Merchants" - show merchant list
2. Click "Users & Roles" - show role counts (CEOs, CTOs, Merchants, Investors, Consumers)
3. Show user list with email and role

---

## Part 13: Admin Portal - Platform Health (2 min)

**Narration:**
"Platform Health shows API status and system metrics."

**Actions:**
1. Click "Platform Health"
2. Show API Status (Online/Offline)
3. Show Memory (Heap), Memory (RSS)
4. Show analytics dashboard data if available

---

## Part 14: Consumer Product Page and Checkout (3 min)

**Narration:**
"Consumers can view product pages and checkout via Stripe."

**Actions:**
1. Get a product hash from merchant products or compile
2. Open http://localhost:5178/product/HASH
3. Show product page: image, title, price, "Buy" or checkout button
4. Click checkout - show Stripe Checkout redirect (test mode)
5. Complete test payment (use 4242 4242 4242 4242)
6. Show redirect to /order/success
7. Show order confirmation page

---

## Part 15: Consumer Shop (1 min)

**Narration:**
"The Consumer Shop lists available products."

**Actions:**
1. Open http://localhost:5178/shop (may require login as consumer)
2. Show shop view if implemented
3. Or show product resolution from hash

---

## Part 16: API Endpoints Summary (2 min)

**Narration:**
"Key API endpoints for integration."

**Actions:**
1. Show or list:
   - POST /v1/auth/merchant/register
   - POST /v1/auth/merchant/login
   - GET /v1/merchant/products
   - POST /v1/merchant/products
   - DELETE /v1/merchant/products/:id
   - GET /v1/merchant/orders
   - PATCH /v1/merchant/orders/:id/fulfill
   - POST /v1/merchant/kyc/submit
   - GET /v1/admin/kyc/pending
   - PATCH /v1/admin/kyc/approve/:id
   - PATCH /v1/admin/kyc/reject/:id
   - POST /compile
   - GET /resolve/:hash
   - GET /health

---

## Part 17: Closing (1 min)

**Narration:**
"fairflow provides a complete pipeline from merchant onboarding to product compilation, hash-based resolution, and checkout. Set PUBLIC_API_BASE_URL and ADMIN_SECRET_KEY for production. See docs/DEPLOYMENT.md and docs/DEPLOYMENT-CHECKLIST.md for deployment."

**On screen:**
- Show docs/README.md or DEPLOYMENT.md
- End with fairflow logo or README

---

## Recording Checklist

- [ ] API running on 3000
- [ ] Portal running on 5178
- [ ] Supabase configured (admin login)
- [ ] Stripe test keys (checkout)
- [ ] Admin email in AuthContext (e.g. matome@fairflow.dev)
- [ ] Screen resolution 1920x1080 or 1280x720
- [ ] Clear browser cache, no extensions (or use clean profile)
- [ ] Prepare test data: 1-2 products, 1 order if possible

---

## Suggested Tools

- **Screen capture:** OBS Studio, Loom, QuickTime (Mac), Xbox Game Bar (Windows)
- **Microphone:** Clear audio, minimal background noise
- **Cursor:** Consider hiding or using a high-contrast cursor for visibility
