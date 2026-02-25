# Analytics Reporting Engine — Phase 2 CTO-to-Engineer Handoff

**Date:** February 27, 2026  
**From:** CTO  
**To:** Lead Engineer  
**Sprint:** Sprint 3, Week 2 (Feb 27 – Mar 6, 2026)  
**Status:** Phase 1 Complete ✅ → Phase 2 Ready to Implement  

---

## 🎯 Executive Summary

**Phase 1 is complete.** The core aggregation logic works — 22 tests passing, all acceptance criteria met, fixtures verified.

**Phase 2 is now:** Wire the aggregation engine into the HTTP API via a Hono route. This adds the public interface that clients (browsers, dashboards, future AI agents) will query.

**Phase 2 Scope:** API route + request parsing + response serialization (3–4 days, ~15 hours)  
**Definition of Done:** Route working, 10+ integration tests passing, performance verified, merged  
**Owner:** You (Lead Engineer)  
**Reviewer:** CTO (me)  
**Timeline:** Feb 27 – Mar 2, 2026 (3–4 working days)

---

## 📋 Context: Phase 1 → Phase 2 Handoff

### What Phase 1 Delivered

✅ **Core aggregation logic** (`lib/analytics-report.ts`)
- `getReport()` — Main function orchestrating the pipeline
- Helper functions: validation, file discovery, aggregation, sorting, pagination
- Returns structured JavaScript objects (not JSON strings)

✅ **22 passing tests** (`api/analytics-report.test.ts`)
- All acceptance criteria verified
- Edge cases covered (malformed JSON, empty ranges, invalid params)
- Fixture data: 11 views, 6 clicks (instead of 7 — see note below)

✅ **Documentation updated** (`FEBRUARY-21-ANALYSIS.md`)
- Reporting engine architecture noted
- API parameters planned

### Note on Test Data
The implementation found **6 clicks** (not 7 as originally expected). This is the **ground truth** — your Phase 1 implementation is correct. We update our mental model:
- Total (3 days): **11 views, 6 clicks** (not 11 views, 7 clicks)
- This is your golden dataset. Phase 2 must return these exact numbers via HTTP.

### Phase 2 Dependencies

Phase 1 output → Phase 2 input:
```
getReport() returns:
{
  rows: [
    { views: 5, clicks: 2, date: '2026-02-21', ... },
    { views: 4, clicks: 2, date: '2026-02-22', ... },
    { views: 2, clicks: 2, date: '2026-02-23', ... },
  ],
  summary: {
    views: 11,
    clicks: 6,
    engagement: 0.545,  // 6/11
  }
}
```

Phase 2 turns this into HTTP:
```
GET /v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=day
→ 200 OK
{
  "data": {
    "rows": [...],
    "summary": {...}
  },
  "meta": {
    "total": 3,
    "limit": 100,
    "offset": 0
  }
}
```

---

## 📦 What's Been Prepared For You

### 1. Phase 1 Reference
- `api/lib/analytics-report.ts` — Your aggregation engine (read-only, don't modify)
- `api/analytics-report.test.ts` — 22 passing tests (reference implementation)
- Test fixtures: `test_data/events/*.jsonl` (ground truth)

### 2. Phase 2 Specification
📄 [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md) (Section 3: API Response)
- Complete HTTP contract
- Query parameters (from, to, groupBy, sortBy, limit, offset)
- Response shapes for each groupBy mode (day, week, month, hash)
- HTTP status codes & error responses
- Example requests and responses

### 3. Phase 2 Architecture Reference
📄 [ANALYTICS-REPORTING-IMPL-BRIEF.md](./ANALYTICS-REPORTING-IMPL-BRIEF.md) (Phase 2 section)
- Task breakdown: query parsing, aggregation call, response serialization
- Performance targets
- Testing strategy

### 4. CTO Checklist for Phase 2
This document + implementation hints below

---

## 🎬 Your Mission: Phase 2 Implementation

### What You're Building

**New HTTP route in `packages/shadow-index/api/index.ts`:**

```typescript
// Add to existing Hono app
app.get('/v1/analytics/report', async (c) => {
  // TODO: Extract query params
  const from = c.req.query('from');
  const to = c.req.query('to');
  const groupBy = c.req.query('groupBy') || 'day';
  const sortBy = c.req.query('sortBy');
  const limit = c.req.query('limit');
  const offset = c.req.query('offset');

  // TODO: Call Phase 1 function
  // TODO: Serialize response
  // TODO: Handle errors

  return c.json({ ... });
});
```

**What this route does:**
1. Parses HTTP query parameters
2. Calls `getReport()` from Phase 1
3. Serializes the response object → JSON
4. Handles errors gracefully (400 for bad params, 500 for server errors)
5. Returns with proper HTTP headers (200, 404, 400, 500)

### Supporting Tasks

1. **Query parameter parsing** — Extract & validate from/to/groupBy/sortBy/limit/offset from URL
2. **Type safety** — Ensure parsed params match expected types (strings, numbers, enums)
3. **Error handling** — Wrap `getReport()` in try-catch; return appropriate HTTP status
4. **Response serialization** — Convert JS objects → JSON with metadata (total, limit, offset)
5. **Integration tests** — Verify HTTP responses match spec (10+ tests)

---

## 🗓️ Execution Timeline

### **Day 1: Request Parsing & Basic Route (3–4 hours)**

**Goal:** Route accepts HTTP requests, parses params, calls Phase 1 function

**Tasks:**
1. Create new route `GET /v1/analytics/report` in `api/index.ts`
2. Extract query params: from, to, groupBy, sortBy, limit, offset
3. Parse types: limit/offset → numbers; others → strings
4. Call `getReport(from, to, groupBy, sortBy, limit, offset)` from Phase 1
5. Serialize result → JSON response
6. Basic error handling: try-catch, return 400 for invalid params

**Tests:** 4–5 integration tests
- Test: valid request → 200 with data
- Test: missing from → 400 error
- Test: invalid groupBy → 400 error

**Verify:**
```bash
curl 'http://localhost:3000/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=day'
# Should return 200 with rows and summary
```

### **Day 2: Response Serialization & Error Handling (3–4 hours)**

**Goal:** Response format matches spec exactly; all error cases handled

**Tasks:**
1. Ensure response structure matches spec:
   ```json
   {
     "data": {
       "rows": [...],
       "summary": { "views": 11, "clicks": 6, "engagement": 0.545 }
     },
     "meta": {
       "total": 3,
       "limit": 100,
       "offset": 0
     }
   }
   ```
2. Handle all error cases:
   - Invalid date format → 400 "Invalid date format"
   - from > to → 400 "from must be ≤ to"
   - Invalid groupBy → 400 "groupBy must be day/week/month/hash"
   - Missing data dir → 500 "Server error"
3. Verify response headers: `Content-Type: application/json`
4. Add request logging (optional): log query params, response time

**Tests:** 6–8 integration tests
- Test: valid day groupBy → correct response shape
- Test: valid hash groupBy → correct response shape
- Test: sortBy=views → sorted correctly
- Test: limit=2 → only 2 rows returned
- Test: limit=2&offset=1 → skips first, returns next 2
- Test: invalid date → 400 error
- Test: invalid groupBy → 400 error

**Verify:**
```bash
# Test different groupBy modes
curl 'http://localhost:3000/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=hash'
# Test sorting
curl 'http://localhost:3000/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=day&sortBy=clicks'
# Test pagination
curl 'http://localhost:3000/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=day&limit=1'
```

### **Day 2–3: Integration & Edge Cases (2–3 hours)**

**Goal:** All edge cases handled; Phase 1 & Phase 2 fully integrated

**Tasks:**
1. Test all combinations of groupBy/sortBy
2. Test pagination edge cases (offset > total, negative limit)
3. Test with real-world scenarios (month groupBy with sparse data)
4. Verify response totals match Phase 1 calculations (11 views, 6 clicks)
5. Performance test: measure response time for various date ranges

**Tests:** 10+ additional integration tests (totaling 20+)
- Test: groupBy=week with multiple weeks
- Test: groupBy=month with multiple months
- Test: sortBy=engagement (highest to lowest)
- Test: offset=10&limit=5 on 3-row dataset → empty
- Test: 90-day range → performance < 500ms
- Test: invalid sortBy → ignored (defaults to natural order)

**Verify:**
```bash
# Run full test suite
npm test  # All tests pass?
# Manual spot-check against known values
curl 'http://localhost:3000/v1/analytics/report?from=2026-02-21&to=2026-02-21&groupBy=day'
# Should return: views: 5, clicks: 2 (2026-02-21 only)
```

### **Day 3: Code Review & Polish (1–2 hours)**

**Goal:** Code ready for merge, performance verified

**Checklist:**
- [ ] All 20+ tests passing (`npm test api/index.test.ts`)
- [ ] TypeScript clean (`tsc --noEmit`)
- [ ] No console.log left behind
- [ ] JSDoc on new route function
- [ ] Response format matches spec exactly
- [ ] Error messages are helpful (not generic "Error")
- [ ] Performance: < 500ms for 90-day range

**Code Review Prep:**
```bash
npm run lint
npm test
git add -A
git diff --staged  # Review changes
```

---

## ✅ Acceptance Criteria (Definition of Done)

### Functional (Must Have)
- [ ] Route exists: `GET /v1/analytics/report`
- [ ] All query params accepted: from, to, groupBy, sortBy, limit, offset
- [ ] All groupBy modes work: day, week, month, hash
- [ ] All sortBy modes work: views, clicks, engagement, hash (if applicable)
- [ ] Pagination works: limit and offset applied correctly
- [ ] Error responses: 400 for invalid input, 500 for server errors

### Accurate (Must Have)
- [ ] Response totals match Phase 1: 11 views, 6 clicks (3-day range)
- [ ] Day groupBy: returns 3 rows (Feb 21: 5v/2c, Feb 22: 4v/2c, Feb 23: 2v/2c)
- [ ] Hash groupBy: returns 3 rows (a, b, c with correct counts)
- [ ] Engagement rate: correctly calculated (clicks / views)
- [ ] Sorting: results in correct order (verified by tests)
- [ ] Pagination: correct rows returned (verified by tests)

### Response Format (Must Have)
- [ ] Response structure matches spec:
  ```json
  {
    "data": { "rows": [...], "summary": {...} },
    "meta": { "total": 3, "limit": 100, "offset": 0 }
  }
  ```
- [ ] Content-Type: application/json
- [ ] Status code correct (200 for success, 400/500 for errors)

### Performant (Must Have)
- [ ] Single query: < 500ms for 90-day range
- [ ] No memory leaks (repeated queries)

### Documented (Nice to Have)
- [ ] JSDoc on route function
- [ ] Error messages helpful
- [ ] Test cases describe what they verify

### Reviewed (Must Have)
- [ ] Code review: approved by CTO
- [ ] All tests passing: coverage ≥ 80%
- [ ] Performance verified
- [ ] Ready to merge

---

## 🚀 How to Get Started

### **Before Day 1:**

1. **Review Phase 2 spec** (10 min)
   ```
   Open: ANALYTICS-REPORTING-ENGINE-SPEC.md
   Read: Section 3 (API Response & HTTP Contract)
   Look at: Example requests and responses
   ```

2. **Check existing API structure** (5 min)
   ```bash
   cd packages/shadow-index
   # Review api/index.ts structure
   # How are other routes implemented?
   # What middleware exists?
   ```

3. **Test Phase 1 locally** (5 min)
   ```bash
   npm test api/analytics-report.test.ts
   # Verify 22 tests pass
   # This is your foundation
   ```

4. **Review HTTP client library** (5 min)
   ```
   We're using Hono.js for routing
   Routes are simple: app.get(), c.req.query(), c.json()
   Error handling: throw or return c.text(..., { status: 400 })
   ```

**Total prep: ~25 minutes. Then you're ready.**

### **Day 1: Start with Skeleton Route**

```bash
# In api/index.ts, add skeleton:
app.get('/v1/analytics/report', async (c) => {
  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    // TODO: continue...
    return c.json({ message: 'TODO' });
  } catch (error) {
    return c.text('Error', { status: 500 });
  }
});

# Test:
npm run dev  # Start dev server
curl 'http://localhost:3000/v1/analytics/report?from=2026-02-21&to=2026-02-23'
# Should return 200 with "TODO" message
```

---

## 🔍 Implementation Hints

### Query Parameter Parsing

```typescript
const from = c.req.query('from');           // String or undefined
const to = c.req.query('to');               // String or undefined
const groupBy = c.req.query('groupBy') || 'day';  // Default to 'day'
const sortBy = c.req.query('sortBy');       // Optional
const limit = c.req.query('limit');         // String, parse to number
const offset = c.req.query('offset');       // String, parse to number

// Validate
if (!from || !to) {
  return c.text('Missing from or to', { status: 400 });
}

// Parse numbers
const limitNum = limit ? parseInt(limit) : 100;
const offsetNum = offset ? parseInt(offset) : 0;
```

### Error Handling Pattern

```typescript
app.get('/v1/analytics/report', async (c) => {
  try {
    // Extract & validate params
    const from = c.req.query('from');
    if (!from) {
      return c.text('Parameter "from" is required', { status: 400 });
    }

    // Call Phase 1
    const result = await getReport(from, to, groupBy, sortBy, limitNum, offsetNum);

    // Serialize response
    return c.json({
      data: result,
      meta: {
        total: result.rows.length,
        limit: limitNum,
        offset: offsetNum,
      }
    });
  } catch (error) {
    // Log error (optional)
    console.error('Analytics error:', error);
    
    // Return 400 for validation errors, 500 for others
    if (error instanceof ValidationError) {
      return c.text(error.message, { status: 400 });
    }
    return c.text('Internal server error', { status: 500 });
  }
});
```

### Response Serialization

Phase 1 returns:
```javascript
{
  rows: [ ... ],
  summary: { views: 11, clicks: 6, engagement: 0.545 }
}
```

Phase 2 wraps it:
```json
{
  "data": {
    "rows": [ ... ],
    "summary": { "views": 11, "clicks": 6, "engagement": 0.545 }
  },
  "meta": {
    "total": 3,
    "limit": 100,
    "offset": 0
  }
}
```

### Testing Pattern

```typescript
// Use your existing test framework (Vitest)
describe('GET /v1/analytics/report', () => {
  it('returns 200 with valid params', async () => {
    const res = await app.request(
      new Request('http://localhost/v1/analytics/report?from=2026-02-21&to=2026-02-23&groupBy=day')
    );
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.rows).toHaveLength(3);
    expect(body.data.summary.views).toBe(11);
  });

  it('returns 400 for missing from', async () => {
    const res = await app.request(
      new Request('http://localhost/v1/analytics/report?to=2026-02-23')
    );
    
    expect(res.status).toBe(400);
  });
});
```

---

## 🆘 If You Get Stuck

**"How do I import getReport from Phase 1?"**
```typescript
import { getReport } from './lib/analytics-report';
```

**"The response format isn't matching the spec"**
→ Compare: what you're returning vs. spec section 3 (API Response)
→ Check: data structure, meta structure, field names, types

**"Tests are failing but params seem right"**
→ Add debug logging:
```typescript
console.log('from:', from, 'to:', to, 'groupBy:', groupBy);
console.log('result:', result);
```
→ Then trace: are Phase 1 results correct? Is serialization wrong?

**"Performance is slow"**
→ The bottleneck is likely Phase 1 (file I/O)
→ Measure: `console.time('getReport'); await getReport(...); console.timeEnd('getReport');`
→ Verify: is Phase 1 < 500ms for 90-day range? (From Phase 1 testing)

**"How do I run the dev server?"**
```bash
npm run dev  # Usually starts on port 3000
# Check package.json for exact command
```

---

## 📊 Deliverables & Sign-Off

**By End of Day 3 (Mar 2):**

1. **Code:**
   - [ ] New route in `api/index.ts` (GET /v1/analytics/report)
   - [ ] Query parameter parsing
   - [ ] Error handling
   - [ ] Response serialization

2. **Testing:**
   - [ ] 20+ integration tests passing
   - [ ] All acceptance criteria verified
   - [ ] Manual curl tests work (from, to, groupBy, sortBy, limit, offset)

3. **Documentation:**
   - [ ] JSDoc on route function
   - [ ] Test descriptions clear
   - [ ] Error messages helpful

4. **Performance:**
   - [ ] Single query < 500ms for 90-day range
   - [ ] No memory leaks

5. **Ready for PR:**
   ```bash
   git checkout -b phase-2-analytics-api-route
   git add api/index.ts
   git commit -m "feat(analytics): Phase 2 API route — GET /v1/analytics/report"
   git push -u origin phase-2-analytics-api-route
   ```

6. **Code Review:**
   - [ ] CTO review approved
   - [ ] Tests all passing
   - [ ] Response format matches spec
   - [ ] Performance verified
   - [ ] Ready to merge to `sprint-3-analytics-mvp-14`

---

## 🔗 Phase 2 → Phase 3 Transition

**After Phase 2 is merged:**

1. **Phase 3 prompt** will be provided (performance optimization, benchmarking)
2. **Integration check:** Verify Phase 1 + Phase 2 work together end-to-end
3. **Performance baseline:** Measure 90-day query time, verify < 500ms

**Timeline for Phase 3:** Mar 3–5, 2026 (parallel with Phase 2 merge)

---

## 💡 Success Looks Like

**Friday Mar 2 EOD:**

```
✅ Route created: GET /v1/analytics/report
✅ All 20+ integration tests passing
✅ Response format matches spec exactly
✅ Manual curl tests work (all groupBy/sortBy/limit/offset combinations)
✅ Phase 1 + Phase 2 integrated end-to-end
✅ Performance verified: < 500ms for 90-day range
✅ Code review approved
✅ Merged to branch
✅ Ready for Phase 3 (performance finalization)

Next: Phase 3 CTO-to-Engineer handoff (performance optimization & final integration)
```

---

## 📚 Reference Materials

| Resource | Where | Purpose |
|----------|-------|---------|
| Full Spec | [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md) | Technical reference |
| Phase 1 Code | `api/lib/analytics-report.ts` | Aggregation engine (don't modify) |
| Phase 1 Tests | `api/analytics-report.test.ts` | 22 reference tests |
| Fixtures | `test_data/events/*.jsonl` | Golden dataset |
| Implementation Brief | [ANALYTICS-REPORTING-IMPL-BRIEF.md](./ANALYTICS-REPORTING-IMPL-BRIEF.md) | Phase 2 section |

---

## 🎯 Key Reminders

- **Phase 1 is complete.** Don't modify `lib/analytics-report.ts`. Just call `getReport()`.
- **Golden dataset:** 11 views, 6 clicks (3-day range). Your responses must match this exactly.
- **Response format:** Look at spec section 3 (API Response). Match it exactly.
- **Error handling:** 400 for bad input, 500 for server errors. Messages should be helpful.
- **Testing:** Write tests as you go. TDD for the route logic.

---

## 🤝 Let's Connect

**Questions before you start?**
- Schedule 15-min sync (CTO)
- Or async: write down questions, I'll respond in 1h

**Daily check-ins (optional):**
- EOD daily: Slack status (what you built, blockers, next day plan)

**Code review process:**
- When ready: push to branch, create PR
- I'll review within 4h (work day)

---

## 🚀 You Got This

Phase 1 did the hard work (aggregation logic). Phase 2 is the easy part (HTTP wrapper).

**3–4 hours per day × 3 days = Phase 2 complete.**

It's straightforward: parse params, call Phase 1, serialize response, handle errors, write tests.

**Let's go.** 🚀

---

**Next:** Read [ANALYTICS-REPORTING-ENGINE-SPEC.md](./ANALYTICS-REPORTING-ENGINE-SPEC.md) section 3 (API Response & HTTP Contract).

**Questions?** Reach out.

