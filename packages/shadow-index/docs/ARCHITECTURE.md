# Shadow Index API - Software Architecture

**Version:** 0.6.0  
**Date:** February 2026

---

## Overview

The Shadow Index API follows **layered architecture** and **SOLID principles** aligned with professional software engineering practice (Advanced Software Design).

---

## Architecture Layers

```
+------------------+
|  Presentation    |  Routes (Hono), request/response handling
|  (Controllers)  |
+--------+---------+
         |
+--------v---------+
|  Application    |  Compile service, batch/catalog orchestration
|  (Services)     |
+--------+---------+
         |
+--------v---------+
|  Domain         |  Product schema, hash logic, matter URI
|  (Entities)     |
+--------+---------+
         |
+--------v---------+
|  Infrastructure |  Index repository, storage (local/R2), analytics
|  (Repositories) |
+------------------+
```

---

## Design Patterns Applied

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Repository** | Index load/save, things persistence | Abstraction over data access |
| **Strategy** | Storage (local vs R2) | Interchangeable storage backends |
| **Factory** | Error response shape | Consistent error payloads |
| **Middleware** | Auth, rate limit, CORS | Cross-cutting concerns |
| **Chain of Responsibility** | Request pipeline | Auth -> Rate limit -> Route handler |

---

## SOLID Principles

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Route handlers delegate to services; services delegate to repositories |
| **O**pen/Closed | Storage strategy extensible without modifying compile logic |
| **L**iskov Substitution | Local and R2 storage interchangeable where used |
| **I**nterface Segregation | Focused API contracts (e.g. index load/save) |
| **D**ependency Inversion | High-level modules depend on abstractions (storage interface) |

---

## Security

- **Authentication:** Optional API key (MVP-09); revocation via env
- **Rate limiting:** Per-IP in-memory window
- **Input validation:** Zod schemas for all request bodies
- **Output:** Consistent error shape; no stack traces in production

---

## Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `api/index.ts` | Route definitions, middleware, request parsing |
| `lib/storage.ts` | R2 upload/download (Strategy) |
| `lib/query-cache.ts` | Report result caching |
| `lib/analytics-report.ts` | Aggregation, date range validation |
| `lib/dashboard-metrics.ts` | Query performance tracking |
| `lib/error-logger.ts` | Error persistence, alert thresholds |
| `lib/retention-policy.ts` | Event file archival |
| `lib/api-key-registry.ts` | API key validation, revocation |

---

## Data Flow

1. **Compile:** Product JSON -> Validate (Zod) -> Hash -> Persist (.thing + index) -> Response
2. **Resolve:** Hash -> Load index -> Lookup -> Response
3. **Analytics:** Event POST -> Append JSONL -> Report GET -> Aggregate -> Cache -> Response

---

## Testing Strategy

- **Unit:** lib/*.test.ts (cache, analytics, retention, storage)
- **Integration:** api/*.test.ts (HTTP routes with in-memory env)
- **E2E:** Playwright (optional; requires running API)
