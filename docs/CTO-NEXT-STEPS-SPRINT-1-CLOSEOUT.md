# CTO Memo: Next Steps Following Sprint 1 Closeout

**To:** CEO / Stakeholders  
**From:** CTO  
**Subject:** Post–Sprint 1 actions and Sprint 2 readiness  
**Date:** February 2026

---

## Context

Sprint 1 (Feb 3–16, 2026) delivered the MVP vertical slice: **compile → resolve → display** with a `matter://` link. The Shadow Index API, Lens extension, demo flow, and supporting tests and documentation are in place. This memo outlines the recommended next steps to formally close Sprint 1 and prepare for Sprint 2.

---

## Sprint 1 closeout checklist (status)

| # | Action | Status | Notes |
|---|--------|--------|--------|
| 1.1 | **Tag the release** | Done | Git tag `v0.1.0` created (Sprint 1 MVP). |
| 1.2 | **Sign off manual E2E** | Done | `docs/MANUAL-E2E-SMOKE.md` signed off — full flow verified (overlay: image, title, price, Buy Now). |
| 1.3 | **CEO sync** | Action | Brief demo of the flow, confirm Sprint 1 complete, align on Sprint 2 timing and priorities. |

Sprint 2 planning (2.1–2.4) has been started: Sprint 2 window set (Feb 17 – Mar 2, 2026), `docs/12-SPRINT-2-PLAN.md` created, and `docs/PROGRESS-AND-VERSION.md` updated. P1 scope is in the Sprint 2 backlog; CTO/CEO can reprioritise or defer items as needed.

---

## 1. Sprint 1 formal closeout (reference)

Complete the following before considering Sprint 1 fully closed:

| # | Action | Owner | Notes |
|---|--------|--------|--------|
| 1.1 | **Tag the release** | CTO | Create a git tag (e.g. `v0.1.0` or `sprint-1-mvp`) so the code version in `docs/PROGRESS-AND-VERSION.md` corresponds to a reproducible release. |
| 1.2 | **Sign off manual E2E** | CTO | Run the full demo once (API + demo server + extension; click `matter://` link). If the overlay appears with image, title, price, and Buy Now, complete the sign-off line in `docs/MANUAL-E2E-SMOKE.md`. |
| 1.3 | **CEO sync** | CTO / CEO | Brief demo of the flow, confirm Sprint 1 scope is complete, and align on Sprint 2 timing and priorities. |

---

## 2. Sprint 2 planning (status)

| # | Action | Status | Notes |
|---|--------|--------|--------|
| 2.1 | **Set Sprint 2 window** | Done | Feb 17 – Mar 2, 2026 (2 weeks). |
| 2.2 | **Select P1 scope** | Done | All four P1 items in Sprint 2 backlog; CTO/CEO can trim or defer. |
| 2.3 | **Publish Sprint 2 plan** | Done | `docs/12-SPRINT-2-PLAN.md` created (goal, backlog, DoD, demo reference). |
| 2.4 | **Update progress tracking** | Done | `docs/PROGRESS-AND-VERSION.md` updated: Sprint 2 row added; P1 items set to “Planned for Sprint 2”. |

**Reference — Sprint 2 planning (original):**

| # | Action | Owner | Notes |
|---|--------|--------|--------|
| 2.1 | **Set Sprint 2 window** | CTO | Define the next 2-week sprint (e.g. starting after Feb 16). |
| 2.2 | **Select P1 scope** | CTO / CEO | From `docs/10-MVP-BACKLOG.md`, choose which P1 items enter Sprint 2: MVP-07 (XMP beacon detection), MVP-08 (platform test results logging), MVP-09 (basic auth and rate limits), MVP-10 (error handling polish). Not all four need to be in one sprint. |
| 2.3 | **Publish Sprint 2 plan** | CTO | Create `docs/12-SPRINT-2-PLAN.md` with sprint goal, backlog, definition of done, and demo steps. |
| 2.4 | **Update progress tracking** | CTO | In `docs/PROGRESS-AND-VERSION.md`, set current sprint to Sprint 2 and move selected P1 items to “Planned for Sprint 2” or “In progress” as appropriate. |

---

## 3. Recurring: before each development session

To run or demo the system locally:

| # | Action | Command / step |
|---|--------|-----------------|
| 3.1 | Start Shadow Index API | `cd packages/shadow-index` → `npm run start` |
| 3.2 | (Optional) Start demo server | `powershell scripts/start-demo-server.ps1` |
| 3.3 | Extension | Ensure Lens is loaded in Chrome (`chrome://extensions` → Load unpacked → `packages/lens-extension`). Reload the extension if extension code was changed. |

Full runbook: **How to Run the MVP Demo** in `docs/11-SPRINT-1-PLAN.md`.

---

## 4. Optional / backlog for later

- **Rust compiler:** Implement `Compiler::compile()` in `matter-core` so `.thing` can be produced from Rust as well as via the API (currently deferred; can be scheduled for Sprint 2 or a later sprint).
- **R2 / storage (MVP-03):** “Store artifacts in R2” remains in the backlog; add to a sprint when prioritised.

---

## Summary

**Immediate:** Complete Sprint 1 closeout (tag, manual E2E sign-off, CEO sync).  
**Next:** Plan Sprint 2 (window, P1 selection, `12-SPRINT-2-PLAN.md`, progress doc update).  
**Ongoing:** Use `docs/PROGRESS-AND-VERSION.md` for version and sprint state; use the runbook in `docs/11-SPRINT-1-PLAN.md` to run the demo.

---

*Document version: 1.0 | Sprint 1 closeout*
