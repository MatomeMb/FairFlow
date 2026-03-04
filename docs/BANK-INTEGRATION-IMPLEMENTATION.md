# Bank Account Integration - Implementation Guide

## Quick Setup: Connect Sobuhle's Bank Account

### 1. Update Merchant Profile

**Location:** `packages/shadow-index/api/index.ts`

Add this endpoint to allow merchant to update bank details:

```typescript
// PATCH /v1/merchant/account/bank
app.patch('/v1/merchant/account/bank', authenticateMerchant, async (c) => {
  const merchant = c.get('merchant');
  const body = await c.req.json();
  
  const { account_name, account_number, branch_code, bank_name } = body;
  
  // Validate
  if (!account_name || !account_number || !branch_code || !bank_name) {
    return c.json(
      err('invalid_request', 'All bank fields required'),
      400
    );
  }
  
  // Update merchant
  const accounts = await loadMerchantAccounts();
  const account = accounts.find(a => a.id === merchant.id);
  
  if (!account) {
    return c.json(err('not_found', 'Merchant not found'), 404);
  }
  
  account.bank_account = {
    account_name,
    account_number,
    branch_code,
    bank_name,
  };
  account.updated_at = new Date().toISOString();
  
  await saveMerchantAccounts(accounts);
  
  return c.json({
    ok: true,
    message: 'Bank account updated',
    account: {
      id: account.id,
      bank_account: account.bank_account,
    },
  });
});
```

### 2. Payout Release Endpoint

**Location:** `packages/shadow-index/api/index.ts`

```typescript
// POST /v1/admin/payouts/release-single
// Admin triggers payout to merchant's bank account
app.post('/v1/admin/payouts/release-single', validateAdminAuth, async (c) => {
  const { merchant_id, amount_cents } = await c.req.json();
  
  const merchants = await loadMerchantAccounts();
  const merchant = merchants.find(m => m.id === merchant_id);
  
  if (!merchant || !merchant.bank_account) {
    return c.json(
      err('invalid_request', 'Merchant or bank account not found'),
      400
    );
  }
  
  // Create payout log
  const payout = {
    id: crypto.randomUUID(),
    merchant_id,
    gross_amount: amount_cents,
    commission_amount: 0,
    net_amount: amount_cents,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };
  
  const payoutLogs = await loadPayoutLogs();
  payoutLogs.push(payout);
  await savePayoutLogs(payoutLogs);
  
  // TODO: Integrate with banking provider
  // For now, log and mark as ready
  merchant.pending_payout = Math.max(0, merchant.pending_payout - amount_cents);
  merchant.updated_at = new Date().toISOString();
  await saveMerchantAccounts(merchants);
  
  return c.json({
    ok: true,
    payout,
    message: 'Payout queued - bank transfer should process within 24-48 hours',
  });
});
```

### 3. Frontend: Bank Account Form

**Location:** `packages/auth-portal/src/pages/portals/MerchantPortal.tsx`

Add to merchant settings section:

```tsx
// Bank Account Form Tab
const [bankForm, setBankForm] = useState({
  account_name: merchant?.bank_account?.account_name || '',
  account_number: merchant?.bank_account?.account_number || '',
  branch_code: merchant?.bank_account?.branch_code || '',
  bank_name: merchant?.bank_account?.bank_name || '',
});

const updateBankAccount = async () => {
  try {
    const res = await fetch(`${apiBase}/v1/merchant/account/bank`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${merchantToken}`,
      },
      body: JSON.stringify(bankForm),
    });
    
    if (!res.ok) throw new Error('Failed to update bank account');
    
    const data = await res.json();
    alert('Bank account updated successfully!');
    setMerchant(data.account);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// JSX
<section className="settings-section">
  <h3>Bank Account Details</h3>
  <input
    placeholder="Account Name"
    value={bankForm.account_name}
    onChange={(e) => setBankForm({...bankForm, account_name: e.target.value})}
  />
  <input
    placeholder="Account Number"
    value={bankForm.account_number}
    onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
  />
  <input
    placeholder="Branch Code"
    value={bankForm.branch_code}
    onChange={(e) => setBankForm({...bankForm, branch_code: e.target.value})}
  />
  <input
    placeholder="Bank Name"
    value={bankForm.bank_name}
    onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
  />
  <button onClick={updateBankAccount}>Save Bank Details</button>
</section>
```

---

## Configuration for Sobuhle's Account

### Merchant Setup

```json
{
  "id": "sobuhle-merchant-id",
  "business_name": "Sobuhle's Business",
  "email": "sobuhlenyambali@icloud.com",
  "bank_account": {
    "account_name": "Sobuhle Nyambali",
    "account_number": "YOUR_ACCOUNT_NUMBER",
    "branch_code": "051001",
    "bank_name": "Standard Bank"
  },
  "commission_rate": 0.03,
  "payout_frequency": "weekly",
  "payout_minimum": 50000,
  "kyc_status": "not_started"
}
```

### Test Payout Flow

1. **Create test order:**
   ```bash
   curl -X POST http://localhost:3000/checkout/create-session \
     -H "Content-Type: application/json" \
     -d '{
       "product_hash": "test-hash",
       "customer_email": "test@example.com"
     }'
   ```

2. **Simulate payment** (use Stripe test card: 4242 4242 4242 4242)

3. **Release payout** (admin):
   ```bash
   curl -X POST http://localhost:3000/v1/admin/payouts/release-single \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_TOKEN>" \
     -d '{
       "merchant_id": "sobuhle-merchant-id",
       "amount_cents": 100000
     }'
   ```

4. **Verify payout:**
   ```bash
   curl http://localhost:3000/v1/merchant/payouts \
     -H "Authorization: Bearer <MERCHANT_TOKEN>"
   ```

---

## Integration with Real Banking Providers

### Option 1: Stripe Connect (Recommended)

```typescript
// Setup Stripe Connect
const account = await stripe.accounts.create({
  type: 'standard',
  email: merchant.email,
  business_profile: {
    name: merchant.business_name,
    url: 'https://your-site.com',
  },
});

// On payout
await stripe.transfers.create({
  amount: amount_cents,
  currency: 'zar',
  destination: account.id,
});
```

### Option 2: Wise API (for bank transfers)

```typescript
// Create recipient account
const recipient = await wise.createRecipient({
  currency: 'ZAR',
  type: 'NGOZ', // Bank account
  details: {
    accountNumber: merchant.bank_account.account_number,
    bankCode: merchant.bank_account.branch_code,
    name: merchant.bank_account.account_name,
  },
});

// Create transfer
const transfer = await wise.createTransfer({
  sourceAccount: wise_business_account,
  targetAccount: recipient.id,
  amount: {
    value: amount_cents / 100,
    currency: 'ZAR',
  },
});
```

### Option 3: PayFast

```typescript
// Create payout
const payout = await payfast.createPayout({
  merchant_id: merchant.payfast_id,
  amount_cents: amount_cents,
  description: `Payout for orders`,
});
```

---

## Temporary Solution: Manual Bank Transfer

Until formal integration:

1. **Funds held at Stripe**
2. **Admin reviews pending payouts** (dashboard)
3. **Manual bank transfer initiated** by CEO/Finance
4. **Payout marked complete** in system
5. **All transfers audited** at month-end

**This is safe and gives time for CIPC + Stripe Connect setup.**

---

## Compliance & Audit Trail

All transactions logged:
```json
{
  "payout_id": "uuid",
  "merchant_id": "uuid",
  "gross_amount": 100000,
  "commission_amount": 0,
  "net_amount": 100000,
  "status": "completed",
  "created_at": "2026-03-02T10:00:00Z",
  "transferred_at": "2026-03-02T11:30:00Z",
  "reference_id": "WISE_TRANSFER_12345",
  "bank_account": {
    "account_name": "Sobuhle Nyambali",
    "account_number": "****7890",
    "bank_name": "Standard Bank"
  }
}
```

---

## Timeline

**This Week:**
- [ ] Add bank account update endpoint
- [ ] Add payout release endpoint
- [ ] Update merchant portal with bank form

**Next Week:**
- [ ] Integrate Stripe Connect or Wise API
- [ ] Test with small payout
- [ ] Document audit trail

**After CIPC Approval:**
- [ ] Switch to formal business bank account
- [ ] Reconcile all interim transfers
- [ ] Archive personal account usage
