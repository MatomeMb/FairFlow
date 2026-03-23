# ADR-001: Hono as the API framework

**Status:** Accepted  
**Date:** March 2026

## Context

fairflow needs a TypeScript-native HTTP framework deployable to Vercel serverless (Node.js runtime), with middleware composition and routing.

## Decision

Use Hono as the sole HTTP framework for packages/shadow-index.

## Consequences

**Positive:** TypeScript-first API, small cold-start footprint, good middleware story.

**Negative:** Smaller ecosystem than Express; some middleware is custom (see api/middleware/).

## Alternatives considered

Express, Fastify, and Next.js API routes were considered; separation of SPA and API deployments favoured a standalone Hono app.

## Implementation note

Cross-cutting code lives under `packages/shadow-index/api/middleware/` and `api/shared/`. Domain HTTP handlers are mounted from `api/index.ts` into `api/routes/*` plus `merchant-products.ts` (see `api/routes/README.md` and `docs/07-SYSTEM-DIAGRAMS.md`).
