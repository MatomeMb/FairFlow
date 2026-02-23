# Demo Script — fairflow
Quick links: [Demo Script](01-DEMO-SCRIPT.md) · [Decision Template](02-MONDAY-1330-CALL-DECISION-TEMPLATE.md) · [Live Notes](03-MONDAY-1330-CALL-NOTES.md)

**Date:** Monday, February 24, 2026 | 13:30
**Presenter:** Sobuhle (narrates) + Matome (drives)
**Duration:** ~12 minutes

---

## Scene 1: Merchant Creates a Product (2 min)
**URL:** http://localhost:5178/merchant
**Narration:** "A merchant logs in and creates a product directly — no CSV, no technical setup."
**Actions:**
1. Open Products tab
2. Click "Create Product"
3. Fill: Title, Price (R299), Stock (20), Category (Coffee)
4. Click "Publish"
5. Show generated matter:// URI

**Proof point:** Product appears instantly with portable matter:// link.

---

## Scene 2: Consumer Discovers + Buys (3 min)
**URL:** http://localhost:5178/product/[hash from Scene 1]
**Narration:** "A consumer clicks a shared link — anywhere on the web — and lands directly on the product."
**Actions:**
1. Open ProductPage in a new tab
2. Show product details load
3. Enter email + delivery address (6 fields)
4. Click "Buy Now" → Stripe test checkout
5. Complete with card 4242 4242 4242 4242

**Proof point:** Payment completes; no merchant Stripe account required.

---

## Scene 3: Merchant Gets Notified (2 min)
**URL:** http://localhost:5178/merchant (Notifications tab)
**Narration:** "The moment payment clears, the merchant is notified — in-app and by email."
**Actions:**
1. Show bell badge with unread count
2. Click Notifications tab
3. Show order_received notification with product title + customer email
4. Open merchant email (show order email with delivery address + product image)

**Proof point:** Merchant knows immediately — no manual dashboard checking required.

---

## Scene 4: Merchant Fulfills the Order (2 min)
**URL:** http://localhost:5178/merchant (Orders tab)
**Narration:** "The merchant sees the full delivery address and marks the order shipped."
**Actions:**
1. Open Orders tab
2. Show order with delivery address block
3. Click "Mark as Fulfilled"
4. Show card turn green with fulfilled timestamp

**Proof point:** Complete fulfillment loop — from sale to shipped — in one dashboard.

---

## Scene 5: Earnings + KYC (2 min)
**URL:** http://localhost:5178/merchant (KYC & Payouts tab)
**Narration:** "Earnings are tracked automatically. Once KYC is complete, payouts are released weekly."
**Actions:**
1. Show pending payout (R281.06 from test order)
2. Show total earnings
3. Show commission rate (6%)
4. Show payout log entry
5. Show KYC status (pending)

**Proof point:** Revenue model is live — platform takes 6%, merchant receives net weekly.

---

## Wrap-up (1 min)
**Narration:** "In five days we went from CSV uploads and no merchant visibility, to a complete merchant operating system — products, orders, notifications, fulfillment, and earnings — all built around a portable product primitive."

**Week 3 priorities to discuss:**
- Full Stripe Connect integration (automated KYC)
- Consumer delivery tracking notifications
- Multi-product checkout (session cart)

