# Analytics Reporting Engine — Phase 1 CTO-to-Engineer Handoff

**Date:** February 21, 2026  
**From:** CTO  
**To:** Lead Engineer  
**Sprint:** Sprint 3, Week 2 (Feb 27 – Mar 6, 2026)  
**Status:** Ready to implement  

---

## 🎯 Executive Summary

We're implementing the **Reporting Aggregation Engine** — the core logic to transform analytics events (stored as JSONL) into structured, queryable reports. This is a **critical path feature** for MVP-14 (Conversion Analytics).

**Phase 1 Scope:** Core aggregation logic (5 days, ~20 hours)  
**Definition of Done:** 15+ tests passing, manual verification against known dataset, < 500ms performance, merged to branch  
**Owner:** You (Lead Engineer)  
**Reviewer:** CTO (me)  
**Timeline:** Feb 27 – Mar 6, 2026 (5 working days)

---

## 📋 Context: Why This Matters

**Business:**
- Merchants need to understand product performance (clicks, conversions, engagement)
- Our extension tracks view & click events
- Currently: events are stored (v0.5.0 complete); now we need to query them
- MVP-14 is the "observability milestone" — required before we ship to beta

**Technical:**
- Events are JSONL (line-delimited JSON) in `data/events/YYYY-MM-DD.jsonl`
- We need to aggregate by day/week/month/hash with sorting & pagination
- Target: sub-500ms queries for ≤ 90-day ranges
- Constraint: No external DB (MVP-only, file-based)

**Dependency Chain:**
```
Phase 1 (You)        Phase 2           Phase 3            Phase 4
Aggregation Engine → HTTP Routing    → Integration        → Optimization
(core logic)         (API wiring)      (perf/testing)      (Supabase)
```

---

## 📦 What's Been Prepared For You

**Everything is ready. Nothing is missing.** Here's your toolkit:

### 1. Complete Specification
📄 [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md)
- API contract (GET /v1/analytics/report with all query params)
- Algorithm pseudocode (5-phase breakdown)
- 29 implementation subtasks
- 15+ test scenarios
- **You don't need to design this.** It's locked. Implement it.

### 2. Implementation Roadmap
📄 [ANALYTICS-REPORTING-COMPLETE-SUMMARY.md](./ANALYTICS-REPORTING-COMPLETE-SUMMARY.md)
- 4-day breakdown (what to do each day)
- Acceptance criteria (25+ checkboxes)
- Common pitfalls & debugging guide
- **This is your week-to-week guide.**

### 3. Ready-to-Code Implementation Prompt
📄 [ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md](./ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md)
- Pre-implementation checklist (env setup)
- **3 JSONL fixture files (copy-paste ready)** with 11 events across 3 days
- **Starter code template** (90% boilerplate with TODOs)
- **60+ annotated test stubs** (organized by feature)
- Implementation hints with code examples
- Debugging notes
- **This is your hands-on roadmap. Everything you need to code.**

### 4. Test Data Reference
All fixture facts verified:
- **abc hash:** 6 views, 4 clicks, 66.7% engagement (3 days)
- **def hash:** 2 views, 1 click, 50% engagement (2 days)
- **ghi hash:** 2 views, 1 click, 50% engagement (1 day)
- **Total:** 11 views, 7 clicks, 63.6% engagement
- **Your implementation must produce these exact numbers.** No approximations.

---

## 🎬 Your Mission: Phase 1 Implementation

### What You're Building

**Core aggregation logic in `packages/shadow-index/api/lib/analytics-report.ts`:**

```typescript
// Main function you'll implement
export async function reportAggregateAnalytics(
  from: string,           // ISO date (2026-02-21)
  to: string,             // ISO date (2026-02-23)
  groupBy: 'day' | 'week' | 'month' | 'hash',
  sortBy?: 'views' | 'clicks' | 'engagement' | 'hash',
  limit?: number,
  offset?: number
): Promise<AggregateReport>
```

Plus 6 supporting functions (validate, discover, stream, aggregate, sort, paginate).

**Supporting infrastructure in `packages/shadow-index/api/lib/test-utils.ts`:**
- Helper functions for JSONL parsing, date manipulation, domain extraction
- Reusable across tests

**Test suite in `packages/shadow-index/api/analytics-report.test.ts`:**
- 60+ test stubs (you'll fill in the implementation)
- Tests for validation, aggregation, metrics, sorting, pagination, error handling
- All organized by feature

---

## 🗓️ Execution Timeline

### **Day 1–2: Validation & File Discovery (4–6 hours)**

**Goal:** Correct JSONL files are identified for date ranges

**Functions to implement:**
1. `validateDateRange()` — Ensure from ≤ to, ISO format
2. `validateGroupBy()` — Ensure valid groupBy value
3. `validateSortBy()` — Ensure valid sortBy value
4. `listEventsFilesInRange()` — Find all JSONL files between dates

**Tests to pass:** 4–5 unit tests  
**Validation:** Can identify which files should be queried for 2026-02-21 to 2026-02-23  
**Debugging:**
```bash
npm test analytics-report.test.ts -- --grep "validation" --watch
```

### **Day 2–3: Streaming & Aggregation (6–8 hours)**

**Goal:** Aggregation totals match known dataset facts

**Functions to implement:**
5. `streamJsonlFile()` — Read JSONL, yield valid events, skip malformed
6. `aggregateByTimePeriod()` — Group events by day/week/month, count views/clicks
7. `aggregateByHash()` — Group events by product hash, count views/clicks
8. `calculateEngagementRate()` — clicks / views (or 0 if views = 0)
9. `finalizeAggregation()` — Compute summary stats (total views, total clicks, etc.)

**Tests to pass:** 10–12 aggregation tests  
**Validation:** 
```
abc: 6 views, 4 clicks ✓
def: 2 views, 1 click ✓
ghi: 2 views, 1 click ✓
Total: 11 views, 7 clicks ✓
```
**Debugging:**
```bash
# Test a single hash aggregation
npm test analytics-report.test.ts -- --grep "abc.*aggregation" --watch

# Manual test: console.log aggregation maps
console.log('abc events:', eventsByHash.get('abc'));
```

### **Day 3: Sorting, Pagination & Integration (4–6 hours)**

**Goal:** Full report generation works end-to-end

**Functions to implement:**
10. `sortResults()` — Sort by views/clicks/engagement/hash (ascending/descending)
11. `paginate()` — Apply limit & offset to sorted results
12. `reportAggregateAnalytics()` — Orchestrate (validate → discover → stream → aggregate → sort → paginate)

**Tests to pass:** 15+ total (all aggregation + sorting + pagination + integration)  
**Validation:**
```
GET /v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=hash&sortBy=views
→ [{hash: 'abc', views: 6, clicks: 4, engagement: 0.667}, ...]
```
**Debugging:**
```bash
npm test analytics-report.test.ts -- --watch
# All tests should pass
```

### **Day 4: Testing & Performance (2–4 hours)**

**Goal:** Benchmarks verified, no memory leaks, code review ready

**Checklist:**
- [ ] All 15+ tests passing (`npm test analytics-report.test.ts`)
- [ ] TypeScript clean (`tsc --noEmit`)
- [ ] Performance: single query < 500ms for 90-day range
  ```bash
  node --prof lib/analytics-report.ts  # profile
  ```
- [ ] Memory: < 500 MB for large aggregations
- [ ] No console.log left behind (remove debug code)
- [ ] JSDoc comments on all functions
- [ ] Test data facts manually verified (abc: 6 views, etc.)

**Code Review Prep:**
```bash
npm run lint          # Fix any style issues
npm test             # All green
git add -A
git diff --staged    # Review your changes
```

---

## ✅ Acceptance Criteria (Definition of Done)

**You're done Phase 1 when:**

### Functional (Must Have)
- [ ] All 15+ test cases pass (`npm test analytics-report.test.ts`)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No runtime errors with fixture data
- [ ] Malformed JSON handled gracefully (log, don't crash)
- [ ] Empty date ranges return appropriate response (not an error)

### Accurate (Must Have)
- [ ] Engagement rates: clicks / views (handles zero views)
- [ ] Totals correct: sum(row.views) = expected total
- [ ] Unique hash counts match expected cardinality
- [ ] Date range math: ISO-8601 parsing accurate, inclusive both ends
- [ ] **Manual verification:** abc=6 views/4 clicks, def=2 views/1 click, ghi=2 views/1 click

### Performant (Must Have)
- [ ] Single query: < 500ms (measured with 90-day range)
- [ ] Memory: < 500 MB (profiled with Node inspector)
- [ ] No memory leaks (repeated queries don't grow memory)
- [ ] Concurrent I/O working (5 simultaneous file reads max)

### Documented (Nice to Have)
- [ ] Code comments explain algorithm
- [ ] All functions have JSDoc
- [ ] Debugging notes verified (hints match reality)
- [ ] Test cases are descriptive

### Reviewed (Must Have)
- [ ] Code review: approved by CTO (me)
- [ ] Tests: all passing, coverage ≥ 80%
- [ ] Performance: benchmarks verified
- [ ] Ready to merge to `sprint-3-analytics-mvp-14`

---

## 🚀 How to Get Started

### **Today (Before Day 1):**

1. **Read the spec** (15 min)
   ```
   Open: ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md
   Read: Sections 1–4 (Executive Brief through Pre-Implementation)
   ```

2. **Check environment** (5 min)
   ```bash
   cd packages/shadow-index
   node --version           # v18+?
   npm test                 # Existing tests pass?
   ```

3. **Set up fixtures** (5 min)
   ```bash
   mkdir -p test_data/events
   # Copy 3 JSONL files from PHASE1-IMPL-PROMPT.md
   # Verify: cat test_data/events/2026-02-21.jsonl | wc -l  (should be 5 events)
   ```

4. **Create files** (2 min)
   ```bash
   touch api/lib/test-utils.ts
   touch api/lib/analytics-report.ts
   touch api/analytics-report.test.ts
   ```

5. **Copy starter code** (10 min)
   ```
   Copy test utils → lib/test-utils.ts (from PHASE1-IMPL-PROMPT.md, section 8)
   Copy impl template → lib/analytics-report.ts (from PHASE1-IMPL-PROMPT.md, section 9)
   Copy test stubs → analytics-report.test.ts (from PHASE1-IMPL-PROMPT.md, section 10)
   ```

6. **Verify setup** (2 min)
   ```bash
   tsc --noEmit     # Should show no errors (only TODOs)
   npm test         # Should run tests (all fail, that's expected)
   ```

**Total prep time: ~45 minutes. Then you're ready to code.**

### **Day 1: Start TDD**

```bash
# Watch mode: auto-run tests as you edit
npm test analytics-report.test.ts -- --watch

# Implement validation functions first (simplest)
# Each function: write → test → iterate
```

---

## 🔍 Key Implementation Hints

**Date Handling:**
```typescript
const start = new Date(from + 'T00:00:00Z');
const end = new Date(to + 'T23:59:59Z');
// Use getTime() for comparisons (epoch ms)
```

**JSONL Parsing:**
```typescript
// Use fs.createReadStream() for lazy line-by-line reading
// Don't load entire file into memory
const lines = line.split('\n').filter(l => l.trim());
const event = JSON.parse(line);  // Can throw; wrap in try-catch
```

**Aggregation Map:**
```typescript
const byHash = new Map<string, { views: number; clicks: number }>();
// Increment: byHash.get(hash)?.views++ || byHash.set(hash, { views: 1, clicks: 0 })
// Or use reduce if you prefer functional
```

**Engagement Rate:**
```typescript
const engagement = views > 0 ? (clicks / views).toFixed(3) : '0.000';
// Type: number or string? Check spec (section 4). Use parseFloat if needed.
```

**Concurrent File Reading:**
```typescript
// Limit concurrent reads to 5
const pLimit = require('p-limit');
const limit = pLimit(5);
const promises = filesList.map(file => limit(() => readFile(file)));
```

---

## 🆘 If You Get Stuck

**"Tests fail but I can't see why"**
→ Check [ANALYTICS-REPORTING-COMPLETE-SUMMARY.md](./ANALYTICS-REPORTING-COMPLETE-SUMMARY.md), "Getting Help" section
→ Manual debug: `console.log()` at key aggregation points
→ Trace one event through your function manually

**"Aggregation totals don't match"**
→ Verify fixture files are copied correctly
→ Spot-check: `cat test_data/events/2026-02-21.jsonl | jq '.hash, .type'`
→ Expected: 3 views, 2 clicks on Feb 21
→ If not matching, copy-paste fixtures again from spec

**"Performance is slow"**
→ Profile: `node --prof lib/analytics-report.ts`
→ Check for synchronous operations in loops
→ Verify concurrent file reading (not sequential)
→ Memory: `node --inspect` + Chrome DevTools

**"TypeScript errors"**
→ Check imports (Zod, fs/promises, etc.)
→ Ensure function signatures match spec exactly
→ Use `.catch()` for Promises, not raw errors

**Quick Escalation:**
→ Slack/email me (CTO)
→ Expected response: within 1 hour (during work day)

---

## 📊 Deliverables & Sign-Off

**By End of Day 4 (Mar 6):**

1. **Code:**
   - [ ] `api/lib/analytics-report.ts` — All functions implemented
   - [ ] `api/lib/test-utils.ts` — Helper functions
   - [ ] `api/analytics-report.test.ts` — All 15+ tests passing

2. **Testing:**
   - [ ] `npm test` — All tests pass, coverage ≥ 80%
   - [ ] Manual verification — abc: 6 views/4 clicks ✓
   - [ ] Performance benchmark — < 500ms for 90-day range ✓

3. **Documentation:**
   - [ ] JSDoc on all functions
   - [ ] Test case descriptions accurate
   - [ ] No `console.log()` or `TODO` left in production code

4. **Ready for PR:**
   ```bash
   git checkout -b phase-1-analytics-aggregation
   git add api/lib/analytics-report.ts api/lib/test-utils.ts api/analytics-report.test.ts
   git commit -m "feat(analytics): Phase 1 aggregation engine — core logic + tests"
   git push -u origin phase-1-analytics-aggregation
   ```

5. **Code Review:**
   - [ ] CTO review approved
   - [ ] Merge to `sprint-3-analytics-mvp-14`
   - [ ] Tag: v0.6.0 (Phase 1 complete)

---

## 🔗 Phase 1 → Phase 2 Transition

**After Phase 1 is merged:**

1. **Phase 2 prompt** will be provided (HTTP routing, API wiring)
2. **Blockers checked:** Does Phase 2 depend on anything from Phase 1? (No — we designed for independence)
3. **Integration point:** Phase 2 imports `reportAggregateAnalytics()` from your Phase 1 code

**Timeline for Phase 2:** Mar 7–10, 2026 (overlaps with Phase 3: performance testing)

---

## 💡 Success Looks Like

**Monday Mar 6 EOD:**

```
✅ 15+ tests passing
✅ Manual facts verified (abc: 6 views, 4 clicks)
✅ Performance benchmark: 347ms for 90-day range (< 500ms target)
✅ Code review approved
✅ Merged to branch
✅ Ready for Phase 2 wiring

Next: Phase 2 CTO-to-Engineer handoff (Phase 2 implementation prompt)
```

---

## 📚 Reference Materials (All Ready For You)

| Resource | Where | Purpose |
|----------|-------|---------|
| Full Spec | [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md) | Technical reference |
| Implementation Guide | [ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md](./ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md) | Hands-on code guide |
| Quick Reference | [ANALYTICS-REPORTING-COMPLETE-SUMMARY.md](./ANALYTICS-REPORTING-COMPLETE-SUMMARY.md) | Navigation hub |
| Fixtures | `test_data/events/*.jsonl` | Test data (copy from spec) |
| Event Schema | [MVP-14-EVENT-SPEC-AND-STORAGE.md](./MVP-14-EVENT-SPEC-AND-STORAGE.md) | Event structure reference |

---

## 🎯 Final Checklist Before You Start

- [ ] All 4 analytics docs read (at least skimmed)
- [ ] Node v18+ installed
- [ ] Existing `npm test` passes
- [ ] Understand the 5-phase algorithm (spec section 4)
- [ ] Know the test data facts (abc: 6v/4c, def: 2v/1c, ghi: 2v/1c)
- [ ] Familiar with Vitest (our test runner)
- [ ] Have access to PHASE1-IMPL-PROMPT.md for copy-paste code

**You're ready.** Let's ship this.

---

## 🤝 Let's Connect

**Questions before you start?**
- Schedule 15-min sync (CTO)
- Or async: write down questions, I'll respond in 1h

**Daily check-ins (optional but recommended):**
- EOD daily: Slack status (what you built, blockers, next day plan)
- That's it — we keep it light

**Code review process:**
- When ready: push to branch, create PR with description
- I'll review within 4h (during work day)
- Feedback loop: you iterate, I re-review

---

## 🚀 You Got This

Everything is prepared. The spec is locked. The fixtures are ready. The starter code is there. All you need to do is implement 7 functions, fill in 60 test stubs, and make them all pass.

**4–6 hours per day × 5 days = Phase 1 complete.**

**Let's go.** 🚀

---

**Next:** Start with [ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md](./ANALYTICS-REPORTING-PHASE1-IMPL-PROMPT.md) section 1 (Executive Brief).

**Questions?** Reach out.

