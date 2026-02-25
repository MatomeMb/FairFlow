# Git Workflow Standards

## Purpose

This document defines the minimum professional standard for Git usage in this repository, including branch hygiene, commit quality, merge controls, and reporting cadence.

## Branch Strategy

- `main` is protected and release-ready.
- Feature work is done on short-lived branches named by scope (example: `feat/payment-routing`, `fix/order-confirmation`).
- Branches must be rebased or merged with latest `origin/main` before pull request review.

## Commit Standards

- Use conventional, scoped commit subjects:
  - `feat(scope): short description`
  - `fix(scope): short description`
  - `docs(scope): short description`
  - `chore(scope): short description`
- Keep subject line <= 72 characters when possible.
- Keep each commit logically atomic and reversible.
- Do not commit runtime artifacts, secrets, generated caches, or local environment files.

## Pull Request Standards

- Every PR must include:
  - Objective and scope
  - Risk and rollback notes
  - Validation evidence (tests, manual verification, screenshots if UI)
- Resolve all merge conflicts locally before requesting review.
- Squash or clean noisy commit history when required for readability.

## Merge and Release Controls

- Before merge to `main`:
  1. `git fetch --all --prune`
  2. `git status -sb` must be clean
  3. Validate ahead/behind (`git branch -vv`)
  4. Resolve conflicts and re-run validation
- After merge:
  - Tag releases consistently (`vX.Y.Z`)
  - Record release notes and deployment notes

## Required Reporting Cadence

- Daily (active development): status + recent history snapshot
- Weekly: branch hygiene and merge quality review
- Release: full version history and tag report

## Automated Reporting

Use the built-in reporting command:

```bash
npm run git:report
```

This generates timestamped artifacts under `reports/git/`:

- `git-status-<timestamp>.txt`
- `git-history-<timestamp>.txt`
- `git-summary-<timestamp>.md`

Optional parameters (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/git-version-report.ps1 -Since "14 days ago" -MaxCommits 300
```

## Senior Reviewer Checklist

- Branch is synchronized with upstream and conflict-free
- Commit history is readable and scoped
- No accidental file churn from formatting or generated artifacts
- Tags and release notes reflect the delivered version
- Working tree is clean at handoff
