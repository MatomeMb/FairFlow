<!-- FINAL-POLISH: seed first-incident operations runbook for beta launch support. -->
# Operations Runbook

This runbook covers the first response flow for fairflow production incidents.

## 1) Tail production logs in Vercel

1. Open Vercel dashboard for the production project.
2. Go to `Deployments` -> latest production deploy -> `Functions` logs.
3. Filter with request/correlation IDs from client errors:
   - `requestId`
   - `correlationId`
   - `reqId`
4. Grep-style markers to watch:
   - `paystack_webhook_signature_invalid`
   - `stock_decrement_conflict`
   - `merchant_jwt_invalid`
   - `oauth_insert_failed`
5. Keep one terminal running live logs during mitigation.

## 2) Query Supabase logs for slow queries

1. Open Supabase project -> `Logs` -> `Postgres`.
2. Filter by:
   - `duration` (long-running queries)
   - `merchant_accounts`
   - `analytics_events`
   - `merchant_products`
3. Validate whether error spikes align with API logs by timestamp and correlation ID.
4. If needed, capture a 10-minute window screenshot/export for postmortem.

## 3) Incident response checklist

### A) Webhook storm (retries/spike on `/webhooks/paystack`)

- Confirm HMAC failures vs valid retries in API logs.
- Verify `PAYSTACK_SECRET_KEY` is correct and unchanged in production.
- Check alert marker: `ALERT_THRESHOLD: webhook_latency_ms > 800`.
- Confirm duplicate deliveries remain idempotent (single order per reference).
- If storm persists, temporarily reduce load by communicating degraded status to support.

### B) Auth outage (merchant login/OAuth failures)

- Check `merchant_jwt_invalid`, `oauth_update_failed`, `oauth_insert_failed`.
- Validate runtime env values: `JWT_SECRET`, Supabase keys, OAuth vars.
- Verify `/health` and `/v1/auth/merchant/login` synthetic checks.
- Confirm no malformed deploy config or missing secret in Vercel.

### C) Stock double-decrement concern

- Search for `stock_decrement_conflict` and duplicated Paystack references.
- Confirm in-flight reference guard behavior for same webhook reference.
- Review inventory logs (`inventory_logs`) against order IDs for one-to-one mapping.
- If mismatch exists, pause affected merchant SKU and reconcile manually.

## 4) Escalation

- Engineering owner: [REDACTED_NAME] — [REDACTED_PHONE]
- Co-founder escalation: [REDACTED_NAME] — [REDACTED_PHONE]
- Primary async channel: Slack `#beta-ops`
- External merchant support: support@fairflow.co.za
