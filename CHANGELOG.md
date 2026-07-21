# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/) where package versions apply.

## [Unreleased]

### Added

- Portfolio-grade open-source documentation suite (`docs/ARCHITECTURE.md`, `SYSTEM_DESIGN.md`, `DATABASE.md`, `AUTHENTICATION.md`, `API_REFERENCE.md`, `DEPLOYMENT.md`, `SECURITY.md`, `CONTRIBUTING.md`, `ROADMAP.md`)
- Root professional `README.md` with architecture diagrams and quick start
- Docker support (`Dockerfile`s + `docker-compose.yml`)
- GitHub community health files (issue/PR templates, CODEOWNERS, Dependabot, Code of Conduct, Security policy)
- Consolidated root `.env.example` checklist
- Open Source Readiness Report

### Changed

- Admin elevation emails driven by `VITE_ADMIN_EMAILS` (no hardcoded personal addresses)
- Bootstrap SQL role assignment uses placeholder emails
- Sanitized demo/runtime fixtures (PII removed from notifications, orders, merchant bank samples)
- OpenAPI license set to MIT
- Fixed corrupted `.gitignore` merge conflict markers

### Removed

- Accidental empty junk files in `packages/auth-portal/`
- Scratch files (`test-me-endpoint.js` with sample JWT, empty email draft)
- Large internal meeting PDF from the default tree (keep private if still needed)

### Security

- Removed personal customer PII from committed demo snapshots
- Documented git history scrubbing (`git filter-repo` / BFG) prior to public release
- Clarified that service role and admin secrets must never ship to the browser

## [0.6.0] — 2026-03

### Added

- Shadow Index commerce API (Hono): merchant auth, products, checkout, webhooks, analytics
- Auth portal: merchant, admin/CEO, consumer shop experiences
- Paystack integration and Sumsub KYC hooks
- Supabase RBAC migrations
- Vitest suites and Playwright e2e scaffolding
- CI workflow for type-check, lint, test, build

### Notes

- Package version anchors: `@thingsthatmatter/shadow-index@0.6.0`, auth-portal `0.1.0`, matter-core `0.3.0`
