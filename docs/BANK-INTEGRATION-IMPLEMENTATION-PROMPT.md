# Bank Account Integration Implementation Prompt

## Objective
Implement merchant bank account integration into the Things That Matter payment system to enable weekly payouts to merchant bank accounts during temporary banking setup phase (while CIPC approval is pending).

## Scope

### Phase 1: Backend API Layer
1. **Bank Account Schema Enhancement**
   - Add `bank_account` fields to merchant account type
   - Include: account_name, account_number, branch_code, bank_name

2. **New Endpoint: Update Bank Account**
   - `PATCH /v1/merchant/account/bank`
   - Require merchant authentication (JWT)
   - Validate all required fields
   - Encrypt sensitive data (account number)
   - Audit log all changes

3. **New Endpoint: Release Payout**
   - `POST /v1/admin/payouts/release`
   - Require admin authentication
   - Calculate merchant pending balance
   - Create payout log entry
   - Update payout status (pending → completed)
   - Return transfer reference

4. **Webhook: Order Settlement**
   - Verify `checkout.session.completed` webhook
   - Calculate commission (3% default)
   - Create order record
   - Queue for payout
   - Store merchant bank details reference

### Phase 2: Frontend Layer
1. **Merchant Portal: Bank Account Tab**
   - Form fields: Account Name, Account Number, Branch Code, Bank Name
   - Submit button with loading state
   - Success/error messaging
   - Display current bank details (masked account number)

2. **Merchant Portal: Payout History**
   - List all payouts (pending, completed, failed)
   - Show transfer reference and date
   - Filter by status

### Phase 3: Admin Dashboard
1. **Payout Release Interface**
   - View pending orders grouped by merchant
   - Calculate weekly payout total
   - Release button with confirmation
   - View released payouts history

### Phase 4: Testing & Validation
1. **Unit Tests**
   - Bank account update validation
   - Commission calculation
   - Payout balance accuracy

2. **Integration Tests**
   - Complete order → payout flow
   - Multiple merchants scenario
   - Edge cases (0 balance, failed transfer)

3. **Manual Testing**
   - Stripe test payment
   - Bank account update via API
   - Payout release and verification

## Technical Requirements

### Security
- ✅ Bank account number encrypted at rest
- ✅ Masked in API responses (show last 4 digits only)
- ✅ JWT authentication required
- ✅ Audit log all sensitive operations
- ✅ No direct database access from frontend

### Performance
- ✅ Sub-50ms API response time
- ✅ Payout calculation using in-memory cache
- ✅ Batch payout support for multiple merchants

### Compliance
- ✅ POPIA-compliant (South African data protection)
- ✅ All transactions logged with timestamp
- ✅ Reversible operations for audit trails
- ✅ Bank details not included in analytics/logs without permission

## Database/Storage Changes

### New Fields in Merchant Account
```json
{
  "id": "uuid",
  "bank_account": {
    "account_name": "string",
    "account_number": "string (encrypted)",
    "branch_code": "string",
    "bank_name": "string"
  },
  "pending_payout": "number (cents)",
  "last_payout_date": "ISO8601",
  "payout_frequency": "weekly|monthly"
}
```

### New Payout Log Schema
```json
{
  "id": "uuid",
  "merchant_id": "uuid",
  "gross_amount": "number (cents)",
  "commission_amount": "number (cents)",
  "net_amount": "number (cents)",
  "status": "pending|processing|completed|failed",
  "transferred_at": "ISO8601?",
  "reference_id": "string?",
  "created_at": "ISO8601"
}
```

## Success Criteria

1. ✅ API endpoint added and tested
2. ✅ Frontend form collects and submits bank details
3. ✅ Payout flow tested end-to-end
4. ✅ Admin can release payouts
5. ✅ Merchant sees accurate payout history
6. ✅ All sensitive data properly encrypted/masked
7. ✅ Tests pass (unit + integration)
8. ✅ Documentation updated

## Timeline Estimate
- Phase 1 (Backend): 4-6 hours
- Phase 2 (Frontend): 3-4 hours
- Phase 3 (Admin): 2-3 hours
- Phase 4 (Testing): 2-3 hours
- **Total: 11-16 hours**

## Out of Scope (For Later)
- Stripe Connect integration
- Automated payout scheduler
- Third-party banking provider APIs (Wise, PayFast)
- Real-time settlement dashboard

## Acceptance Criteria

### Merchant Can:
- Add/update their bank account details
- View pending payout balance
- See complete payout history with reference IDs

### Admin Can:
- View all pending payouts
- Release payouts manually
- See confirmation of transfers

### System Must:
- Encrypt all bank account data
- Log all payout operations
- Calculate commissions accurately
- Handle edge cases gracefully
- Return meaningful error messages

## Dependencies
- Stripe API (already integrated)
- JWT authentication (already implemented)
- Zod validation library (already in use)
- Hono framework (already in use)
- React (already in frontend)

## Implementation Order
1. Update merchant account schema
2. Add bank account update endpoint
3. Update order webhook to include payout logic
4. Add payout release endpoint
5. Create merchant portal bank form
6. Add payout history view
7. Create admin payout dashboard
8. Write tests
9. Documentation
10. Manual testing with test Stripe account
