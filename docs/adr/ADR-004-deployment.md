# ADR-004: Vercel as the deployment platform

**Status:** Accepted  
**Date:** March 2026

## Context

Deploy the React SPA and Node API with git-based deploys, previews on PRs, and minimal ops overhead.

## Decision

Host **auth-portal** and **shadow-index** on Vercel (see `api/vercel-entry.ts` for the serverless adapter).

## Consequences

**Positive:**

- Push-to-deploy from `main`
- Preview deployments for PRs
- Automatic HTTPS and CDN for static assets

**Negative:**

- Serverless cold starts
- No durable in-process state across invocations (rate limits and caches are per-instance — see ADR-006)
- Ephemeral `/tmp` — binaries and durable files use Cloudflare R2 when `STORAGE_MODE=r2`

## Migration path

If latency or long-running jobs outgrow Vercel limits, containerise shadow-index (Railway, Render, VPS) while keeping the SPA on Vercel.
