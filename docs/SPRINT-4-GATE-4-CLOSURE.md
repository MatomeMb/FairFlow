# Sprint 4 — Gate 4 Closure Checklist

**Sprint:** Sprint 4 (Optimization & Scaling)  
**Gate:** End of Week 4  
**Date:** February 2026  
**Owner:** CTO

---

## Gate 4 Criteria (from Sprint 4 Plan)

| Criterion | Status | Notes |
|-----------|--------|-------|
| All deliverables complete and tested | [OK] | T4.1–T4.6 delivered; 88 tests passing |
| Release notes prepared | [OK] | [RELEASE-NOTES-v0.6.0.md](./RELEASE-NOTES-v0.6.0.md) |
| Beta onboarding guide reviewed | [OK] | [BETA-USER-ONBOARDING.md](./BETA-USER-ONBOARDING.md) |
| v0.6.0 tag created and pushed | [OK] | Tag created and pushed to origin |

---

## Beta Onboarding Review Checklist

| Item | Status | Reviewer |
|------|--------|----------|
| Quick start steps clear and accurate | [OK] | CTO |
| API endpoints correct (POST /compile, POST /catalog/import) | [OK] | CTO |
| Catalog Upload Web UI instructions match actual flow | [OK] | CTO |
| Analytics event schema documented | [OK] | CTO |
| Common issues and troubleshooting covered | [OK] | CTO |
| Contact/support path defined | [OK] | CTO |

**Review:** Complete above and sign off in [BETA-USER-ONBOARDING.md](./BETA-USER-ONBOARDING.md) footer or this document.

---

## Git Tag Commands

```bash
# From project root
cd c:\Users\matom\.cursor\worktrees\.Things-That-Matter\mcj

# Verify tests pass
cd packages/shadow-index && npm test -- --run

# Return to root, stage, commit (if uncommitted)
cd ../..
git add -A
git status

# Annotated tag
git tag -a v0.6.0 -m "Sprint 4 complete - Production hardening v0.6.0

- Sustained load testing
- API key revocation
- Operations manual
- Database migration roadmap
- Distributed deployment architecture
- Beta user onboarding
- 88 tests passing"

# Push tag
git push origin v0.6.0
```

---

## Post-Gate Actions

1. Verify tag on remote: `git ls-remote origin | grep v0.6.0`
2. Update [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md) with tag confirmation
3. Share release notes with stakeholders
4. Proceed to [SPRINT-4-REMAINING.md](./SPRINT-4-REMAINING.md) for outstanding items

---

*Document: SPRINT-4-GATE-4-CLOSURE.md. Gate Owner: CTO.*
