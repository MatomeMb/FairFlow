# Staging Deployment Runbook — v0.6.0

**Purpose:** Step-by-step checklist for deploying Shadow Index API v0.6.0 to staging  
**Owner:** DevOps / CTO  
**Reference:** [DEPLOYMENT-TO-STAGING.md](./DEPLOYMENT-TO-STAGING.md), [OPERATIONS-MANUAL.md](./OPERATIONS-MANUAL.md)

---

## Pre-Deployment

| Step | Action | Status |
|------|--------|--------|
| 1 | Ensure v0.6.0 tag exists: `git tag -l v0.6.0` | [ ] |
| 2 | Checkout tag or branch: `git checkout v0.6.0` or `git checkout sprint-3-analytics-mvp-14` | [ ] |
| 3 | Run tests: `cd packages/shadow-index && npm test -- --run` | [ ] |
| 4 | Build: `cd packages/shadow-index && npm run build` | [ ] |

---

## Shadow Index API Deployment

| Step | Action | Status |
|------|--------|--------|
| 1 | Copy `.env.example` to `.env` for staging | [ ] |
| 2 | Set env vars: `PORT`, `STORAGE_MODE`, `ANALYTICS_EVENTS_DIR`, `SHADOW_INDEX_API_KEY` (if auth required) | [ ] |
| 3 | Deploy `dist/`, `run-with-env.mjs`, `package.json`, `node_modules` (or run `npm install` on server) | [ ] |
| 4 | Start: `node run-with-env.mjs` or `npm run start` | [ ] |

---

## Verification

| Step | Action | Expected |
|------|--------|----------|
| 1 | `GET https://staging-url/health` | `{ "status": "ok", "company": ".things that Matter", "version": "0.6.0" }` |
| 2 | `GET https://staging-url/v1/analytics/dashboard` | HTML dashboard loads |
| 3 | `POST https://staging-url/compile` (with valid body) | 200 with `hash`, `matter_uri` |

---

## Post-Deployment

| Step | Action | Status |
|------|--------|--------|
| 1 | Document staging URL in team wiki or config | [ ] |
| 2 | Notify stakeholders of staging availability | [ ] |
| 3 | Update [BETA-USER-LIST.md](./BETA-USER-LIST.md) if staging users are identified | [ ] |

---

*Document: STAGING-DEPLOYMENT-RUNBOOK.md. Execute when ready for staging deployment.*
