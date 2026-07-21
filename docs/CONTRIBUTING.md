# Contributing to Fairflow

Thank you for helping improve Fairflow. This guide keeps the codebase production-quality.

Also read the [Code of Conduct](../CODE_OF_CONDUCT.md).

---

## Development setup

1. Fork and clone the repository  
2. Install Node.js 20 LTS  
3. Install package dependencies:

```bash
cd packages/shadow-index && npm install
cd ../auth-portal && npm install
```

4. Copy env templates:

```bash
cp packages/shadow-index/.env.example packages/shadow-index/.env
cp packages/auth-portal/.env.example packages/auth-portal/.env
```

5. Start API + portal (`npm run dev` in each package)  
6. Optional: `docker compose up --build`  

Details: [GETTING-STARTED.md](./GETTING-STARTED.md)

---

## Coding standards

- **TypeScript** strictness as configured per package  
- **ESLint** clean (`npm run lint`)  
- **Prettier** via root `.prettierrc`  
- Prefer clear names over abbreviations  
- No secrets, personal emails, or production URLs hardcoded  
- Validate inputs at HTTP boundaries (Zod)  
- Keep route handlers thin; business logic in `services/` / `lib/`  

Portal structure: feature folders under `src/features/*` with hooks + components colocated.

---

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(api): add payout eligibility check
fix(portal): guard merchant routes without token
docs: expand authentication guide
chore(ci): cache npm on Node 20
security: sanitize demo order fixtures
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `security`, `ci`.

---

## Branch naming

```text
feat/<short-description>
fix/<short-description>
docs/<short-description>
chore/<short-description>
security/<short-description>
```

Examples: `feat/merchant-csv-import`, `fix/paystack-webhook-idempotency`

---

## Pull request checklist

- [ ] PR description explains **why** and **what**  
- [ ] Linked issue (if applicable)  
- [ ] Tests added/updated for behavior changes  
- [ ] `npm run lint` and type-check pass in touched packages  
- [ ] `npm test` passes in touched packages  
- [ ] No real secrets or PII in the diff  
- [ ] Docs updated when APIs or env vars change  
- [ ] OpenAPI updated when endpoints change  

Use the GitHub PR template.

---

## Tests

| Package | Command |
|---------|---------|
| shadow-index | `npm test -- --run` |
| auth-portal | `npm test` |
| e2e (root) | `npm run test:e2e` (servers up) |

Prefer deterministic unit tests; mock external providers.

---

## Issues

- Bug reports: reproduction steps, expected vs actual, environment  
- Features: problem statement first, then proposal  
- Security: **private** disclosure only — see [SECURITY.md](../SECURITY.md)  

---

## License

By contributing, you agree that your contributions are licensed under the MIT License.
