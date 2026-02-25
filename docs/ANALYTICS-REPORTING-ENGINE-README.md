# Analytics Reporting Engine

**Document:** Entry point for Analytics Reporting Engine documentation  
**Version:** 1.0  
**Date:** February 2026  
**Status:** v0.6.0 implemented

---

## Overview

The Analytics Reporting Engine provides merchant visibility into matter:// engagement. It aggregates view and click events stored in JSONL format and exposes them via `GET /v1/analytics/report`.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md) | Technical specification — API contract, response formats, algorithm |
| [ANALYTICS-REPORTING-IMPL-BRIEF.md](./ANALYTICS-REPORTING-IMPL-BRIEF.md) | Implementation roadmap — 4-phase execution plan |
| [ANALYTICS-PERFORMANCE-BASELINE.md](./ANALYTICS-PERFORMANCE-BASELINE.md) | Performance verification — measured times, targets |
| [ANALYTICS-PRODUCTION-READINESS.md](./ANALYTICS-PRODUCTION-READINESS.md) | Release checklist — sign-off criteria |
| [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md) | Event schema — view/click payloads, JSONL storage |
| [FEBRUARY-21-ANALYSIS.md](./FEBRUARY-21-ANALYSIS.md) | Pipeline architecture — ingestion flow |

---

## Quick Reference

**Endpoint:** `GET /v1/analytics/report`  
**Query parameters:** `from`, `to` (required), `groupBy` (day | hash | both), `sortBy`, `limit`, `offset`  
**Event source:** `data/events/YYYY-MM-DD.jsonl`  
**Performance target:** 90-day range < 500ms

---

## Implementation Summary

| Phase | Deliverables | Tests |
|-------|--------------|-------|
| Phase 1 | lib/analytics-report.ts — aggregation logic | 22 |
| Phase 2 | GET /v1/analytics/report route | 11 |
| Phase 3 | Performance and load verification | 6 |
| **Total** | **66 tests** | Pass |

---

**Reference:** [00-DOCUMENT-INDEX.md](./00-DOCUMENT-INDEX.md)
