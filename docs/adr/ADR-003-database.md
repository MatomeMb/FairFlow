# ADR-003: Supabase as the database and admin auth provider

**Status:** Accepted  
**Date:** March 2026

## Context

The platform needs PostgreSQL for relational commerce data, managed hosting, and authentication for internal roles (CEO/CTO) without running identity infrastructure in-house.

## Decision

Use Supabase PostgreSQL via `@supabase/supabase-js` with the service role on the API (`packages/shadow-index/api/db.ts`). Admin/staff sessions use Supabase Auth in the portal; merchants use custom JWTs issued by shadow-index (see ADR-005).

## Consequences

**Positive:**

- Managed Postgres, backups, and auth for staff
- RLS available where policies are maintained alongside app rules

**Negative:**

- Query code is coupled to Supabase client patterns
- Service role bypasses RLS — application code must enforce merchant scoping

## Alternatives considered

- **Neon / raw Postgres:** No bundled auth for staff
- **Firebase:** Document model is a poor fit for orders, payouts, and KYC relations
