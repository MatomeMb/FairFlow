# Payment Flow & Bank Account Integration

## Current Payment Architecture

### High-Level Flow
```
Customer → Stripe Checkout → Payment Verified → Webhook → Order Created → Payout to Merchant Account
```

### Detailed Steps

1. **Customer Checkout**
   - Customer clicks "Buy" on product
   - Frontend calls `POST /checkout/create-session`
   - Stripe session created with product details
   - Customer redirected to Stripe payment form

2. **Payment Processing**
   - Customer enters card details on Stripe servers
   - Stripe processes payment securely
   - Payment confirmed or rejected

3. **Order Creation & Settlement**
   - Stripe sends webhook: `checkout.session.completed`
   - Shadow Index API receives webhook
   - Order record created with:
     - Customer email
     - Product hash
     - Stripe session ID
     - Gross amount (customer pays)
     - Commission deducted
     - Net amount (merchant receives)

4. **Payout to Merchant**
   - Order queued for payout
   - Admin releases payout (weekly/monthly cycle)
   - Funds transferred to merchant's bank account
   - Payout status updated: pending → completed

---

## Connecting Sobuhle's Personal Bank Account

### Step 1: Update Merchant Account with Bank Details

**API Endpoint:** `POST /v1/merchant/account/update-bank`

**Request Body:**
```json
{
  "bank_account": {
    "account_name": "Sobuhle Nyambali",
    "account_number": "1234567890",
    "branch_code": "051001",
    "bank_name": "Standard Bank"
  }
}
```

**Current Schema (in codebase):**
```typescript
bank_account?: {
  account_name: string;
  account_number: string;
  branch_code: string;
  bank_name: string;
};
```

### Step 2: Operational Flow for Temporary Banking

Since CIPC and formal business accounts aren't ready:

1. **Stripe receives payment** → Goes to Stripe's account temporarily
2. **Order recorded** → Merchant dashboard shows pending balance
3. **Weekly payout release** → Admin triggers payout
4. **Funds transferred** → To Sobuhle's personal account via bank transfer
5. **Payout logged** → Fully auditable record for future reconciliation

### Step 3: Alternative: Hold Funds at Stripe

While waiting for business banking, keep funds in Stripe:
- **Pros**: No intermediate account needed, clean separation, Stripe handles security
- **Cons**: Stripe takes time to settle (1-2 business days)

**This is the safer option** — funds stay with Stripe (regulated financial entity) until business account is ready.

---

## Payment Providers Comparison

| Provider | Fee | Settlement Time | KYC Required | Temp Account Support |
|----------|-----|-----------------|--------------|----------------------|
| **Stripe** | 2.9% + R5.50 | 1-2 business days | Yes (deferred) | ✅ Yes - keep funds there |
| **PayFast (SA)** | 3.5% + R2 | 24-48 hours | Yes | ✅ Yes |
| **Luno** | 1% + R0.50 | Real-time | Minimal initial | ✅ Yes - crypto to ZAR |
| **PayPal** | 3.5% + R0.80 | 24 hours | Yes | ✅ Yes |
| **FNB PayWeb** | 2% + R5 | 2-3 days | Yes | ✅ Yes - business temp |

**Recommended Approach:**
1. **Short-term (now)**: Keep funds at Stripe while CIPC processes
2. **Long-term (1-2 weeks)**: Set up business bank account + Stripe Connect
3. **Fallback**: Use PayFast or Luno if Stripe Connect has delays

---

## Current Implementation Status

### ✅ Already Implemented
- Stripe checkout integration
- Payment webhook handling
- Order creation & settlement
- Commission calculation (3% default, configurable)
- Payout log tracking
- Bank account field in merchant schema

### 🔄 In Progress / To Do
- Stripe Connect for direct bank transfers
- Automated payout scheduler
- KYC verification flow (basic form exists)
- Payout release dashboard (admin interface)

---

## Environment Variables Required

```env
# .env for shadow-index
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Merchant account will store:
# - bank_account.account_name
# - bank_account.account_number
# - bank_account.branch_code
# - bank_account.bank_name
```

---

## Next Steps

1. **Confirm approach** with Sobuhle:
   - Option A: Hold at Stripe until business account ready
   - Option B: Transfer weekly to personal account
   - Option C: Use alternative provider (PayFast, etc.)

2. **Update merchant account** with bank details (SQL query or API call)

3. **Test payout flow** with small transaction

4. **Set up payout release** (admin dashboard or manual trigger)

5. **Monitor & reconcile** daily until formal banking in place

---

## Security Considerations

- ✅ Stripe handles PCI compliance (no card data stored)
- ✅ Bank account not exposed in API responses
- ✅ All transactions logged and auditable
- ⚠️ Personal account should be segregated from business operations once CIPC approved
- ⚠️ Document all transfers for future reconciliation/audit

---

## Code Examples

### Creating Order on Webhook
```typescript
// POST /webhooks/stripe
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const order = {
    id: session.id,
    product_hash: session.metadata.product_hash,
    customer_email: session.customer_email,
    gross_amount: session.amount_total,
    commission_amount: calculated_commission,
    net_amount: gross_amount - commission,
    status: 'pending',
    created_at: now,
  };
  // Order stored, awaits payout release
}
```

### Releasing Payout to Bank Account
```typescript
// POST /v1/admin/payouts/release
// Triggers transfer to merchant.bank_account
const transfer = await bankingProvider.transfer({
  amount: merchant.pending_payout,
  account: merchant.bank_account,
  reference: payout_id,
});
// Updates payout status: pending → completed
```

---

## Recommendation

**Use Option A: Hold at Stripe**

Sobuhle should:
1. Set up Stripe Connect account (5 minutes)
2. Keep funds at Stripe during CIPC process (low risk, regulated)
3. Once business account approved, connect as primary payout destination
4. All interim funds reconciled automatically

This avoids personal account entanglement and is audit-friendly.
