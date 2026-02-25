# Deployment

**Document:** Deployment procedures  
**Date:** February 2026  
**Status:** Reference

---

## Overview

This document consolidates deployment procedures for the .things that Matter platform. For feature-specific deployment steps, see the referenced documents.

---

## Staging Deployment

**Reference:** [DEPLOYMENT-TO-STAGING.md](./DEPLOYMENT-TO-STAGING.md)

Covers:
- Pre-deployment checklist
- Build and deploy steps
- Smoke testing
- Rollback procedures
- Post-deployment verification

---

## Analytics Reporting Engine (MVP-14)

**Events directory:** `data/events/` or `ANALYTICS_EVENTS_DIR` env override  
**Retention:** 90 days (configurable)  
**Rate limit:** Inherited from API (100 req/min per IP)

**Production readiness:** [ANALYTICS-PRODUCTION-READINESS.md](./ANALYTICS-PRODUCTION-READINESS.md)

---

## Production Deployment

**Pre-requisites:**
- Staging validation complete
- Code review approved
- Performance baselines confirmed
- Rollback plan documented

**Steps:**
1. Merge to production branch
2. Build extension: `cd packages/lens-extension && npm run build`
3. Build API: `cd packages/shadow-index && npm run build`
4. Deploy per hosting provider (Vercel, etc.)
5. Verify health endpoint
6. Monitor logs and metrics

---

**Reference:** [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md)
