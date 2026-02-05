# Sprint 2 Kickoff — Feb 6, 2026

**Date:** February 6, 2026 (Friday)  
**Sprint:** Sprint 2 (Feb 6–19, 2026)  
**Goal:** MVP-13 IndexedDB caching, overlay performance, cross-browser validation  
**Team:** CTO (Matome Mboweni)  
**Status:** ✅ KICKOFF COMPLETE

---

## 1. Sprint Kickoff (1h) ✅

### Completed:
- ✅ Sprint 2 planning meeting conducted
- ✅ MVP-13 goal aligned: IndexedDB caching for resolve responses
- ✅ Capacity confirmed: 10 working days × 5 hours = 50 hours
- ✅ Target version: lens-extension v0.3.0
- ✅ Release target: Feb 19, 2026
- ✅ Demo audience: CEO (Sobuhle Nyambali)

### Team Alignment:
- All acceptance criteria (AC1–AC6) reviewed and understood
- Test strategy confirmed (unit + integration + E2E)
- Performance baselines established (cache hit <20ms, overlay render <50ms)
- Cross-browser scope defined (Chrome 110+, Edge 110+, Brave 1.62+)

---

## 2. Criteria Review (1.5h) ✅

### Acceptance Criteria Verified:

| AC | Criterion | Verification Method | Status |
|----|-----------|--------------------|--------|
| AC1 | **Cache-on-read** — Second matter:// click uses cache; no new /resolve/ request | DevTools Network tab | ✅ Defined |
| AC2 | **Cache-on-success** — Response stored in IndexedDB with hash, gist, thing_url, fetchedAt | DevTools Application → IndexedDB inspection | ✅ Defined |
| AC3 | **No cache on error** — Failed API requests NOT cached; error shown in overlay | Resolve invalid hash; check IndexedDB | ✅ Defined |
| AC4 | **TTL enforcement** — Cache entries >24h treated as miss; API called and cache updated | Set fetchedAt to 24h+ ago; verify new request | ✅ Defined |
| AC5 | **Overlay unchanged** — Cached and fresh data produce identical overlay | Visual/functional parity: first vs. second click | ✅ Defined |
| AC6 | **Cache isolation** — IndexedDB owned by service worker; survives page reload | Close tab → reopen → cache persists | ✅ Defined |

### Documentation References:
- Acceptance criteria: [docs/17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](../docs/17-MVP-13-ACCEPTANCE-AND-SCHEMA.md)
- Manual verification steps: [docs/VERIFY-MVP-13-CACHE.md](../docs/VERIFY-MVP-13-CACHE.md)
- Completion checklist: [docs/SPRINT-2-COMPLETION-CHECKLIST.md](../docs/SPRINT-2-COMPLETION-CHECKLIST.md)

---

## 3. Schema Finalization (1.5h) ✅

### IndexedDB Schema Confirmed:

**Database:** `lens-matter-cache` (v1)  
**Store:** `resolve` (keyed by hash)  

**Entry Shape (validated):**

```javascript
{
  hash: "1a5f3799684d79a1c78df5fe9a4647c6ee255475684e419fcc411790a8a735bc",
  gist: {
    title: "Demo Product",
    price: 14999,        // in cents
    currency: "USD",
    image_url: "https://example.com/demo.jpg"
  },
  thing_url: "http://localhost:3000/thing/1a5f37...",
  image_url: "https://example.com/demo.jpg",
  checkout_url: "https://example.com/buy",
  fetchedAt: 1738828800000
}
```

**TTL Configuration:**
- Default: 24 hours (86,400,000 ms)
- Behavior: Entries older than TTL treated as cache miss
- Implementation: Check `Date.now() - fetchedAt > TTL` in `cacheGet()`

**Message Protocol (finalized):**

Request (content → background):
```javascript
{ type: 'resolve', hash: string }
```

Response (background → content):
- Success: `{ ok: true, data: ResolvePayload }`
- Failure: `{ ok: false, error: string }`

### Schema Validation:
- ✅ All 6 fields required/optional verified
- ✅ TTL formula correct and implementable
- ✅ Message protocol matches Chrome extension API constraints
- ✅ No conflicts with existing code

---

## 4. Test Structure (1h) ✅

### Test File: `packages/lens-extension/tests/cache.test.js`

**Status:** ✅ Created and structured

**Test Coverage:**
- ✅ AC1: Cache-on-read (2 test cases: hit, miss)
- ✅ AC2: Cache-on-success (2 test cases: storage, field validation)
- ✅ AC3: No cache on error (2 test cases: error path, no persistence)
- ✅ AC4: TTL enforcement (2 test cases: stale, fresh)
- ✅ AC5: Overlay unchanged (1 test case: data parity)
- ✅ AC6: Cache isolation (2 test cases: context, persistence)
- ✅ Message protocol (3 test cases: request shape, success response, error response)

**Total Test Cases:** 15 unit tests covering all AC + protocol

**Test Framework:**
- Framework: Vitest/Jest (compatible with extension environment)
- Setup: Mock IndexedDB (Map-based in-memory store)
- No external dependencies required

### Test Execution Plan:
- **Feb 9:** Run AC1 + AC2 tests; fix failures
- **Feb 10:** Run AC3 + AC4 tests; fix failures
- **Feb 12:** Integration test (E2E manual)
- **Feb 18:** Regression test (all tests pass)

---

## Sprint 2 Readiness Checklist

- ✅ Acceptance criteria: Reviewed and aligned (AC1–AC6)
- ✅ IndexedDB schema: Finalized and validated
- ✅ Test file: Created with 15 test cases
- ✅ Development environment: Ready (Shadow Index API running on localhost:3000, demo server on 5177)
- ✅ Documentation: Complete (MVP-13-ACCEPTANCE-AND-SCHEMA.md, VERIFY-MVP-13-CACHE.md, cross-browser, daily breakdown)
- ✅ Code: Background.js and content.js ready for implementation
- ✅ Team: CTO aligned and ready to execute

---

## Feb 6 Summary

**Hours Invested Today:** 5h  
- Sprint kickoff: 1h ✅
- Criteria review: 1.5h ✅
- Schema finalization: 1.5h ✅
- Test structure: 1h ✅

**Deliverables (Complete):**
1. ✅ Sprint 2 plan documented and communicated
2. ✅ All 6 acceptance criteria reviewed and verified
3. ✅ IndexedDB schema finalized (DB, store, entry shape, TTL)
4. ✅ Test file created with 15 test cases covering all AC

**Next Steps (Feb 9):**
- Implement `cacheGet()` and `cacheSet()` functions in background.js
- Run AC1 + AC2 tests; fix any failures
- Verify IndexedDB mock works correctly

**Blockers:** None

**Risk Assessment:** No identified risks; all systems go.

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 6, 2026 | CTO | Sprint 2 kickoff summary: criteria reviewed, schema finalized, tests structured. |

---

*Related: [SPRINT-2-DAILY-BREAKDOWN.md](./SPRINT-2-DAILY-BREAKDOWN.md) (complete 10-day plan), [README.md](../README.md) (current sprint section), [17-MVP-13-ACCEPTANCE-AND-SCHEMA.md](./17-MVP-13-ACCEPTANCE-AND-SCHEMA.md) (schema details).*
