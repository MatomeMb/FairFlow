# Analytics Reporting Engine — Phase 1 Implementation Prompt

**Phase:** 1 (Core Aggregation Logic)  
**Duration:** Days 1–2 of Sprint 3, Week 2  
**Status:** Ready to implement  
**Spec Reference:** [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md)  
**Brief Reference:** [ANALYTICS-REPORTING-IMPL-BRIEF.md](./ANALYTICS-REPORTING-IMPL-BRIEF.md)

---

## Executive Brief

You are tasked with building the **aggregation engine** for the Analytics Reporting system. This is the computational core that:
1. Discovers JSONL event log files in a date range
2. Streams and parses events line-by-line
3. Builds in-memory aggregation maps (by day, week, or hash)
4. Calculates engagement metrics (views, clicks, conversion rates)
5. Returns structured aggregation data ready for serialization

**This is NOT the HTTP API yet** — that comes in Phase 2. This phase is pure logic: test-driven, thoroughly verified, performant.

---

## Pre-Implementation Checklist

Before you start coding, ensure the following are in place:

### ✅ Environment Setup
- [ ] Node.js v18+ available (`node --version`)
- [ ] TypeScript configured for `packages/shadow-index/` (`tsc --version`)
- [ ] Vitest installed and working (`npm test` in shadow-index runs other tests)
- [ ] `fs/promises` mocking available in Vitest

### ✅ File Structure
```
packages/shadow-index/
├── api/
│   ├── index.ts                    (main API - do NOT modify yet)
│   ├── index.test.ts               (existing tests - keep passing)
│   ├── analytics.test.ts            (Feb 21 tests - keep passing)
│   ├── analytics-report.test.ts     (NEW - this is Phase 1)
│   └── lib/
│       └── analytics-report.ts      (NEW - implementation lives here)
├── vitest.config.ts                (existing)
└── package.json                    (existing)
```

### ✅ Data Fixtures
- [ ] Create `test_data/events/` directory with sample JSONL files
- [ ] Populate with realistic event data (see "Sample JSONL Event Data" below)

### ✅ Dependency Check
- [ ] Zod available for schema validation (already in package.json)
- [ ] @vitest/happy-dom available (for DOM testing if needed)

---

## Sample JSONL Event Data

Create the following test fixture files:

### File: `test_data/events/2026-02-21.jsonl`
```jsonl
{"event":"view","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-21T08:30:00Z","source_url":"https://example.com/item","anon_id":"user-001"}
{"event":"view","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-21T09:15:00Z","source_url":"https://shop.com/products","anon_id":"user-002"}
{"event":"click","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-21T09:20:00Z","source_url":"https://example.com/item","target_action":"checkout_initiated","anon_id":"user-001"}
{"event":"view","hash":"def4567890123456789012345678901234567890123456789012345678901234","timestamp":"2026-02-21T10:00:00Z","source_url":"https://example.com/item"}
{"event":"click","hash":"def4567890123456789012345678901234567890123456789012345678901234","timestamp":"2026-02-21T10:05:00Z","source_url":"https://example.com/item","target_action":"image_expanded"}
{"event":"view","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-21T14:30:00Z","source_url":"https://shop.com/products"}
{"event":"click","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-21T14:35:00Z","source_url":"https://shop.com/products","target_action":"checkout_initiated"}
```

### File: `test_data/events/2026-02-22.jsonl`
```jsonl
{"event":"view","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-22T08:00:00Z","source_url":"https://example.com/item"}
{"event":"view","hash":"ghi8901234567890123456789012345678901234567890123456789012345678","timestamp":"2026-02-22T09:00:00Z","source_url":"https://shop.com/products"}
{"event":"click","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-22T08:10:00Z","source_url":"https://example.com/item","target_action":"checkout_initiated"}
{"event":"view","hash":"def4567890123456789012345678901234567890123456789012345678901234","timestamp":"2026-02-22T10:30:00Z","source_url":"https://shop.com/products"}
{"event":"view","hash":"ghi8901234567890123456789012345678901234567890123456789012345678","timestamp":"2026-02-22T11:00:00Z","source_url":"https://shop.com/products"}
{"event":"click","hash":"ghi8901234567890123456789012345678901234567890123456789012345678","timestamp":"2026-02-22T11:05:00Z","source_url":"https://shop.com/products","target_action":"external_link"}
```

### File: `test_data/events/2026-02-23.jsonl`
```jsonl
{"event":"view","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-23T07:30:00Z","source_url":"https://example.com/item"}
{"event":"click","hash":"abc1234567890123456789012345678901234567890123456789012345678901","timestamp":"2026-02-23T07:35:00Z","source_url":"https://example.com/item","target_action":"checkout_initiated"}
```

**Key data facts for verification:**
- **abc...901** (3 days): 6 views, 4 clicks → 66.7% engagement
- **def...234** (2 days): 2 views, 1 click → 50% engagement
- **ghi...678** (1 day): 2 views, 1 click → 50% engagement
- **Total (2026-02-21 to 2026-02-23):** 11 views, 7 clicks → 63.6% engagement

---

## Test Infrastructure Setup

Create the test infrastructure that your implementation will use:

### File: `packages/shadow-index/api/lib/test-utils.ts`
```typescript
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Test utility to copy fixture JSONL files to a temporary directory.
 * Returns the path to the temp directory.
 */
export async function setupTestFixtures(): Promise<string> {
  const fixtureDir = path.join(process.cwd(), 'test_data', 'events');
  // In real tests, you'd copy these to a temp directory to avoid mutating fixtures
  // For now, return the fixture path directly
  return fixtureDir;
}

/**
 * Parse a JSONL stream line-by-line.
 * Returns parsed JSON objects or throws on malformed lines.
 */
export async function parseJsonlFile(filePath: string): Promise<any[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  return lines.map((line, idx) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      throw new Error(`Failed to parse JSON at line ${idx + 1}: ${line.slice(0, 50)}...`);
    }
  });
}

/**
 * Utility to generate a date range for testing.
 * @example
 *   const dates = generateDateRange('2026-02-21', '2026-02-23');
 *   // ['2026-02-21', '2026-02-22', '2026-02-23']
 */
export function generateDateRange(from: string, to: string): string[] {
  const start = new Date(from);
  const end = new Date(to);
  const dates: string[] = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  
  return dates;
}

/**
 * Utility to extract domain from URL.
 */
export function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return 'unknown';
  }
}
```

---

## Implementation Guide: `packages/shadow-index/api/lib/analytics-report.ts`

This is the core implementation file. Follow this structure and fill in the logic:

### Structure Overview
```typescript
// 1. Type definitions (AggregateRow structures for each groupBy mode)
// 2. Validation functions (date range, enum checks)
// 3. Core aggregation function (generic aggregator)
// 4. Group-specific aggregators (byDay, byHash, etc.)
// 5. Metric calculators (engagement rate, etc.)
// 6. Sorting logic
// 7. Main export: reportAggregateAnalytics()
```

### Starter Template

```typescript
/**
 * Analytics Report Aggregation Engine
 * 
 * Core logic for transforming JSONL event logs into time-series reports.
 * Does NOT handle HTTP requests — that's Phase 2.
 * 
 * Responsibilities:
 * - Discover JSONL files in date range
 * - Stream and parse events
 * - Aggregate by time period or hash
 * - Calculate engagement metrics
 * - Sort and return structured data
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum GroupByMode {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  HASH = 'hash',
}

export enum SortByMode {
  TIMESTAMP = 'timestamp',
  VIEWS = 'views',
  CLICKS = 'clicks',
  ENGAGEMENT_RATE = 'engagement_rate',
}

/**
 * Internal aggregation row for day/week/month grouping
 */
export interface TimeSeriesRow {
  period: string; // YYYY-MM-DD or YYYY-Www or YYYY-MM
  views: number;
  clicks: number;
  engagement_rate: number;
  hashes: Set<string>;
  sources: Map<string, { views: number; clicks: number }>;
  top_hash?: string;
  source_domains?: string[];
}

/**
 * Internal aggregation row for hash grouping
 */
export interface HashRow {
  hash: string;
  views: number;
  clicks: number;
  engagement_rate: number;
  timestamps: string[];
  sources: Map<string, { views: number; clicks: number }>;
  first_seen?: string;
  last_seen?: string;
  top_source?: string;
}

/**
 * Parsed analytics event (after Zod validation)
 */
export type AnalyticsEvent = 
  | { event: 'view'; hash: string; timestamp: string; source_url: string; anon_id?: string }
  | { event: 'click'; hash: string; timestamp: string; source_url: string; target_action: string; anon_id?: string };

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate and normalize date range.
 * Throws if invalid.
 */
export function validateDateRange(from: string, to: string): { from: Date; to: Date } {
  // TODO: Implement
  // - Parse ISO-8601 dates
  // - Check to >= from
  // - Check not in future (allow today)
  // - Return normalized Date objects
}

/**
 * Validate groupBy parameter.
 */
export function validateGroupBy(value: unknown): GroupByMode {
  // TODO: Implement
  // - Check value is in GroupByMode enum
  // - Throw if invalid
  // - Return normalized enum value
}

/**
 * Validate sortBy parameter.
 */
export function validateSortBy(value: unknown): SortByMode {
  // TODO: Implement
  // - Check value is in SortByMode enum
  // - Throw if invalid
  // - Return normalized enum value
}

// ============================================================================
// FILE DISCOVERY
// ============================================================================

/**
 * List all JSONL event files in the given date range.
 * Filters by filename prefix (YYYY-MM-DD) to avoid unnecessary opens.
 */
export async function listEventsFilesInRange(
  eventsDir: string,
  from: Date,
  to: Date
): Promise<string[]> {
  // TODO: Implement
  // - List all files in eventsDir
  // - Filter to .jsonl files
  // - Filter by date range (filename prefix)
  // - Return sorted paths
  // - Handle ENOENT (dir doesn't exist yet) gracefully
}

// ============================================================================
// EVENT STREAMING & PARSING
// ============================================================================

/**
 * Stream a JSONL file and parse events.
 * Yields AnalyticsEvent objects; logs errors for malformed lines.
 */
export async function* streamJsonlFile(
  filePath: string
): AsyncGenerator<{ event: AnalyticsEvent; lineNum: number } | { error: string; lineNum: number }> {
  // TODO: Implement
  // - Read file (or use fs.createReadStream for large files)
  // - Split by newline
  // - Parse each line as JSON
  // - Validate against AnalyticsEvent schema (Zod)
  // - Yield valid events with line number
  // - Yield errors (don't throw) with line number
}

/**
 * Zod schema for validating analytics events.
 */
const viewEventSchema = z.object({
  event: z.literal('view'),
  hash: z.string().length(64),
  timestamp: z.string().datetime(),
  source_url: z.string().url(),
  anon_id: z.string().optional(),
});

const clickEventSchema = z.object({
  event: z.literal('click'),
  hash: z.string().length(64),
  timestamp: z.string().datetime(),
  source_url: z.string().url(),
  target_action: z.enum(['checkout_initiated', 'image_expanded', 'external_link']),
  anon_id: z.string().optional(),
});

const analyticsEventSchema = z.discriminatedUnion('event', [viewEventSchema, clickEventSchema]);

// ============================================================================
// AGGREGATION LOGIC
// ============================================================================

/**
 * Extract domain from a URL.
 */
function extractDomain(url: string): string {
  // TODO: Implement
  // - Parse URL
  // - Return hostname
  // - Handle errors gracefully (return 'unknown')
}

/**
 * Convert a timestamp (ISO-8601) to a grouping key.
 */
function getGroupKey(timestamp: string, groupBy: GroupByMode): string {
  // TODO: Implement for each mode:
  // - DAY: '2026-02-21' (YYYY-MM-DD)
  // - WEEK: '2026-W08' (ISO week)
  // - MONTH: '2026-02' (YYYY-MM)
  // - (HASH is handled separately)
}

/**
 * Aggregate events by time period (day, week, or month).
 */
export async function aggregateByTimePeriod(
  eventsDir: string,
  from: Date,
  to: Date,
  groupBy: GroupByMode
): Promise<Map<string, TimeSeriesRow>> {
  // TODO: Implement
  // 1. List files in range
  // 2. Stream each file concurrently (Promise.all)
  // 3. For each event:
  //    - Check if timestamp is in [from, to]
  //    - Get grouping key
  //    - Update row (views, clicks, hashes, sources)
  // 4. Return aggregation map
  // 5. Log errors (don't throw)
}

/**
 * Aggregate events by hash.
 */
export async function aggregateByHash(
  eventsDir: string,
  from: Date,
  to: Date
): Promise<Map<string, HashRow>> {
  // TODO: Implement
  // Similar to aggregateByTimePeriod, but:
  // - Group by hash instead of time period
  // - Track first_seen, last_seen timestamps
  // - Track all timestamps (for cardinality later)
}

/**
 * Calculate engagement rate for a row.
 */
function calculateEngagementRate(views: number, clicks: number): number {
  // TODO: Implement
  // - Return clicks / views if views > 0
  // - Return 0 if views === 0
}

/**
 * Finalize an aggregation map:
 * - Calculate engagement rates
 * - Extract top values
 * - Format for output
 */
function finalizeAggregation(
  aggregation: Map<string, TimeSeriesRow | HashRow>
): (TimeSeriesRow | HashRow)[] {
  // TODO: Implement
  // - Iterate over aggregation
  // - Calculate engagement_rate
  // - For TimeSeriesRow: extract top_hash and source_domains
  // - For HashRow: extract first_seen, last_seen, top_source
  // - Return as array
}

// ============================================================================
// SORTING & PAGINATION
// ============================================================================

/**
 * Sort aggregation results by the specified criteria.
 */
export function sortResults(
  results: (TimeSeriesRow | HashRow)[],
  sortBy: SortByMode
): (TimeSeriesRow | HashRow)[] {
  // TODO: Implement
  // - TIMESTAMP: natural order (by period or first_seen)
  // - VIEWS: descending
  // - CLICKS: descending
  // - ENGAGEMENT_RATE: descending
}

/**
 * Apply pagination (limit and offset).
 */
export function paginate<T>(
  results: T[],
  limit: number,
  offset: number
): { data: T[]; total: number } {
  // TODO: Implement
  // - Slice results[offset:offset+limit]
  // - Return { data: sliced, total: results.length }
}

// ============================================================================
// PUBLIC INTERFACE
// ============================================================================

export interface ReportAggregateRequest {
  eventsDir: string;
  from: string; // ISO-8601 date
  to: string; // ISO-8601 date
  groupBy?: GroupByMode;
  sortBy?: SortByMode;
  limit?: number;
  offset?: number;
}

export interface ReportAggregateResponse {
  period: { from: string; to: string; groupBy: GroupByMode };
  summary: {
    total_views: number;
    total_clicks: number;
    engagement_rate: number;
    unique_hashes: number;
    days_with_data: number;
  };
  data: (TimeSeriesRow | HashRow)[];
  pagination: { offset: number; limit: number; total: number };
}

/**
 * Main entry point: generate an aggregated analytics report.
 * 
 * @param request - Query parameters and directory
 * @returns Report with aggregated metrics
 * @throws Error if validation fails or I/O error occurs
 */
export async function reportAggregateAnalytics(
  request: ReportAggregateRequest
): Promise<ReportAggregateResponse> {
  // TODO: Implement
  // 1. Validate inputs (dates, enums, ranges)
  // 2. Choose aggregation strategy (by time period or hash)
  // 3. Aggregate events
  // 4. Finalize aggregation (calculate metrics)
  // 5. Sort results
  // 6. Apply pagination
  // 7. Calculate summary (total views, clicks, engagement rate, etc.)
  // 8. Return structured response
  // 9. Handle errors (no data → throw "not found", I/O → throw "server error")
}
```

---

## Test Structure: `packages/shadow-index/api/analytics-report.test.ts`

Create this test file with the following structure:

```typescript
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  validateDateRange,
  validateGroupBy,
  validateSortBy,
  GroupByMode,
  SortByMode,
  listEventsFilesInRange,
  aggregateByTimePeriod,
  aggregateByHash,
  reportAggregateAnalytics,
  sortResults,
  paginate,
} from './lib/analytics-report';
import { generateDateRange } from './lib/test-utils';

// Setup: Point to test_data/events/
const TEST_EVENTS_DIR = path.join(process.cwd(), 'test_data', 'events');

describe('Analytics Report Aggregation', () => {
  
  // ======================================================================
  // VALIDATION TESTS
  // ======================================================================
  
  describe('validateDateRange()', () => {
    it('should accept valid ISO-8601 date range', () => {
      // TODO: Test case
      // - Input: '2026-02-21', '2026-02-23'
      // - Expect: { from: Date, to: Date } with correct values
    });

    it('should reject if to < from', () => {
      // TODO: Test case
      // - Input: '2026-02-23', '2026-02-21'
      // - Expect: throw Error
    });

    it('should reject invalid ISO-8601 dates', () => {
      // TODO: Test cases
      // - 'invalid-date', '2026-02-21' → throw
      // - '2026-02-32', '2026-02-28' → throw (invalid day)
    });

    it('should reject future dates', () => {
      // TODO: Test case
      // - Input: tomorrow's date (if today is Feb 10, try Feb 11+)
      // - Expect: throw Error
    });
  });

  describe('validateGroupBy()', () => {
    it('should accept valid groupBy values', () => {
      // TODO: Test cases
      // - 'day' → GroupByMode.DAY
      // - 'week' → GroupByMode.WEEK
      // - 'hash' → GroupByMode.HASH
    });

    it('should reject invalid groupBy values', () => {
      // TODO: Test cases
      // - 'invalid' → throw
      // - 123 → throw
      // - null → throw
    });
  });

  // ======================================================================
  // FILE DISCOVERY TESTS
  // ======================================================================
  
  describe('listEventsFilesInRange()', () => {
    it('should discover JSONL files in date range', async () => {
      // TODO: Test case
      // - Call listEventsFilesInRange(TEST_EVENTS_DIR, new Date('2026-02-21'), new Date('2026-02-23'))
      // - Expect: array with 3 files (2026-02-21.jsonl, 2026-02-22.jsonl, 2026-02-23.jsonl)
      // - All files should exist and be readable
    });

    it('should return empty array if no files in range', async () => {
      // TODO: Test case
      // - Call with date range outside fixture dates (e.g., 2026-03-01 to 2026-03-05)
      // - Expect: empty array (not an error)
    });

    it('should handle missing events directory gracefully', async () => {
      // TODO: Test case
      // - Call with non-existent directory
      // - Expect: empty array or handled error (configurable)
    });
  });

  // ======================================================================
  // AGGREGATION TESTS: BY DAY
  // ======================================================================
  
  describe('aggregateByTimePeriod(groupBy=day)', () => {
    it('should aggregate events by day', async () => {
      // TODO: Test case
      // - Call aggregateByTimePeriod(TEST_EVENTS_DIR, from, to, GroupByMode.DAY)
      // - Expect aggregation map with 3 keys: '2026-02-21', '2026-02-22', '2026-02-23'
      // - Verify day 1: views=3, clicks=2 (from abc, def events)
      // - Verify unique hashes per day
    });

    it('should count unique hashes per day', async () => {
      // TODO: Test case
      // - Day 1 (2026-02-21): hashes = {abc, def} → 2 unique
      // - Day 2 (2026-02-22): hashes = {abc, def, ghi} → 3 unique
      // - Verify set cardinality
    });

    it('should track sources (domains) per day', async () => {
      // TODO: Test case
      // - Day 1 should have example.com and shop.com
      // - Verify source breakdown { domain: { views, clicks } }
    });

    it('should handle sparse data (days with no events)', async () => {
      // TODO: Test case with custom fixture
      // - Set date range that includes a day with no events
      // - Expect: that day is NOT in the aggregation map (or has 0 counts)
    });

    it('should skip malformed JSON lines and continue', async () => {
      // TODO: Test case with corrupt fixture
      // - Create a JSONL file with one bad line in the middle
      // - Expect: error logged but aggregation continues
      // - Verify good lines are still aggregated
    });
  });

  // ======================================================================
  // AGGREGATION TESTS: BY HASH
  // ======================================================================
  
  describe('aggregateByHash()', () => {
    it('should aggregate events by hash', async () => {
      // TODO: Test case
      // - Call aggregateByHash(TEST_EVENTS_DIR, from, to)
      // - Expect: aggregation map with hashes as keys
      // - Verify abc hash: views=6, clicks=4
      // - Verify def hash: views=2, clicks=1
      // - Verify ghi hash: views=2, clicks=1
    });

    it('should track first_seen and last_seen timestamps', async () => {
      // TODO: Test case
      // - abc hash should have first_seen='2026-02-21T08:30:00Z' and last_seen='2026-02-23T07:35:00Z'
      // - Verify timestamp ordering
    });

    it('should break down sources per hash', async () => {
      // TODO: Test case
      // - abc hash: example.com (X views, Y clicks), shop.com (A views, B clicks)
      // - Verify source_breakdown map is correct
    });
  });

  // ======================================================================
  // METRIC CALCULATION TESTS
  // ======================================================================
  
  describe('Engagement Rate Calculation', () => {
    it('should calculate engagement rate correctly', async () => {
      // TODO: Test case
      // - Aggregate all events (2026-02-21 to 2026-02-23, groupBy=day)
      // - Day 1: 3 views, 2 clicks → 66.7%
      // - Day 2: 4 views, 3 clicks → 75%
      // - Day 3: 2 views, 1 click → 50%
      // - Verify calculations match
    });

    it('should handle 0 views (avoid divide by zero)', async () => {
      // TODO: Test case with custom fixture
      // - Create a result with 0 views
      // - Expect engagement_rate=0 (not NaN or Infinity)
    });
  });

  // ======================================================================
  // SORTING TESTS
  // ======================================================================
  
  describe('sortResults()', () => {
    it('should sort by views (descending)', () => {
      // TODO: Test case
      // - Create 3 mock rows: views=[100, 50, 75]
      // - Call sortResults(rows, SortByMode.VIEWS)
      // - Expect order: [100, 75, 50]
    });

    it('should sort by engagement_rate (descending)', () => {
      // TODO: Test case
      // - Create 3 mock rows: engagement_rate=[0.5, 0.75, 0.6]
      // - Call sortResults(rows, SortByMode.ENGAGEMENT_RATE)
      // - Expect order: [0.75, 0.6, 0.5]
    });

    it('should maintain chronological order for timestamp sort', () => {
      // TODO: Test case
      // - Create rows with periods ['2026-02-23', '2026-02-21', '2026-02-22']
      // - Call sortResults(rows, SortByMode.TIMESTAMP)
      // - Expect order: ['2026-02-21', '2026-02-22', '2026-02-23']
    });
  });

  // ======================================================================
  // PAGINATION TESTS
  // ======================================================================
  
  describe('paginate()', () => {
    it('should respect limit parameter', () => {
      // TODO: Test case
      // - Create array of 10 items
      // - Call paginate(items, limit=5, offset=0)
      // - Expect: { data: [0–4], total: 10 }
    });

    it('should apply offset correctly', () => {
      // TODO: Test case
      // - Create array of 10 items
      // - Call paginate(items, limit=3, offset=5)
      // - Expect: { data: [5–7], total: 10 }
    });

    it('should handle offset beyond array length', () => {
      // TODO: Test case
      // - Create array of 10 items
      // - Call paginate(items, limit=5, offset=20)
      // - Expect: { data: [], total: 10 }
    });
  });

  // ======================================================================
  // END-TO-END TESTS
  // ======================================================================
  
  describe('reportAggregateAnalytics()', () => {
    it('should generate a complete report (groupBy=day)', async () => {
      // TODO: Integration test
      // - Call reportAggregateAnalytics({
      //     eventsDir: TEST_EVENTS_DIR,
      //     from: '2026-02-21',
      //     to: '2026-02-23',
      //     groupBy: GroupByMode.DAY,
      //     sortBy: SortByMode.TIMESTAMP,
      //     limit: 100,
      //     offset: 0
      //   })
      // - Verify response shape:
      //   - period.from = '2026-02-21', period.to = '2026-02-23'
      //   - summary.total_views = 11, summary.total_clicks = 7
      //   - summary.engagement_rate ≈ 0.636
      //   - data.length = 3 (one per day)
      //   - pagination.total = 3
    });

    it('should generate a complete report (groupBy=hash)', async () => {
      // TODO: Integration test
      // - Call with groupBy=HASH
      // - Verify response shape:
      //   - data is array of hash rows
      //   - abc row: views=6, clicks=4
      //   - def row: views=2, clicks=1
      //   - ghi row: views=2, clicks=1
      //   - pagination.total = 3 (three unique hashes)
    });

    it('should return 404 if no events in range', async () => {
      // TODO: Test case
      // - Call with date range outside fixtures (e.g., 2026-03-01 to 2026-03-05)
      // - Expect: throw Error with "no data" or similar message
    });

    it('should return correct summary metrics', async () => {
      // TODO: Test case
      // - Query all data
      // - Verify summary.unique_hashes = 3
      // - Verify summary.days_with_data = 3
      // - Verify summary.engagement_rate calculation
    });

    it('should respect limit and offset in pagination', async () => {
      // TODO: Test case
      // - Query with limit=2, offset=1
      // - Expect: data.length = 2, pagination.total = 3
      // - Verify correct rows are returned (offset skips first)
    });
  });

  // ======================================================================
  // ERROR HANDLING TESTS
  // ======================================================================
  
  describe('Error Handling', () => {
    it('should throw on invalid date range', async () => {
      // TODO: Test case
      // - Call with to < from
      // - Expect: throw with validation error
    });

    it('should throw on invalid groupBy parameter', async () => {
      // TODO: Test case
      // - Call with groupBy='invalid'
      // - Expect: throw with validation error
    });

    it('should log errors for malformed JSON (not throw)', async () => {
      // TODO: Test case with spy
      // - Create fixture with corrupt line
      // - Call aggregateByTimePeriod
      // - Expect: console.error called with line number
      // - Expect: function still returns valid aggregation for good lines
    });

    it('should handle I/O errors gracefully', async () => {
      // TODO: Test case
      // - Mock fs.readFile to throw
      // - Call reportAggregateAnalytics
      // - Expect: throw with "storage error" or similar
    });
  });
});
```

---

## Development Workflow

### Step 1: Set Up Test Data
```bash
mkdir -p test_data/events
# Copy the sample JSONL files from above into test_data/events/
```

### Step 2: Create Test Utilities
```bash
touch packages/shadow-index/api/lib/test-utils.ts
# Implement the utilities from the "Test Infrastructure Setup" section
```

### Step 3: Create Implementation File
```bash
touch packages/shadow-index/api/lib/analytics-report.ts
# Copy the starter template and fill in TODOs
```

### Step 4: Create Test File
```bash
touch packages/shadow-index/api/analytics-report.test.ts
# Copy the test structure and implement test cases
```

### Step 5: Run Tests (Iteratively)
```bash
cd packages/shadow-index
npm test analytics-report.test.ts -- --watch
```

### Step 6: Implement Functions One by One
- Start with validation functions (simplest)
- Move to file discovery
- Then aggregation logic
- Finally, sorting/pagination

### Step 7: Verify Against Manual Calculations
- Use the fixture data facts from "Sample JSONL Event Data"
- Manually verify aggregations match expected values
- Ensure engagement rates are correct

---

## Key Implementation Hints

### 1. Date Handling
```typescript
// Parse ISO-8601 date
const date = new Date('2026-02-21'); // UTC midnight

// Convert to YYYY-MM-DD for comparison
const dateStr = date.toISOString().split('T')[0];

// ISO week calculation
const getISOWeek = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const year = d.getFullYear();
  const week = Math.ceil((d - new Date(year, 0, 1)) / 86400000 / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
};
```

### 2. Concurrent File Reading
```typescript
// Read multiple files in parallel
const filePromises = files.map(file => streamJsonlFile(file));
const results = await Promise.all(filePromises);
```

### 3. Generator Pattern for Streaming
```typescript
async function* streamJsonlFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const event = JSON.parse(line);
      yield { event, lineNum: i + 1 };
    } catch (e) {
      yield { error: `Parse error: ${e.message}`, lineNum: i + 1 };
    }
  }
}
```

### 4. Map-Based Aggregation
```typescript
// Initialize aggregation
const agg = new Map<string, TimeSeriesRow>();

// Update row
const key = '2026-02-21';
if (!agg.has(key)) {
  agg.set(key, { period: key, views: 0, clicks: 0, hashes: new Set(), sources: new Map() });
}
const row = agg.get(key)!;
row.views += (event.event === 'view' ? 1 : 0);
row.clicks += (event.event === 'click' ? 1 : 0);
row.hashes.add(event.hash);
```

### 5. Summary Calculations
```typescript
let totalViews = 0;
let totalClicks = 0;
for (const row of agg.values()) {
  totalViews += row.views;
  totalClicks += row.clicks;
}
const engagementRate = totalViews > 0 ? totalClicks / totalViews : 0;
```

---

## Acceptance Criteria

**To complete Phase 1, all of the following must be true:**

- [ ] ✅ Unit tests pass (≥ 8 validation/aggregation tests)
- [ ] ✅ Integration tests pass (end-to-end report generation)
- [ ] ✅ Manual verification: aggregation matches fixture data facts
  - [ ] abc hash: 6 views, 4 clicks (66.7% engagement)
  - [ ] def hash: 2 views, 1 click (50% engagement)
  - [ ] ghi hash: 2 views, 1 click (50% engagement)
  - [ ] Total: 11 views, 7 clicks (63.6% engagement)
- [ ] ✅ Error handling: malformed JSON lines logged, not crash
- [ ] ✅ No TypeScript errors (`tsc --noEmit`)
- [ ] ✅ All existing tests still pass (`npm test`)
- [ ] ✅ Code is commented (algorithm explanation in pseudocode)
- [ ] ✅ Ready for handoff to Phase 2 (API routing)

---

## Debugging Guide

### Issue: Tests fail with "Cannot find module"
**Solution:** Ensure file paths are correct and TypeScript paths are configured in `tsconfig.json`

### Issue: JSONL parsing fails
**Solution:** Verify fixtures have proper JSON format (one object per line, no trailing commas)

### Issue: Aggregation counts are off
**Solution:** 
- Check date comparisons (ISO string vs Date object)
- Verify event filtering (is timestamp in range?)
- Trace through one event manually (add console.log at key points)

### Issue: Performance is slow (> 1 second for small dataset)
**Solution:**
- Avoid reading entire file into memory; use streaming
- Check for synchronous operations in hot loops
- Profile with `node --prof`

### Issue: Memory usage is high
**Solution:**
- Verify Sets and Maps are cleaned up after aggregation
- Check for circular references in stored objects
- Consider paginating results to avoid huge arrays

---

## Next Phase (Phase 2)

Once Phase 1 is complete and all tests pass, you'll be ready for **Phase 2: API Routing & Serialization**.

**Phase 2 will:**
- Create a Hono route `GET /v1/analytics/report`
- Parse query parameters (from, to, groupBy, sortBy, limit, offset)
- Call `reportAggregateAnalytics()` with validated params
- Serialize response to JSON
- Handle HTTP error responses (400, 404, 500)

**Phase 2 checklist will be provided when Phase 1 is approved.**

---

## Quick Reference: Test Data Facts

| Hash | Days | Views | Clicks | Engagement |
|------|------|-------|--------|------------|
| abc (3 days) | 21–23 | 6 | 4 | 66.7% |
| def (2 days) | 21–22 | 2 | 1 | 50% |
| ghi (1 day) | 22 | 2 | 1 | 50% |
| **Total (3 days)** | 21–23 | **11** | **7** | **63.6%** |

---

## File Checklist

Before you start, verify these exist:

- [ ] `packages/shadow-index/api/lib/` (create if missing)
- [ ] `test_data/events/2026-02-21.jsonl` (create with sample data)
- [ ] `test_data/events/2026-02-22.jsonl` (create with sample data)
- [ ] `test_data/events/2026-02-23.jsonl` (create with sample data)
- [ ] `packages/shadow-index/vitest.config.ts` (should already exist)
- [ ] `packages/shadow-index/package.json` (should already exist)

---

## Final Checklist Before Starting

- [ ] Read spec: [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md)
- [ ] Read brief: [ANALYTICS-REPORTING-IMPL-BRIEF.md](./ANALYTICS-REPORTING-IMPL-BRIEF.md)
- [ ] Understand test data facts (table above)
- [ ] Set up test fixtures in `test_data/events/`
- [ ] Verify Vitest is running (`npm test` in shadow-index)
- [ ] Create empty files: `lib/analytics-report.ts`, `analytics-report.test.ts`, `lib/test-utils.ts`
- [ ] Begin with validation functions (simplest to implement)

**You're ready to code.** Start with the checklist above and move through the implementation step-by-step. Commit early and often!

