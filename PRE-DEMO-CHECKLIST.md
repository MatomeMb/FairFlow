# Pre-Demo Checklist
Run through this 30 minutes before the 13:30 call.

## Server
- [ ] `npm run dev` running in shadow-index (port 3000)
- [ ] `npm run dev` running in auth-portal (port 5178)
- [ ] No errors in server console
- [ ] `data/orders.json` exists and is valid JSON
- [ ] `data/notifications.json` exists
- [ ] `data/merchant_accounts.json` exists with kyc_status set

## Data reset (clean demo state)
- [ ] Clear test orders older than today (or note which to skip)
- [ ] Reset notification read status if needed
- [ ] Confirm product stock > 5 (no low stock banner visible)
- [ ] Confirm pending_payout shows realistic amount

## Stripe
- [ ] Stripe test mode active (not live)
- [ ] Test card ready: 4242 4242 4242 4242, exp 12/26, CVC 123
- [ ] Webhook forwarding active (`stripe listen --forward-to localhost:3000/webhooks/stripe`)

## Browser
- [ ] Merchant portal open in Tab 1
- [ ] ProductPage for demo product open in Tab 2
- [ ] Merchant email inbox open in Tab 3 (for Scene 3)
- [ ] Devtools closed (no red errors visible)
- [ ] Zoom to 90% so all content fits without scrolling

## Backup
- [ ] Screenshot of orders.json + notifications.json taken (fallback if live demo breaks)
- [ ] Know the last working product hash if ProductPage needs manual URL
