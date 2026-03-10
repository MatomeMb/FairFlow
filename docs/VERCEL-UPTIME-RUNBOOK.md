# Vercel Uptime Runbook (Shadow Index)

Operational runbook to keep backend uptime visible and reduce incident recovery time.

---

## 1) Monitors to Configure

Set up three HTTP monitors against production:

| Monitor | URL | Interval | Expected |
|---------|-----|----------|----------|
| Primary liveness | `https://<api-domain>/health` | 60s | `200` + JSON `status: ok|degraded` |
| Function probe | `https://<api-domain>/healthz` | 60s | `200` + JSON `status: ok` |
| Root sanity | `https://<api-domain>/` | 5m | `200` + JSON `service: shadow-index` |

Recommended providers: Better Stack, UptimeRobot, Pingdom, or Datadog Synthetics.

---

## 2) Alert Policy

Minimum production alerting policy:

- **Trigger:** 2 consecutive failures on `/health` or `/healthz`
- **Trigger:** p95 latency above 4s for 5 minutes
- **Severity P1:** both `/health` and `/healthz` failing
- **Severity P2:** one endpoint failing while the other passes

Notify at least two channels:

1. Engineering email
2. Real-time pager channel (Slack/Teams/WhatsApp group)

---

## 3) Post-Deploy Gate (Required)

After each production deploy, run:

```bash
cd packages/shadow-index
npm run smoke:prod -- https://<api-domain>
```

Deployment is accepted only if smoke check returns:

- `[smoke] PASSED: 4/4 checks passed.`

---

## 4) Incident Triage Flow (Timeout/404)

1. Confirm new deploy URL is being tested (avoid stale URLs).
2. Check `/healthz`:
   - fails -> function/runtime problem
   - passes -> route/app problem
3. Check `/health` response body:
   - storage unavailable -> inspect data path/env/storage mode
   - degraded -> inspect dependency configuration
4. Review Vercel function logs for latest deployment.
5. Roll forward with small fix; avoid large mixed changes during incident.

---

## 5) Weekly Reliability Review

Every week, capture:

- uptime percentage
- alert count by severity
- top 3 latency spikes
- mean time to recovery (MTTR)

Use this data to tune thresholds and eliminate noisy alerts.
