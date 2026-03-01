# Deployment Runbook

**Safe, repeatable deployment procedures for fairflow shadow-index and supporting services.**

---

## Pre-Deployment Verification Checklist

### Code Quality (5 min)

```bash
# In /packages/shadow-index:
npm run type-check    # Must have 0 errors
npm run lint          # Must have 0 errors
npm test -- --run     # All tests passing
npm run build         # Build succeeds, no warnings
```

**Sign-off:** _______________

### Dependency Security (3 min)

```bash
npm audit                    # Check for vulnerabilities
npm outdated                 # Review outdated packages
git diff HEAD~1 package*.json  # Review changes to deps
```

**Decision:** [ ] Safe to proceed  |  [ ] Hold for security review

### Environment Validation (2 min)

```bash
# Verify all required env vars are set:
echo $STRIPE_SECRET_KEY      # Must be sk_test_* or sk_live_*
echo $JWT_SECRET            # Must be >= 32 chars
echo $GOOGLE_CLIENT_ID      # Must be non-empty
echo $GOOGLE_CLIENT_SECRET  # Must be non-empty
```

**Sign-off:** _______________

---

## Deployment Steps

### Stage 1: Pre-Deployment Backup (2 min)

```bash
# Create backup of current data
cp -r data/ data-backup-$(date +%s)/

# Export current merchant accounts
node scripts/backup-merchants.mjs

# Record current metrics
curl http://localhost:3000/health > health-pre-deploy.json
```

### Stage 2: Code Deployment (5 min)

```bash
# Pull latest code
git fetch origin
git checkout main  # Switch from sprint branch to main
git pull origin main

# Install dependencies
npm install --production  # Prod deps only

# Build TypeScript
npm run build

# Verify build artifacts
ls -la dist/  # Should have compiled API
```

### Stage 3: Database/Schema Updates (varies)

**If migrations are needed:**

```bash
# Run migrations in order
node scripts/migrate-001-add-payout-logs.mjs
node scripts/migrate-002-update-merchant-kyc.mjs

# Verify migration
npm run verify-migrations
```

**No rollback possible once migrations run.** Coordinate with team.

### Stage 4: Service Restart (3 min)

```bash
# Stop current service gracefully (allow 30s for active requests)
kill -TERM <PID>  # Wait for SIGTERM
sleep 30
ps aux | grep node  # Verify stopped

# Start new version
npm start &

# Verify startup
sleep 5
curl http://localhost:3000/health

# Check logs for errors
tail -20 shadow-index.log
```

### Stage 5: Smoke Tests (5 min)

```bash
# Run critical path smoke tests
npm run smoke-test

# Verify key endpoints respond
curl http://localhost:3000/health               # Should be 200
curl -X POST http://localhost:3000/compile \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","price":100,"currency":"USD"}'  # Should be 200

# Check analytics endpoint
curl 'http://localhost:3000/v1/analytics/report?from=2026-01-01&to=2026-03-02'
```

**All tests must pass.** If any fail, see Rollback section below.

---

## Post-Deployment Verification (10 min)

### Monitoring Dashboard (Ongoing)

```bash
# Check error rate
curl http://localhost:3000/v1/analytics/dashboard

# Should show:
# - Error rate < 0.1%
# - No slow queries (p95 < 500ms)
# - Cache hit rate > 80%
# - Recent queries completing
```

### Key Business Metrics

| Metric | Target | Check Method |
|--------|--------|--------------|
| Payment success rate | > 99% | `curl /v1/analytics/report?from=\`date -d '1 day ago' +%Y-%m-%d\`` |
| Auth failures | < 0.5% | Review error logs for '401' or 'invalid_credentials' |
| API latency p95 | < 500ms | Check dashboard latency histogram |
| Merchant sign-ups | Working | Try registering test merchant |

### Log Review (3 min)

```bash
# Check for errors in last hour
grep ERROR shadow-index.log | tail -20

# Check for warnings
grep WARN shadow-index.log | tail -20

# Alert if:
# - Rate limiter triggeringfrequently
# - High error rate
# - Database connection failures
# - Storage quota warnings
```

### Notify Stakeholders

```
✅ Deployment successful
   - Version: v0.6.0+1
   - Deployed at: [timestamp]
   - Key changes: [summary]
   - Monitoring dashboard: [link]
```

---

## Rollback Procedure (Emergency)

**Use only if post-deployment checks fail or issues arise.**

### Immediate Actions (1 min)

```bash
# Kill current process immediately
pkill -9 node

# If severe data corruption: restore from backup
rm -rf data/
cp -r data-backup-[TIMESTAMP]/ data/

# Checkout previous version
git checkout HEAD~1
npm install --production
npm run build
```

### Restart Previous Version (3 min)

```bash
npm start &
sleep 5
curl http://localhost:3000/health

# Verify rollback
grep "version" health-pre-deploy.json  # Compare with current
```

### Communication

```
🚨 ROLLBACK EXECUTED
   - Issue: [description]
   - Rolled back to: v0.6.0
   - Status: [running/investigating]
   - ETA to fix: [time]
   - Investigation log: [link]
```

---

## Data-Related Deployments

### With Schema Changes

⚠️ **These cannot be rolled back easily.** Coordinate with team.

```bash
# 1. Take full backup
cp -r data/ data-pre-schema-change/
git stash  # Save exact backup reference

# 2. Deploy with new code
git checkout [branch]
npm install && npm run build

# 3. Run migration
node scripts/migrate-XYZ.mjs

# 4. Verify migration
npm run test -- integration/  # Run integration tests

# 5. If all passes: commit
git add data/
git commit -m "data: apply schema migration XYZ"

# 6. If issues: investigate and fix (no rollback)
```

### With Data Export/Import

```bash
# Export current state
node scripts/export-merchants.mjs > merchants-backup.json
node scripts/export-orders.mjs > orders-backup.json

# Deploy new version
[follow standard deployment]

# If issues with import: restore from JSON
node scripts/import-merchants.mjs merchants-backup.json
```

---

## Analytics-Specific Deployments

### Retention Policy Changes

```bash
# Before deployment:
curl 'http://localhost:3000/v1/analytics/report?from=2026-01-01&to=2026-02-01'
# Copy response to verify existing data

# Deploy new code
[standard deployment]

# After deployment:
curl 'http://localhost:3000/v1/analytics/dashboard'
# Verify events still present and queries working
```

### Pre-Aggregation Deployment

```bash
# Run pre-aggregation to test
npm run pre-aggregate

# Deploy code
[standard deployment]

# Verify reports still work
curl 'http://localhost:3000/v1/analytics/report?from=2026-03-01&to=2026-03-02&groupBy=day'
```

---

## Scheduled Deployments

### Maintenance Window (2 hours before to after)

- ✅ No high-traffic periods
- ✅ Team available for issues
- ✅ Stakeholders notified 24 hours in advance

### Deployment Announcement

```
📢 Maintenance Window: [start] - [end] UTC
   - Expected downtime: < 5 minutes
   - Changes: [list]
   - Impact: [None / Read-only / Full unavability]
   - Monitoring: [link to dashboard]
```

---

## Emergency Contacts

| Role | Name | Contact | Availability |
|---|---|---|---|
| SRE Lead | [name] | [phone/email] | Always on-call |
| CTO | [name] | [phone/email] | On-call during business hours |
| DBA | [name] | [phone/email] | On-call for schema changes |

---

## Sign-Off

- [ ] Pre-deployment checklist completed
- [ ] Tests passing
- [ ] Backup verified
- [ ] Team ready
- [ ] Deployment complete
- [ ] Smoke tests passing
- [ ] Monitoring stable
- [ ] Stakeholders notified

**Deployed by:** _______________  
**Date/Time:** _______________  
**Version:** _______________  
**Notes:** ____________________________________________________

---
