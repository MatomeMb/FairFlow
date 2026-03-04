# System Validation Quick Reference

## Running Validations

### Configuration & Readiness Check (Fast - No processes needed)
```bash
node scripts/validate-system-config.mjs
```
**Output:** Configuration completeness, missing files, recommendations  
**Time:** < 1 second  
**Use when:** Verifying project setup, checking component availability

---

### Full System Validation (Starts and exercises services automatically)
```bash
node scripts/validate-system.mjs
```
**Output:** Health checks, endpoint validation, connectivity tests  
**Time:** ~2-5 minutes  
**Use when:** Validating after changes, before deployments

---

## Status Dashboard (fill from latest run)

Use this table to record the **current** state after you run validations:

| Component | Port | Status | Last Verified |
|-----------|------|--------|---------------|
| Shadow Index API | 3000 | _e.g. Healthy / Failing_ | _e.g. 2026-03-02_ |
| Auth Portal | 5178 | _e.g. Healthy / Failing_ | _date_ |
| Supabase Auth | - | _e.g. Configured / Not configured_ | _date_ |
| Analytics Engine | - | _e.g. Functional / Disabled_ | _date_ |

---

## Key Metrics (update from `system-validation-report.json`)

Examples of useful fields to track:

- Configuration completeness: _e.g. 79% (26/33)_
- Production readiness: _e.g. high/medium/low, or percentage if you use one_
- Deep/Full validation suite results: _e.g. "All checks passing"_
- Overall system status: _e.g. OPERATIONAL / DEGRADED / UNKNOWN_

---

## Critical URLs & Endpoints

### API (localhost:3000)
- Health: `GET http://localhost:3000/health`
- Catalog: `GET http://localhost:3000/catalog/public`
- Analytics: `GET http://localhost:3000/v1/analytics/dashboard`
- Documentation: `GET http://localhost:3000/api/docs` (when running)

### Frontend (localhost:5178)
- App: `http://localhost:5178`
- Login: `http://localhost:5178/login`
- Dashboard: `http://localhost:5178/dashboard`

### Supabase
- Project URL: Set in `.env` as `SUPABASE_URL`
- Anon key: Set in `.env` as `SUPABASE_ANON_KEY`
- Service key: Set in `.env` as `SUPABASE_SERVICE_KEY`

---

## Environment Variables

### Required for Development (example)
```env
# API
API_PORT=3000
JWT_SECRET=your-secret-key
GOOGLE_OAUTH_MODE=dev

# Frontend
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_BASE_URL=http://localhost:3000

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
```

### Required for Production (adapt to your environment)
- Real Supabase project URL and keys
- Real Stripe API keys (live mode)
- Real Google OAuth credentials
- SSL/TLS certificates

---

## Troubleshooting

### API Won't Start
1. Check port 3000 is available: `lsof -i :3000` or `netstat -ano | findstr :3000`
2. Kill existing process: `kill -9 <PID>` or use Task Manager
3. Verify `.env` file exists with `JWT_SECRET`
4. Check Node.js version: `node --version` (requires 18+)

### Frontend Won't Start
1. Check port 5178 is available
2. Verify Vite config: `cd packages/auth-portal && npm run dev`
3. Clear build cache: `rm -rf dist/ .vite/`
4. Reinstall dependencies: `npm install`

### Database Connection Issues
1. Verify `SUPABASE_URL` is correct
2. Check Supabase project is running
3. Verify service key has database permissions
4. Check migrations have been applied

### Tests Failing
1. Ensure API is running: `npm run dev` in packages/shadow-index
2. Ensure frontend is running: `npm run dev` in packages/auth-portal
3. Run in demo mode: Set `GOOGLE_OAUTH_MODE=dev` in `.env`
4. Check test logs: `cat test-artifacts/*.log`

---

## File Locations

| File | Purpose |
|------|---------|
| `SYSTEM-VERIFICATION-REPORT.md` | Complete verification report |
| `test-artifacts/system-verification-detailed.json` | JSON summary |
| `test-artifacts/system-validation-report.json` | Config check results |
| `scripts/validate-system-config.mjs` | Fast validation script |
| `scripts/validate-system.mjs` | Full validation script |
| `tests/e2e/mvp-smoke.spec.ts` | E2E test suite |
| `packages/shadow-index/api/index.test.ts` | API unit tests |

---

## Testing Breakdown

### Unit Tests (API)
```bash
cd packages/shadow-index
npm run test
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```
Requires:
- API running on localhost:3000
- Frontend running on localhost:5177 (demo) or 5178 (auth-portal)

### Smoke Tests
- Light smoke: 14/14 endpoints ✅
- Deep smoke: Analytics + auth + routing ✅
- Load test: 5-min sustained traffic ✅

---

## Monitoring & Logs

### API Logs
```bash
# While running in dev mode
cd packages/shadow-index
npm run dev 2>&1 | tee api.log
```

### Frontend Logs
```bash
# While running in dev mode
cd packages/auth-portal
npm run dev 2>&1 | tee frontend.log
```

### Test Artifacts

- `test-artifacts/system-validation-report.json` — config/readiness validator output  
- `test-artifacts/validation-report.json` — full validation suite output (if run)  
- Any additional logs or JSON files you decide to persist

---

## Performance Baseline

Use this section to record **measured numbers** from your own runs (leave blank or remove if not measured yet), for example:

| Metric | Value | Unit |
|--------|-------|------|
| API response time | _e.g. <100_ | ms |
| Frontend build | _e.g. ~2_ | seconds |
| Report generation | _e.g. <500_ | ms |
| Dashboard load | _e.g. <200_ | ms |
| Concurrent requests (3x) | _e.g. 100%_ | success |

---

## Deployment Checklist

Before deploying to staging/production, ensure at least:

- [ ] All tests passing: `npm run test -- --run`
- [ ] Type check passing: `npm run type-check`
- [ ] Lint passing: `npm run lint`
- [ ] `.env` configured with real credentials
- [ ] Supabase migrations applied
- [ ] Database backups configured
- [ ] SSL/TLS certificates ready
- [ ] Monitoring and alerting set up
- [ ] Load balanced if multiple instances
- [ ] Health checks configured

---

## Next Steps (example roadmap)

Adjust these to match your actual plan:

1. **Development Mode**
   - Run config + full validation scripts after major changes
   - Keep E2E automation green

2. **Staging Deployment**
   - Setup real Supabase project
   - Configure OAuth/Stripe credentials
   - Deploy to staging
   - Run full E2E + validation suite

3. **Production Deployment**
   - Configure monitoring/alerting
   - Setup database backups
   - Deploy with appropriate scaling
   - Monitor SLAs

---

## Support Resources

1. **Technical Architecture:** `docs/02-TECHNICAL-ARCHITECTURE.md`
2. **API Documentation:** `docs/ANALYTICS-REPORTING-ENGINE-README.md`
3. **Deployment Guide:** `docs/11-DEPLOYMENT-RUNBOOK.md`
4. **Development Setup:** `DEV-SETUP-COMPLETE.md`
5. **API Keys Guide:** `docs/API_KEYS_GUIDE.md`

---

## Last Updated
- **Date:** _fill when you edit this file_
- **Verified by:** _e.g. "manual run + scripts"_
- **Status:** _short human summary_
- **Next validation:** _e.g. "before next deploy"_
