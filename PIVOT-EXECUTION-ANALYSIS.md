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
    ✗ No merchant notification
    ✗ No address for fulfillment
    ✗ No payout management
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
