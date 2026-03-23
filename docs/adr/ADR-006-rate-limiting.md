# ADR-006: In-process rate limiting (with documented upgrade path)

**Status:** Accepted (with caveats)  
**Date:** March 2026

## Context

The API needs basic abuse protection without introducing Redis during beta.

## Decision

Implement per-IP rate limiting in `packages/shadow-index/api/middleware/rateLimit.ts` using an in-memory `Map`, with periodic cleanup to limit unbounded growth. The limiter runs **after** CORS and **before** the API-key middleware (see `api/index.ts`).

## Consequences

**Positive:**

- Zero extra infrastructure
- Predictable behaviour in single-instance / low-traffic beta

**Negative:**

- Does not coordinate across many concurrent serverless instances
- Determined clients can spread load across instances

## Upgrade path

Replace the middleware body with [Upstash Redis rate limiting](https://upstash.com/docs/redis/sdks/ts/ratelimit) using `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — interface remains `rateLimitMiddleware` on the Hono app.
