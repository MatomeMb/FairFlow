# Pivot Execution Analysis: M-State & C-State Separation
## Comprehensive Implementation Guide for Weekend Sprint

**Meeting Date:** February 20, 2026, 13:30–14:45  
**Participants:** Sobuhle Nyambali (Strategy), Matome Mbowene (Engineering)  
**Sprint Window:** Feb 20–24, 2026 (Weekend + Mon morning)  
**Follow-up:** Monday, Feb 24, 2026

---

## Executive Summary

The meeting introduced a **fundamental architectural pivot** away from Week 2 "polish single-product flow" toward **merchant/consumer state separation with payment infrastructure improvements**. This shift addresses critical merchant experience blockers and enables sustainable payment handling.

**Key Decisions Made:**
1. **Eliminate CSV uploads** → Replace with template-based .thing file compilation
2. **Separate M-state (merchant) from C-state (consumer)** → Distinct flows, UX, data models
3. **Implement merchant of record (MoR) account** → Stripe Connect replacement for scalability
4. **Build delivery address system** → Separate from billing, transmit to merchant + email
5. **Implement merchant notifications** → Email + in-app alerts when orders arrive

**Impact Assessment:**
- **Scope Change:** 40-50% implementation increase (new payment flow, address system, notifications)
- **Timeline Compression:** 5 days to MVP (aggressive but achievable with clear priorities)
- **Complexity Increase:** Merchant account KYC, payment reconciliation, address validation
- **Value Unlock:** Scalable payment infrastructure, professional merchant dashboard, accurate fulfillment data

**Critical Path:** Payment flow (MoR account) → Merchant dashboard → Delivery address system → Notifications

---

## 1. Current State vs. New Architecture

### 1.1 State Comparison Matrix

| Aspect | Week 1/2 (Old) | New Direction (Pivot) |
|--------|----------------|----------------------|
| **Product Upload** | CSV file → drag/drop | Template-based .thing files |
| **Merchant Flow** | ProductPage checkout only | M-state: dashboard, orders, KYC, payouts |
| **Consumer Flow** | matter:// URI → checkout | C-state: shop, cart (future), delivery address |
| **Payment Collection** | Stripe Checkout Sessions | Merchant of record account (bank holding) |
| **Merchant Payouts** | Immediate via Stripe | Batched from MoR account (new KYC) |
| **Address Data** | Email required only | Billing + Delivery addresses (separate) |
| **Order Notification** | Silent (no alerts) | Email + in-app alerts to merchant |
| **Merchant Dashboard** | Analytics-focused | Order-focused, KYC, payout management |
| **Inventory Management** | Hardcoded in .thing | Dynamic backend via stock-keeping service |

### 1.2 System Architecture Evolution

**Old Flow:**
```
CSV Upload
    ↓
Compile to .thing + hash
    ↓
ProductPage (via matter:// URI)
    ↓
Stripe Checkout Session
    ↓
Payment confirmation
    ↓
Order stored (orders.json)
    �- No merchant notification
    �- No address for fulfillment
    �- No payout management
```

**New Flow:**
```
MERCHANT STATE (M-STATE):
├─ Merchant logs in → M-state dashboard
├─ Creates products via template (no CSV)
├─ Manages inventory (stock-keeping backend)
├─ Receives order notifications (email + in-app)
├─ Views KYC status + payout schedule
└─ Completes KYC → unlocks payouts from MoR account

CONSUMER STATE (C-STATE):
├─ Browses products (ConsumerShop)
├─ Clicks matter:// URI → ProductPage
├─ Enters billing address (Stripe)
├─ Enters delivery address (NEW - separate)
├─ Completes payment
└─ Order stored with full address data

PAYMENT INFRASTRUCTURE:
Merchant of Record Account (Bank)
    ↓
Holds consumer payments
    ↓
Merchants complete KYC
    ↓
Payments released on schedule (weekly/monthly)
```

---

## 2. Detailed Requirements Breakdown

### 2.1 M-STATE: Merchant Dashboard Redesign

#### 2.1.1 Replace CSV Upload with Template-Based .thing Compilation

**Current:** CSV upload + compile flow in merchant portal.

**New:** Template-based product creation with immediate `.thing` generation and publish.

**Data Model (Target):**
```typescript
interface MerchantProduct {
  id: string;
  merchant_id: string;
  title: string;
  description?: string;
  price_cents: number;
  currency: 'ZAR';
  category: string;
  stock_count: number;
  image_url?: string;
  shipping_available: boolean;
  certifications: string[];
  thing_file: {
    hash: string;
    matter_uri: string;
    thing_url: string;
    generated_at: string;
  };
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}
```

**Required APIs:**
- `POST /v1/merchant/products`
- `GET /v1/merchant/products`
- `PATCH /v1/merchant/products/:id`
- `DELETE /v1/merchant/products/:id`
- `GET /v1/merchant/products/:id/thing.json`

---

#### 2.1.2 Stock-Keeping Backend (Inventory)

**Need:** Dynamic stock counts, decrement on order, low-stock warning.

```typescript
interface InventoryLog {
  id: string;
  product_id: string;
  merchant_id: string;
  transaction_type: 'order' | 'restock' | 'adjustment';
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  reference_id?: string;
  timestamp: string;
}
```

**Required APIs:**
- `POST /v1/merchant/products/:id/restock`
- `GET /v1/merchant/products/:id/stock-history`
- Order finalization updates stock

---

#### 2.1.3 Merchant Notification System

**Need:** Email + in-app notifications for new orders and operational events.

```typescript
interface MerchantNotification {
  id: string;
  merchant_id: string;
  type: 'order_received' | 'low_stock' | 'payout_processed' | 'kyc_approved';
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}
```

**Required APIs:**
- `GET /v1/merchant/notifications`
- `PATCH /v1/merchant/notifications/:id`
- `DELETE /v1/merchant/notifications/:id`

---

#### 2.1.4 Enhanced M-state Dashboard

Tabs required:
1. Home Dashboard (sales summary, recent orders, low stock, KYC)
2. Products (create/edit/archive + stock)
3. Orders (delivery details + fulfill action)
4. KYC & Payouts
5. Analytics

---

### 2.2 C-STATE: Consumer Checkout Updates

#### 2.2.1 Delivery Address System (Separate from Billing)

**Target Order shape:**
```typescript
interface Order {
  id: string;
  session_id: string;
  product_id: string;
  merchant_id: string;
  customer: {
    email: string;
    billing_address: Record<string, string>;
    delivery_address: {
      name: string;
      line1: string;
      line2?: string;
      suburb: string;
      city: string;
      postal_code: string;
      phone: string;
    };
  };
  payment: {
    status: 'paid' | 'pending' | 'failed';
    stripe_session_id: string;
    amount_cents: number;
    currency: 'ZAR';
  };
  stock_reserved: boolean;
  created_at: string;
  updated_at: string;
}
```

**Required API update:**
- `POST /checkout/create-session` must accept delivery address payload.

---

### 2.3 Payment Infrastructure: Merchant of Record (MoR)

**Target capabilities:**
- Merchant KYC status tracking
- Pending vs released payouts
- Commission logic
- Payout history + reconciliation

```typescript
interface MerchantAccount {
  id: string;
  user_id: string;
  business_name: string;
  email: string;
  kyc_status: 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
  commission_rate: number;
  payout_frequency: 'weekly' | 'monthly';
  payout_minimum: number;
  total_earnings: number;
  pending_payout: number;
  next_payout_date?: string;
  created_at: string;
  updated_at: string;
}
```

```typescript
interface PayoutLog {
  id: string;
  merchant_id: string;
  orders_included: string[];
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transferred_at?: string;
  reference_id?: string;
  created_at: string;
}
```

---

## 3. Technical Implementation Roadmap

### 3.1 Critical Path

1. Product template + API
2. Delivery address capture + order persistence
3. Merchant notifications
4. KYC + payout tracking

### 3.2 Day-by-Day Sprint Plan

**Day 1 (Thu):** Product template foundation + schemas  
**Day 2 (Fri):** Delivery address + notification infrastructure  
**Day 3 (Sat):** KYC/payout backend + dashboard states  
**Day 4 (Sun):** End-to-end integration testing  
**Day 5 (Mon AM):** Polish + demo prep

---

## 4. Database & API Changes Summary

### 4.1 New Data Entities
- `merchant_products`
- `inventory_logs`
- `merchant_notifications`
- `merchant_accounts`
- `payout_logs`

### 4.2 Existing Entity Updates
- `orders`: add `delivery_address`, `merchant_id`, `fulfillment_status`

### 4.3 New Endpoints
- Products: `POST/GET/PATCH/DELETE /v1/merchant/products...`
- Inventory: restock/history
- Notifications: list/read/archive
- Orders: merchant list + fulfill
- KYC/Payouts: start, account, payouts, batch payout

---

## 5. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Schema drift | Medium | High | Freeze schema before frontend wiring |
| Email integration delay | Medium | Medium | Start with in-app + queue email send |
| Stripe metadata/address mismatch | Medium | High | Add checkout payload validation + webhook assertions |
| Payout logic errors | Low | High | Add deterministic commission tests |
| Scope creep | High | Medium | Strictly follow critical path |

---

## 6. Monday Demo Success Metrics

- Merchant can create product via form (no CSV)
- `.thing` + `matter://` generated and visible
- Consumer can checkout with separate delivery address
- Order stored with delivery details
- Merchant receives notification
- Inventory decrements and low-stock state works
- KYC and payout status visible

---

## 7. Post-Weekend Next Priorities

- Stripe Connect / MoR deeper integration
- Automated payouts scheduler
- Consumer delivery notifications
- Fraud controls and audit enhancements

---

## 8. Appendix: Implementation Notes

### A) Product create route (outline)
```typescript
app.post('/v1/merchant/products', async (c) => {
  // validate payload
  // generate .thing payload
  // hash payload -> matter URI
  // persist product + thing mapping
  // return published product object
});
```

### B) Delivery address handling
- Validate on client and server
- Save payload reference through Stripe session metadata
- Finalize and persist on webhook confirmation

### C) Notification trigger points
- `order_received`
- `low_stock`
- `kyc_approved`
- `payout_processed`

---

## Conclusion

This pivot prioritizes operational scalability: merchant product operations, delivery correctness, payout readiness, and business-grade notifications. Execution success depends on strict sequencing, schema discipline, and daily integration testing.

**Status:** Active execution document  
**Version:** 1.0 (Restored)  
**Date:** February 20, 2026
Bank account management

5. **Analytics**
   - Views, clicks, conversion rate per product
   - Revenue trend
   - Top products by sales

**Effort Estimate:** 20-24 hours  
**Dependencies:**
- All above modules (products, orders, notifications, KYC)

---

### 2.2 C-STATE: Consumer Checkout Flow Updates

#### 2.2.1 Delivery Address System

**Current Flow:**
```
ProductPage
├─ Product details
├─ Email input (for order receipt)
└─ "Buy Now" → Stripe Checkout
   └─ Stripe collects billing address (but no shipping address context)
```

**New Flow:**
```
ProductPage
├─ Product details
├─ Email input
├─ Billing Address (from Stripe prefill)
├─ Delivery Address (NEW - separate field):
│  ├─ Street address
│  ├─ Suburb/city
│  ├─ Postal code
│  └─ Phone (for delivery)
└─ "Buy Now" → Stripe Checkout
   └─ Stripe collects payment only
   └─ Delivery address already on client
   
After Stripe success:
├─ Order created with:
│  ├─ Billing address (from Stripe)
│  ├─ Delivery address (user input)
│  ├─ Customer email
│  └─ Product details
└─ Merchant notified with delivery address
```

**Implementation:**

**Update Order Schema:**
```typescript
interface Order {
  id: string;
  session_id: string;           // Stripe session ID
  product_id: string;
  merchant_id: string;
  customer: {
    email: string;
    billing_address: {
      name?: string;
      line1: string;
      line2?: string;
      city: string;
      postal_code: string;
      country: string;
    };
    delivery_address: {          // NEW
      name: string;              // Recipient name
      line1: string;             // Street address
      line2?: string;            // Apartment, floor, etc.
      suburb: string;            // Suburb/neighborhood
      city: string;
      postal_code: string;
      phone: string;             // Delivery contact
    };
  };
  payment: {
    status: 'paid' | 'pending' | 'failed';
    stripe_session_id: string;
    amount_cents: number;
    currency: 'ZAR';
  };
  stock_reserved: boolean;       // Inventory decremented?
  created_at: string;
  updated_at: string;
}
```

**ProductPage Changes:**
```tsx
// Add delivery address form before checkout
<DeliveryAddressForm 
  onSubmit={(address) => {
    setDeliveryAddress(address);
    initiateCheckout();
  }}
/>

// Modified checkout initiation
const initiateCheckout = async () => {
  const response = await fetch('/checkout/create-session', {
    method: 'POST',
    body: JSON.stringify({
      product_id: hash,
      email,
      delivery_address: deliveryAddress  // NEW
    })
  });
  // ... Stripe redirect
};
```

**API Changes:**
```
POST /checkout/create-session (MODIFIED)
  Request body now includes:
  {
    product_id: string;
    email: string;
    delivery_address: {
      name: string;
      line1: string;
      line2?: string;
      suburb: string;
      city: string;
      postal_code: string;
      phone: string;
    }
  }
  
  Response: same (Stripe session ID)
  
  Side effect: Store delivery_address in Stripe metadata or temp storage
              (retrieve on webhook callback)
```

**Webhook Handler Update:**
```
POST /webhooks/stripe (MODIFIED)
  - On payment_intent.succeeded:
    ├─ Retrieve Stripe session
    ├─ Retrieve delivery_address from metadata
    ├─ Create Order with both addresses
    ├─ Decrement inventory
    ├─ Create merchant notification with delivery address
    └─ Send email to merchant with fulfillment details
```

**Effort Estimate:** 14-16 hours  
**Dependencies:**
- Form validation library (react-hook-form already in use?)
- Postal code validation API (optional but recommended)

---

#### 2.2.2 Enhanced Order Confirmation Email

**Current:** Basic Stripe receipt

**New:** Branded email from Things That Matter with:
- Product purchased
- Delivery address (for feedback: "We'll deliver here")
- Estimated delivery timeframe (if applicable)
- Merchant contact info
- Track order link (if available)
- How to reach support

**Effort Estimate:** 4-6 hours  
**Dependencies:**
- Email template system (SendGrid templates)
- Order lookup endpoint for consumer

---

### 2.3 Payment Infrastructure: Merchant of Record Account

#### 2.3.1 Current Payment Model (Stripe Direct)

```
Consumer Payment
    ↓
Stripe Checkout Session
    ↓
Payment cleared to merchant's connected account
    ↓
Merchant receives funds (minus Stripe fee ~2.9% + $0.30)
```

**Problems:**
- Requires each merchant to have Stripe account
- KYC friction for micro-merchants
- No platform visibility into transactions
- Merchant payout failure = consumer complaint → platform liability

---

#### 2.3.2 New Payment Model (Merchant of Record)

```
Consumer Payment
    ↓
Stripe Payment → Platform MoR Account (Sobuhle's bank)
    ↓
Funds held in MoR account
    ↓
Merchant completes KYC
    ↓
Weekly/monthly batch release to merchant's bank account
    ↓
Platform takes 5-8% commission (instead of Stripe rerouting)
```

**Benefits:**
- Merchants don't need Stripe accounts initially
- Platform has full transaction visibility
- Reduced KYC friction (platform-level, not per-merchant)
- Platform captures margin (commission model vs. transaction tax)
- Chargebacks handled at platform level

**Sobuhle's Responsibility:**
- Set up bank account (MoR account)
- Research KYC/AML requirements
- Integrate with payout service (e.g., Wise API for batch transfers)
- Fraud prevention policies

**Matome's Responsibility:**
- Stripe Connect → Stripe Custom (direct account collection)
- KYC status tracking in DB
- Payout scheduler (weekly/monthly batches)
- Payout reconciliation
- Commission deduction logic

---

#### 2.3.3 Implementation Plan (Stripe Approach)

**Option A: Stripe Atlas (Recommended for MVP)**
- Stripe handles KYC on behalf of platform
- Platform still receives all transaction visibility
- Stripe manages payout to merchants
- Commission deducted at platform level

**Option B: Stripe Connect Custom (Future)**
- Full control over KYC flow
- Manual payout scheduling
- More complexity, but higher margin

**For this weekend: Use Stripe Atlas + Custom Commission Layer**

**Database Schema (New):**
```typescript
interface MerchantAccount {
  id: string;
  user_id: string;
  business_name: string;
  email: string;
  kyc_status: 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
  kyc_data?: {
    id_number: string;
    date_of_birth: string;
    address: string;
    phone: string;
  };
  kyc_verified_at?: string;
  bank_account?: {
    account_name: string;
    account_number: string;
    branch_code: string;
    bank_name: string;
  };
  commission_rate: number;       // 5-8%, default 6%
  payout_frequency: 'weekly' | 'monthly';  // When funds are released
  payout_minimum: number;        // Min balance before payout (e.g., 500 ZAR)
  total_earnings: number;        // Lifetime earnings (cents)
  pending_payout: number;        // Held in MoR account (cents)
  next_payout_date?: string;
  created_at: string;
  updated_at: string;
}

interface PayoutLog {
  id: string;
  merchant_id: string;
  orders_included: string[];     // Order IDs
  gross_amount: number;          // Before commission
  commission_amount: number;
  net_amount: number;            // Merchants receives
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transferred_at?: string;
  reference_id?: string;         // Bank/Wise transfer ID
  created_at: string;
}
```

**API Endpoints (New):**
```
POST /v1/merchant/kyc/start
  - Initiates KYC process
  - Returns link to Stripe verification flow (or custom KYC form)

POST /v1/merchant/kyc/callback
  - Webhook from KYC provider
  - Updates kyc_status

GET /v1/merchant/account
  - Returns merchant account details
  - Includes: KYC status, pending payout, payout history

GET /v1/merchant/payouts
  - List payout logs (pending, completed, failed)

POST /v1/admin/payouts/batch
  - Process weekly/monthly batch payouts
  - Calculates: (order total - platform commission) for each merchant
  - Initiates transfers via Wise/bank API
  - Creates payout log entries
```

**Weekend Implementation Scope:**
- [DONE] Merchant account DB schema
- [DONE] KYC status tracking (basic form, no external service integration)
- [DONE] Payout log schema
- [DONE] Commission calculation logic
- [IN-PROGRESS] Stripe Connect integration (may defer to early next week)
- [IN-PROGRESS] Automated payout scheduler (can be manual initially)

**Effort Estimate:** 18-22 hours  
**Dependencies:**
- Stripe Connect credentials setup
- Bank account verification (Sobuhle's responsibility)
- Wise API credentials (for batch transfers)

---

## 3. Technical Implementation Roadmap

### 3.1 Critical Path (Must Complete This Weekend)

**Path 1: Merchant State M-State (12 hours)**
1. Product template form + API endpoint (6h)
2. Inventory tracking schema + decrement logic (4h)
3. Product listing UI update (2h)

**Path 2: Delivery Address System (10 hours)**
1. Order schema update + DB migration (3h)
2. Delivery address form on ProductPage (4h)
3. Webhook handler update to store address (2h)
4. Merchant notification with address (1h)

**Path 3: Merchant Notifications (8 hours)**
1. Notification schema + DB (2h)
2. Email integration (SendGrid) (3h)
3. In-app notification UI (2h)
4. Notification trigger on order (1h)

**Path 4: Basic KYC & Payout Tracking (10 hours)**
1. Merchant account schema (2h)
2. KYC status form (3h)
3. Commission calculation (2h)
4. Payout log schema (2h)
5. Dashboard KYC/payout UI (1h)

**Total Critical Path: 40 hours (5 days × 8 hours)**

---

### 3.2 Day-by-Day Sprint Plan

#### **Day 1: Thursday, Feb 20 (EOD)**
**Focus:** Architecture setup + Product template foundation

- [ ] Database schema migration (Products table, MerchantAccount, PayoutLog)
- [ ] ProductTemplate form component
- [ ] POST /v1/merchant/products endpoint
- [ ] Product detail update UI
- **Deliverable:** Merchants can create products via form (no CSV)

**Hours: 8-10**  
**Risks:** DB schema decisions; need to finalize before Friday

---

#### **Day 2: Friday, Feb 21**
**Focus:** Delivery address + notifications foundation

- [ ] Delivery address form on ProductPage
- [ ] Order schema update (add delivery address)
- [ ] Notification schema + DB
- [ ] Email template setup (SendGrid)
- [ ] Webhook handler update (store address)
- **Deliverable:** Orders capture delivery address; merchant receives notification email

**Hours: 10-12**  
**Risks:** Email service integration; may need SendGrid account setup

---

#### **Day 3: Saturday, Feb 22**
**Focus:** KYC + Payout infrastructure + Dashboard

- [ ] Merchant account table + basic KYC form
- [ ] Commission calculation logic
- [ ] PayoutLog schema + payout history UI
- [ ] M-state dashboard: orders tab with delivery address
- [ ] Inventory decrement on order completion
- [ ] Low stock warning trigger
- **Deliverable:** Full merchant dashboard with orders, KYC status, payout history

**Hours: 12-14**  
**Risks:** KYC form complexity; may simplify for MVP

---

#### **Day 4: Sunday, Feb 23**
**Focus:** Integration + Testing

- [ ] End-to-end testing: form create → ProductPage checkout → order → notification
- [ ] Mobile testing (delivery address form)
- [ ] Merchant notification email testing
- [ ] Inventory decrement verification
- [ ] KYC form validation
- [ ] Analytics updates (product creation, order tracking)
- **Deliverable:** Full flow tested; ready for Monday demo

**Hours: 8-10**  
**Risks:** Integration bugs; order flow has multiple new steps

---

#### **Day 5: Monday, Feb 24 (Morning)**
**Focus:** Polish + Demo prep

- [ ] Bug fixes from Sunday testing
- [ ] UI polish (error messages, loading states)
- [ ] Documentation (API changes, schema updates)
- [ ] Demo script prep
- [ ] Sobuhle: Review MoR account setup progress
- **Deliverable:** 13:30 meeting demo-ready

**Hours: 4-6**

---

### 3.3 Technical Debt & Deferred Items

**Out of Scope (Next Week):**
- [ ] Automated payout scheduler (manual batch processing acceptable for MVP)
- [ ] Stripe Connect full integration (KYC form can be simple for now)
- [ ] Consumer delivery tracking/notifications (M-state first)
- [ ] Advanced fraud detection (basic validation only)
- [ ] Multi-currency support (ZAR only for MVP)
- [ ] Bulk product import (template form only)

---

## 4. Database & API Changes Summary

### 4.1 New Tables

```sql
CREATE TABLE merchant_products (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  category VARCHAR(50),
  stock_count INTEGER NOT NULL,
  image_url VARCHAR(2048),
  shipping_available BOOLEAN,
  certifications JSONB,
  thing_file JSONB,  -- { hash, matter_uri, thing_url, generated_at }
  status VARCHAR(20) DEFAULT 'draft',  -- draft, published, archived
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  merchant_id UUID NOT NULL,
  transaction_type VARCHAR(20),  -- order, restock, adjustment
  quantity_change INTEGER,
  stock_before INTEGER,
  stock_after INTEGER,
  reference_id VARCHAR(100),
  timestamp TIMESTAMP
);

CREATE TABLE merchant_notifications (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL,
  type VARCHAR(50),  -- order_received, low_stock, payout_processed, kyc_approved
  title VARCHAR(255),
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

CREATE TABLE merchant_accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name VARCHAR(255),
  email VARCHAR(255),
  kyc_status VARCHAR(20),  -- not_started, pending, approved, rejected
  kyc_data JSONB,
  kyc_verified_at TIMESTAMP,
  bank_account JSONB,
  commission_rate DECIMAL,
  payout_frequency VARCHAR(20),
  payout_minimum INTEGER,
  total_earnings INTEGER,
  pending_payout INTEGER,
  next_payout_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE payout_logs (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL,
  orders_included JSONB,  -- Array of order IDs
  gross_amount INTEGER,
  commission_amount INTEGER,
  net_amount INTEGER,
  status VARCHAR(20),  -- pending, processing, completed, failed
  transferred_at TIMESTAMP,
  reference_id VARCHAR(100),
  created_at TIMESTAMP
);
```

### 4.2 Updated Tables

```sql
-- orders table (add delivery address fields)
ALTER TABLE orders ADD COLUMN delivery_address JSONB;
ALTER TABLE orders ADD COLUMN merchant_id UUID;
ALTER TABLE orders ADD COLUMN fulfillment_status VARCHAR(20) DEFAULT 'pending';

-- Update schema to match new Order interface
```

### 4.3 New API Endpoints

**Product Management:**
- `POST /v1/merchant/products` — Create product
- `GET /v1/merchant/products` — List products
- `PATCH /v1/merchant/products/:id` — Update product
- `DELETE /v1/merchant/products/:id` — Archive product
- `GET /v1/merchant/products/:id/thing.json` — Download .thing file

**Inventory:**
- `POST /v1/merchant/products/:id/restock` — Add inventory
- `GET /v1/merchant/products/:id/stock-history` — Inventory log

**Notifications:**
- `GET /v1/merchant/notifications` — List notifications
- `PATCH /v1/merchant/notifications/:id` — Mark read
- `DELETE /v1/merchant/notifications/:id` — Archive

**Orders:**
- `GET /v1/merchant/orders` — List merchant's orders
- `PATCH /v1/merchant/orders/:id/fulfill` — Mark fulfilled

**KYC & Payouts:**
- `POST /v1/merchant/kyc/start` — Start KYC
- `GET /v1/merchant/account` — Get account details
- `GET /v1/merchant/payouts` — Payout history

**Admin:**
- `POST /v1/admin/payouts/batch` — Process batch payouts

---

## 5. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| DB schema undefined by Friday | High | Critical | **Finalize schema before coding starts** |
| Email service integration delays | Medium | High | Use dummy email initially; SendGrid integration can be async |
| Stripe Connect complexity exceeds timeline | High | Medium | Simplify KYC to basic form; full Stripe integration next week |
| Webhook handler buggy (address not stored) | Medium | High | Extensive webhook testing; temporary address fallback |
| Product form validation fails | Medium | Medium | Use existing form library; reuse CSV validation logic |
| Payout calculations incorrect | Medium | High | Commission math reviewed by Sobuhle before deployment |
| Mobile address form UX poor | Medium | Medium | Test on phone daily; keep fields minimal (6 fields max) |
| Analytics tracking breaks on new flow | Medium | Medium | Don't change analytics; just log new events |

---

## 6. Success Metrics for Monday Demo

### Functional Checklist
- [ ] Merchant creates product via form (no CSV) → generates .thing file
- [ ] Product appears in ConsumerShop immediately
- [ ] Consumer clicks matter:// URI → ProductPage
- [ ] Consumer enters delivery address (separate from billing)
- [ ] Consumer completes Stripe checkout
- [ ] Order created with delivery address
- [ ] Merchant receives notification email with delivery address
- [ ] Merchant sees order in "Orders" tab with fulfillment status
- [ ] Merchant can mark order "Fulfilled"
- [ ] Inventory decremented on order; low stock alert shown

### Quality Checklist
- [ ] No console errors on ProductPage or merchant dashboard
- [ ] Delivery address form validates (required fields)
- [ ] Email includes all necessary fulfillment info
- [ ] Payout history shows correct commission deductions
- [ ] Mobile checkout works on iPhone 12 minimum

### Process Checklist
- [ ] Sobuhle has MoR bank account research completed
- [ ] Matome has schema/API docs updated
- [ ] Demo recorded or live test prepared

---

## 7. Post-Weekend Priorities (Early Next Week)

**Week 3 (Continuation):**
1. Full Stripe Connect integration (KYC, automated payouts)
2. Consumer delivery tracking notifications
3. Bulk product import (CSV for existing merchants)
4. Advanced fraud detection (blacklist/whitelist)
5. Multi-currency support (USD, EUR)
6. Session cart checkout (Week 2 proposal, now Week 3)

---

## 8. Appendix: Code Examples

### A. Product Template API (Pseudocode)

```typescript
// POST /v1/merchant/products
app.post('/v1/merchant/products', authenticate, async (c) => {
  const merchant = c.get('merchant');  // From auth context
  const body = await c.req.json();
  
  // Validate form data
  const validated = productSchema.parse(body);
  
  // Generate .thing file
  const thingData = {
    product: {
      id: uuid(),
      title: validated.title,
      description: validated.description,
      price: validated.price_cents,
      currency: 'ZAR',
      image_url: validated.image_url,
      category: validated.category,
    },
    commerce: {
      merchant_id: merchant.id,
      payment_gateway: 'stripe',
      supported_currencies: ['ZAR'],
      shipping_available: validated.shipping_available,
    },
    metadata: {
      schema_version: '1.0',
      created_at: new Date().toISOString(),
      certifications: validated.certifications,
      stock_count: validated.stock_count,  // NEW: include stock in metadata
    },
  };
  
  // Hash the .thing file
  const thingJson = JSON.stringify(thingData);
  const hash = sha256(thingJson);
  
  // Store in DB
  const product = {
    id: uuid(),
    merchant_id: merchant.id,
    ...validated,
    thing_file: {
      hash,
      matter_uri: `matter://${hash}`,
      thing_url: `https://domain.com/thing/${hash}.json`,
      generated_at: new Date().toISOString(),
    },
    status: 'published',
    created_at: new Date(),
  };
  
  await db.insert('merchant_products', product);
  
  // Store .thing file for download
  await storage.put(`things/${hash}.json`, thingJson);
  
  return c.json(product, 201);
});
```

### B. Delivery Address Form

```tsx
// DeliveryAddressForm.tsx
import { useForm } from 'react-hook-form';

export function DeliveryAddressForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      line1: '',
      suburb: '',
      city: 'Cape Town',
      postal_code: '',
      phone: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>Delivery Address</h3>
      
      <input
        {...register('name', { required: 'Recipient name required' })}
        placeholder="Name of recipient"
        type="text"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register('line1', { required: 'Street address required' })}
        placeholder="Street address"
        type="text"
      />

      <input
        {...register('suburb')}
        placeholder="Suburb/neighborhood"
        type="text"
      />

      <input
        {...register('city')}
        placeholder="City"
        type="text"
      />

      <input
        {...register('postal_code', { required: 'Postal code required' })}
        placeholder="Postal code"
        type="text"
      />

      <input
        {...register('phone', { required: 'Phone required for delivery' })}
        placeholder="Phone number"
        type="tel"
      />

      <button type="submit">Continue to Payment</button>
    </form>
  );
}
```

### C. Order Notification Email Template

```html
<!-- SendGrid/Email template -->
<h1>New Order: {{product_title}}</h1>

<p>You have a new order on Things That Matter!</p>

<h2>Order Details</h2>
<ul>
  <li><strong>Order ID:</strong> {{order_id}}</li>
  <li><strong>Product:</strong> {{product_title}}</li>
  <li><strong>Price:</strong> R{{price}}</li>
  <li><strong>Customer Email:</strong> {{customer_email}}</li>
</ul>

<h2>Delivery Address</h2>
<address>
  {{delivery_address.name}}<br>
  {{delivery_address.line1}}<br>
  {{#if delivery_address.line2}}
    {{delivery_address.line2}}<br>
  {{/if}}
  {{delivery_address.suburb}}, {{delivery_address.city}}<br>
  {{delivery_address.postal_code}}<br>
  {{delivery_address.phone}}
</address>

<p>
  <a href="{{dashboard_url}}/orders/{{order_id}}">
    View order in your dashboard →
  </a>
</p>

<p>Things That Matter Team</p>
```

---

## Conclusion

This pivot redirects the platform toward **sustainable merchant operations** rather than consumer experience polish. By implementing merchant state management, delivery addresses, and payment infrastructure this weekend, we establish the foundation for:

1. **Scaling merchants** (no per-merchant Stripe account needed)
2. **Accurate fulfillment** (delivery addresses transmitted properly)
3. **Operational efficiency** (merchants notified, inventory managed)
4. **Revenue model** (commission-based, not transaction tax)

**Next steps:**
- Sobuhle: Finalize MoR bank account setup + KYC research
- Matome: Execute 40-hour sprint per roadmap above
- Monday 13:30: Demo completed flow + discuss Week 3 priorities

---

**Document Version:** 1.0  
**Last Updated:** February 20, 2026  
**Status:** Ready for implementation sprint
