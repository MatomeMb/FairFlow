# .things that Matter
## Sprint 1 Plan (MVP v0)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Sprint Plan |
| **Version** | 1.0 |
| **Date** | February 1, 2026 |
| **Sprint Window** | Feb 3 - Feb 16, 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Sprint Goal

Deliver the MVP vertical slice: **compile → resolve → display** with a `matter://` link.

---

## 2. Sprint Backlog

| ID | Item | Owner | Status |
|----|------|-------|--------|
| MVP-01 | Compile single product JSON to `.thing` | CTO | Not Started |
| MVP-02 | Generate `matter://` URI from hash | CTO | Not Started |
| MVP-04 | Resolve hash via Shadow Index | CTO | Not Started |
| MVP-05 | Minimal UI renders product from `matter://` | CTO | Not Started |
| MVP-06 | MVP path tests | CTO | Not Started |

---

## 3. Build → Evaluate → Test → Ship

### Build
- Implement the minimal compile and resolve pipeline
- Wire minimal UI to display product gist

### Evaluate
- Validate against MVP acceptance criteria in `docs/10-MVP-BACKLOG.md`
- CEO review of the demo flow

### Test
- Unit tests for compile and resolve
- Basic end-to-end smoke test for the UI

### Ship
- Tag the MVP increment
- Update docs and release notes

---

## 4. Definition of Done

- Build succeeds locally
- Tests for changed areas pass
- MVP acceptance criteria met
- Docs updated
- Increment is demoable

---

## 5. Risks & Mitigations

- **Risk:** Scope too big for sprint  
  **Mitigation:** Split or defer to next sprint

- **Risk:** API integration takes longer  
  **Mitigation:** Stub response to unblock UI, replace with real call later

---

## 6. MVP Demo Steps

1. Start the Shadow Index API (`packages/shadow-index`)
2. POST a sample product JSON to `/compile`
3. Copy the returned `matter://` URI
4. Open any page with a `<a href="matter://...">` link
5. Click the link to view the overlay

---

## 7. MVP Test Checklist

- [ ] `/compile` returns `hash`, `matter_uri`, `thing_url`, and `gist`
- [ ] `/resolve/:hash` returns gist + URLs
- [ ] Extension overlay shows title + price
