# Payment Process Summary - For Sobuhle

## How Payment Works

**Customer → Stripe → Your Account → Payout**

1. Customer buys product → Stripe collects payment securely
2. Stripe confirms payment via webhook
3. Order recorded in our system
4. Funds held at Stripe (regulated entity)
5. Weekly/monthly: Admin releases payout
6. Funds transfer to your bank account

---

## Your Options for Temporary Banking

### Option A: ✅ RECOMMENDED
**Keep funds at Stripe while waiting for CIPC**
- **Pros**: Safest, regulated, no personal account entanglement
- **Cons**: Slim settlement fee (already priced in 2.9% rate)
- **Timeline**: 1-2 business days per payout
- **Next step**: Give us your bank account details and we'll add it to the system

### Option B: Use Alternative Provider
**PayFast, Luno, or other payment providers temporarily**
- **Pros**: Faster settlement (24h), South Africa native
- **Cons**: Different fee structure
- **Not implemented yet**: Would require switching Stripe → provider

### Option C: Immediate Personal Transfer
**Manual weekly bank transfer to your personal account**
- **Pros**: Get money immediately
- **Cons**: Creates audit complexity (need to reconcile later)
- **Risk**: Personal account mixed with business operations
- **Not recommended**

---

## What You Need to Do

**Step 1: Give us these bank details**
```
Account Name: [Your name]
Account Number: [Your number]
Branch Code: [Your bank's code]
Bank Name: [e.g., Standard Bank]
```

**Step 2: We'll add it to the system**
- Takes ~1 hour
- Tested with small payout

**Step 3: Revenue flows automatically**
- Customers pay via Stripe
- Orders recorded
- You see balance in dashboard
- Weekly payout to your account (automatic after CIPC approved)

---

## Key Facts

- 💰 **No money is lost** - goes straight to Stripe, secured
- 🔒 **Stripe handles security** - PCI compliance, fraud protection
- 📊 **100% tracked** - every transaction logged for audits
- ⏱️ **2+ days settlement** - that's standard for South Africa
- 📝 **Fully reversible** - if you switch to another provider later
- 🎯 **Zero personal risk** - funds don't touch your account until approved

---

## Timeline

**This week:**
- Implement bank account form
- Test payout flow

**Next week:**
- Go live with payouts
- Monitor first 3-5 transactions

**After CIPC approval (1-2 weeks):**
- Switch to formal business bank account
- Reconcile all interim payments
- Archive temporary setup

---

## Questions to Answer

1. **Can you lower the commission rate?**
   - Current: 3% (industry standard 2-4%)
   - Can adjust once volume proven

2. **Can funds be released daily?**
   - Once integrated: yes (manual release for now)
   - Automated weekly after testing

3. **What if there's a problem?**
   - Stripe has dispute resolution
   - Every transaction logged and reversible
   - Support team (us) available to investigate

---

## Chat with Matome

When ready:
1. Share your bank details
2. We'll integrate and test
3. First order will prove the flow works

This gives you revenue immediately without waiting for CIPC.
