# .things that Matter
## Scrum Operating Model (MVP-first)

---

| **Document Information** | |
|--------------------------|---|
| **Company Name** | .things that Matter |
| **Document Type** | Scrum Operating Model |
| **Version** | 1.1 |
| **Date** | March 2026 |
| **Author** | Matome Mboweni, CTO |

---

## 1. Purpose

Shift execution to Scrum so every sprint delivers a **working, testable, shippable** increment. The focus is the **simplest MVP**, then iterative improvement. This project is a **real product** driving innovation in Object-Oriented Commerce; the operating model supports predictable delivery and stakeholder visibility via **day-level work plans** and **realistic estimates** (see [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md)).

---

## 2. Roles (Solo Scrum)

- **Product Owner:** CEO (value and priority)
- **Scrum Master:** CTO (process, blockers)
- **Developers:** CTO (implementation)

---

## 3. Sprint Cadence

- **Sprint Length:** 2 weeks (10 working days)
- **Planning (Day 1):** 60–90 min — confirm goal, pull stories, align with [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md)
- **Daily Standup:** 10 min — what did I do, what will I do, any blockers (solo: log in doc or task list)
- **Refinement (Mid-sprint):** 30 min — adjust remaining days if scope or priority changed
- **Review + Retro (Last day):** 45–60 min — demo to CEO; what went well, what to improve; release checklist
- **Release:** Tag and/or deploy at sprint end; update [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md)

---

## 4. Build → Evaluate → Test → Ship Loop

1. **Build:** Deliver the smallest vertical slice for the sprint goal.
2. **Evaluate:** Check against MVP acceptance criteria and stakeholder feedback.
3. **Test:** Run unit/integration tests and record results.
4. **Ship:** Deploy or tag a release; update docs and notes.

---

## 5. Scrum Artifacts

- **Product Backlog:** `docs/10-MVP-BACKLOG.md`
- **Sprint Plan:** `docs/11-SPRINT-1-PLAN.md`
- **Increment:** Shippable output at end of sprint

---

## 6. Definition of Done (DoD)

- Code builds without errors
- Tests for changed areas pass
- Acceptance criteria met
- Docs updated
- Release checklist completed
- Increment is deployable or shipped

---

## 7. Release Checklist (Sprint End)

- [ ] Sprint goal achieved and demoable
- [ ] Tests run and passing
- [ ] Release notes captured
- [ ] Roadmap updated if scope changed
- [ ] Stakeholder demo completed
- [ ] Next sprint backlog refined

---

## 8. MVP Guardrails

- Keep scope minimal per sprint
- Prefer vertical slices over horizontal layers
- If a story is too big, split it
- No feature without acceptance criteria
- Any work must support the MVP goal

---

## 9. Metrics

- **Sprint Goal Success Rate:** % of sprints with goal met
- **Cycle Time:** start to done per story
- **Defect Escape Rate:** bugs found after release
- **Release Frequency:** 1 per sprint

---

## 10. Work Estimation Guidelines

- **Capacity per sprint:** ~56–60 hours deliverable (6h/day × 10 days, minus ceremonies and buffer). See [16-WEEKLY-WORK-PLAN.md §2](./16-WEEKLY-WORK-PLAN.md#2-work-estimate-assumptions).
- **Stories:** If a story is >16h, split it. Prefer tasks in 4–6h chunks for daily tracking.
- **Daily:** Start with the planned task and estimated hours from the weekly work plan; note slippage or scope change for re-planning.

---

## 11. Next Action

- **Backlog:** [10-MVP-BACKLOG.md](./10-MVP-BACKLOG.md) — keep priorities and status current.
- **Active sprint:** See [15-DELIVERY-TIMELINE.md](./15-DELIVERY-TIMELINE.md) and [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md) for current sprint and release.
- **Day-by-day:** [16-WEEKLY-WORK-PLAN.md](./16-WEEKLY-WORK-PLAN.md) — use for daily focus and stakeholder “what’s being worked on.”
