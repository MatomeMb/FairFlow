# Route modules (structural split)

Target layout (per architecture sprint):

- `auth.ts`, `merchant.ts`, `checkout.ts`, `webhooks.ts`, `analytics.ts`, `admin.ts`

**Current state:** HTTP handlers are still registered on the main Hono app in `../index.ts`. Extract routes here incrementally to keep PRs reviewable. Shared utilities live in `../shared/`; cross-cutting middleware in `../middleware/`.
