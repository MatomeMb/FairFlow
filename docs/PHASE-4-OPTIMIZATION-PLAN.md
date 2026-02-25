# Phase 4 Optimization Plan

**Document:** Phase 4 planning — post v0.6.0  
**Date:** February 2026  
**Status:** Draft

---

## Overview

Phase 4 builds on the Analytics Reporting Engine (v0.6.0) and prepares for beta merchant onboarding.

---

## Planned Work

### Internal Dashboard

- HTML status page for API health
- Event counts (views, clicks)
- Recent errors or anomalies
- Link to [ANALYTICS-REPORTING-ENGINE-README.md](./ANALYTICS-REPORTING-ENGINE-README.md)

### Retention Policy

- 90-day retention window (configurable)
- Optional cleanup job for files outside range
- Document in [DEPLOYMENT.md](./DEPLOYMENT.md)

### Monitoring and Alerts

- p95 latency for GET /v1/analytics/report
- Error rate for POST /v1/analytics/event
- Alert thresholds: > 500ms for 90-day queries; > 5% error rate

### Pre-Aggregation (Optional)

- Nightly index for high-volume scenarios
- Consider when event volume exceeds ~50k/day
- Reference: [ANALYTICS-PERFORMANCE-BASELINE.md](./ANALYTICS-PERFORMANCE-BASELINE.md)

---

## Timeline

- **Sprint 4:** Mar 6 – Mar 19, 2026
- **Beta readiness:** Target end of Sprint 4

---

## Reference

- [13-SPRINT-3-PLAN.md](./13-SPRINT-3-PLAN.md)
- [14-SPRINT-4-PLAN.md](./14-SPRINT-4-PLAN.md)
- [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md)
