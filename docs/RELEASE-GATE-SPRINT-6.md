# Release Gate — Sprint 6

**Project:** .things that Matter  
**Sprint:** 6 (Feb 12 - Feb 26, 2026)  
**Purpose:** Enforce objective go/no-go criteria for extension 1.0 release readiness and Chrome Web Store publication.

---

## Gate Objective

Confirm that the product is ready to move from Sprint 6 into active beta scaling with controlled risk and clear ownership.

---

## Go/No-Go Criteria

### 1) Store Readiness

- [ ] Chrome Web Store screenshots captured and approved (3-5 images, 1280x800 preferred).
- [ ] Public HTTPS privacy policy URL is live and reachable.
- [ ] Store listing metadata completed (short description, full description, icon set, category).
- [ ] Store package uploaded and submission confirmation recorded.

### 2) Product Quality

- [ ] Zero open P0 defects.
- [ ] Zero unresolved P1 defects at gate close.
- [ ] Full critical flow validated: compile -> resolve -> matter link -> extension overlay -> click through.
- [ ] Regression checks completed for install flow and permission behavior.

### 3) Operational Readiness

- [ ] Support workflow active with severity model and response targets.
- [ ] Known-issues list reviewed; each item has owner and due date.
- [ ] Escalation path agreed between CTO and CEO.

### 4) Documentation Readiness

- [ ] `RELEASE-PROCESS-LENS.md` reviewed and tested with one dry run.
- [ ] `INSTALL-LENS-PRODUCTION.md` published or updated for current release path.
- [ ] Release notes draft prepared for next release candidate.

---

## Decision Record

| Decision Item | Status | Notes |
|---------------|--------|-------|
| Gate Date | Pending | |
| Gate Result (GO/NO-GO) | Pending | |
| CTO Sign-off | Pending | |
| CEO Sign-off | Pending | |

---

## Exit Outcomes

If **GO**:
- Proceed with Sprint 7 beta scale-up plan.
- Track first merchant onboarding and support SLA in weekly review.

If **NO-GO**:
- Open a short stabilization track (max 3 business days).
- Re-run gate after blockers are closed and re-tested.

---

## Related Documents

- [CHROME-WEB-STORE-CHECKLIST.md](./CHROME-WEB-STORE-CHECKLIST.md)
- [SCREENSHOT-GUIDE.md](./SCREENSHOT-GUIDE.md)
- [SUPPORT-WORKFLOW.md](./SUPPORT-WORKFLOW.md)
- [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md)
- [RELEASE-PROCESS-LENS.md](./RELEASE-PROCESS-LENS.md)
