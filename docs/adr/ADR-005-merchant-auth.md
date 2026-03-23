# ADR-005: Custom JWT for merchant authentication

**Status:** Accepted  
**Date:** March 2026

## Context

Merchants authenticate via password or Google OAuth flows that terminate in shadow-index. The API must authorise requests without a Supabase round-trip on every call.

## Decision

Issue HS256 JWTs signed with `JWT_SECRET` (or `SHADOW_INDEX_API_KEY` in dev) with `typ: 'merchant_auth'`, merchant `sub`, and email. Verification is implemented once in `packages/shadow-index/api/shared/jwt.ts` and reused by `merchant-products.ts` and middleware.

Supabase remains the source of truth for **staff** (CEO/CTO) sessions in auth-portal.

## Consequences

**Positive:**

- Stateless verification on the API
- Clear split: staff (Supabase) vs merchant (custom JWT)

**Negative:**

- No built-in revocation until a denylist or session store is added
- Rotating `JWT_SECRET` forces merchant re-login

## Resolution (March 2026)

The `VITE_ADMIN_SECRET` browser-bundle exposure was resolved by implementing `packages/shadow-index/api/routes/admin-proxy.ts` (landed with admin-proxy resolution in commit `0c8b0a7`). Admin mutations now require a valid Supabase session with CEO/CTO role in `user_roles`. `ADMIN_SECRET_KEY` remains server-side only for `/v1/admin/*` (cron, internal tools). The auth-portal sends the Supabase access token as `Authorization: Bearer` for all `/v1/admin-proxy/*` calls. The API key middleware treats `/v1/admin-proxy/*` as a public path so the browser is not required to send `x-api-key` for those routes; authorization is enforced inside `admin-proxy.ts` via Supabase.

## Future improvement

Optional Redis (or Supabase) revocation set for compromised merchant JWTs.
