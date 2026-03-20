# Merchant manual errata (beta, March 2026)

Use this alongside `fairflow_merchant_manual.pdf` until the PDF is regenerated.

## Order fulfilment

- **Product links after “remove”:** Removing a product from **My Products** **archives** the listing. The public product URL and `matter://` URI **still resolve**; the page shows that the product is no longer available and **does not** offer checkout.
- **Proof / shipment documentation:** The portal supports **Upload slip** (PDF/JPG/PNG) and **Mark as Shipped** for the merchant-of-record flow, and **Mark as Fulfilled** for a simpler fulfilment path. If the printed manual refers to a generic “proof of delivery” step only, treat it as **optional slip upload** plus your chosen fulfilment action—not a separate undocumented screen.

## Notifications

- New orders surface under the **bell** in the merchant header and on the **Notifications** tab; the list refreshes about every 30 seconds while the portal is open.

## Payouts

- fairflow applies a **platform fee** (default **3%**) on each sale. Payout tables show **gross**, **commission**, and **net** amounts.
