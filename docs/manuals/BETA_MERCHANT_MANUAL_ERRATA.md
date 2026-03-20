# Merchant manual — supplementary notes (engineering)

**Canonical user content:** `fairflow_merchant_manual.pdf` and `fairflow_beta_manual_v2.pdf` (**v1.1**, `docs/manuals/`).  
This Markdown file is **optional**: use it for internal alignment or when PDFs lag a release.

---

## Product lifecycle

- **Remove from My Products** performs a **soft archive** (`status: archived`). The public **HTTPS product URL** and **`matter://` URI** continue to resolve; the page shows that the product is unavailable and **does not** offer checkout.

## Fulfilment

- **Merchant-of-record path:** upload **shipment slip** (PDF/JPG/PNG), then **Mark as Shipped**.  
- **Simpler path:** **Mark as Fulfilled** remains available where the UI exposes it.  
- Wording in older PDFs that refers only to generic “proof of delivery” maps to the **slip upload** above, not a separate hidden screen.

## Notifications

- New orders appear under the **header bell** and on the **Notifications** tab; while the portal is open, the client **polls about every 30 seconds** for updates.

## Payouts and fees

- Platform fee defaults to **3%** unless configured otherwise. Payout history should show **gross**, **commission**, and **net** where the UI provides a breakdown.
