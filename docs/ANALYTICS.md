# Analytics

Operational reference for the fairflow analytics pipeline (event capture, storage, and consumption).

## Documents

| Doc | Use it for |
|-----|------------|
| [ANALYTICS-OVERVIEW.md](./ANALYTICS-OVERVIEW.md) | Event types, payloads, JSONL storage, API endpoints, dashboards, retention |
| [ANALYTICS-EVENT-SCHEMA.md](./ANALYTICS-EVENT-SCHEMA.md) | Field-level schema, validation rules, examples |

## At a glance

- **Events:** `view`, `click`, `purchase` (anonymous consumer; purchase ties to product / order metadata).
- **Flow:** Client → Shadow Index ingestion → JSONL files on disk (per deployment model in overview).
- **Usage:** Merchant-facing metrics and platform-level reporting; see overview for API routes and access controls.

For product-specific acceptance notes, see [17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](./17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) where applicable.
