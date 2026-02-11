# Database Migration Roadmap — JSONL → SQLite → PostgreSQL

**Sprint 4 Week 4**  
**Date:** February 10, 2026  
**Phase:** Planning (Implementation Phase 5, Q2 2026)

---

## 1. Current State (v0.6.0)

| Data | Storage | Format |
|------|---------|--------|
| Products / things | Local fs or R2 | `.thing` JSON files |
| Index | Local fs | `index.json` |
| Analytics events | Local fs | Daily JSONL (`YYYY-MM-DD.jsonl`) |
| Pre-aggregates | Local fs | Daily JSON (`YYYY-MM-DD.json`) |

**Limitations:** File I/O bound; no ACID; single-node; scaling requires shared storage.

---

## 2. SQLite (MVP Alternative)

### Schema

```sql
-- events: one row per view/click
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  event TEXT NOT NULL,
  hash TEXT,
  source_url TEXT,
  timestamp TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_hash ON events(hash);

-- aggregates: daily pre-aggregated summaries
CREATE TABLE aggregates (
  date TEXT PRIMARY KEY,
  by_hash_json TEXT,
  totals_views INTEGER,
  totals_clicks INTEGER,
  updated_at TEXT
);

-- metadata: app config, last run times
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT
);
```

### Migration Steps

1. Implement SQLite adapter in `lib/analytics-report.ts` (read path).
2. Script: `JSONL → SQLite` bulk import (one-time + incremental).
3. Dual-write during transition: JSONL + SQLite.
4. Switch read path to SQLite; deprecate JSONL.
5. Remove JSONL writes.

**Effort:** ~2–3 days. **Performance:** 10–50x faster for 90-day queries.

---

## 3. PostgreSQL (Production Scale)

### Schema

```sql
-- Partitioned by date for analytics
CREATE TABLE events (
  id BIGSERIAL,
  date DATE NOT NULL,
  event TEXT NOT NULL,
  hash TEXT,
  source_url TEXT,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, date)
) PARTITION BY RANGE (date);

-- Monthly partitions
CREATE TABLE events_2026_02 PARTITION OF events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_hash ON events(hash);

-- aggregates
CREATE TABLE aggregates (
  date DATE PRIMARY KEY,
  by_hash_json JSONB,
  totals_views INTEGER,
  totals_clicks INTEGER,
  updated_at TIMESTAMPTZ
);

-- things index (optional; can stay in R2)
CREATE TABLE things_index (
  hash TEXT PRIMARY KEY,
  matter_uri TEXT,
  thing_url TEXT,
  gist JSONB,
  created_at TIMESTAMPTZ
);
```

### Migration Path

1. SQLite → PostgreSQL: `pg_dump` / custom ETL.
2. Deploy PostgreSQL (RDS, Supabase, Neon, etc.).
3. Dual-write: SQLite + PostgreSQL.
4. Cutover reads to PostgreSQL.
5. Retire SQLite.

**Effort:** ~1 week. **Timeline:** Phase 5–6 (Q2–Q3 2026).

---

## 4. Performance Estimates

| Stage | 90-day query | 10k events/day | Notes |
|-------|--------------|----------------|----------------|
| JSONL (current) | ~200–400ms | OK | Streaming + cache |
| SQLite | ~20–50ms | OK | Indexed |
| PostgreSQL | ~10–30ms | Strong | Partitioned, indexed |

---

## 5. Recommendations

1. **Short term:** SQLite for single-node deployments; low ops overhead.
2. **Production:** PostgreSQL when multi-instance or >100k events/day.
3. **Things:** Keep in R2; use PostgreSQL only for metadata/index if needed.

---

*Document: DATABASE-MIGRATION-ROADMAP.md. Sprint 4 Week 4.*
