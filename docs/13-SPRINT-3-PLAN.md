# .things that Matter
## Sprint 3 Plan (P2 scope)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 1.0 |
| **Date** | February 2026 |
| **Sprint Window** | Mar 3 – Mar 16, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Sprint goal

Extend the product with **P2 capabilities**: batch compilation, catalog import, extension caching, and/or analytics. Scope to be confirmed with CEO; defer lower-priority items if capacity is limited.

---

## 2. Sprint backlog (from P2)

| ID | Item | Owner | Status | Acceptance criteria (from backlog) |
|----|------|-------|--------|-------------------------------------|
| MVP-11 | Batch compilation | CTO | Not started | 100+ products processed |
| MVP-12 | Merchant catalog import | CTO | Not started | CSV/JSON ingestion |
| MVP-13 | Extension caching | CTO | Not started | IndexedDB cache works |
| MVP-14 | Analytics events | CTO | Not started | Track views and clicks |

**Source:** [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md) — P2 section.

**Scope confirmation:** CTO/CEO to select which items enter Sprint 3; not all four need to be in one sprint. Optional: Rust compiler (compile in matter-core) or R2/storage (MVP-03) if prioritised.

---

## 3. Build → Evaluate → Test → Ship

### Build
- Implement selected P2 items per acceptance criteria.
- Keep Sprint 1/2 demo flow stable.

### Evaluate
- Validate against P2 acceptance criteria.
- CEO/CTO review of new behaviour.

### Test
- Tests for new behaviour; existing Vitest and cargo test suites remain green.

### Ship
- Tag Sprint 3 increment; update docs and [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md).

---

## 4. Definition of done

- Build succeeds locally.
- Existing tests pass; new tests for changed areas.
- Selected P2 acceptance criteria met.
- Docs and progress tracking updated.
- Sprint 1/2 demo flow still works.

---

## 5. How to run the MVP demo (unchanged)

Same as Sprint 1. See [11-SPRINT-1-PLAN.md — How to Run the MVP Demo](./11-SPRINT-1-PLAN.md#2b-how-to-run-the-mvp-demo).

---

## 6. Risks and mitigations

- **Risk:** P2 scope too large.  
  **Mitigation:** Pick 1–2 items for Sprint 3; defer rest to Sprint 4.
- **Risk:** Batch/catalog work blocks extension work.  
  **Mitigation:** Parallelise or sequence by dependency (e.g. batch before catalog import).

---

*Sprint 3 plan v1.0 | Created at Sprint 2 closeout. Scope to be confirmed with CEO.*
