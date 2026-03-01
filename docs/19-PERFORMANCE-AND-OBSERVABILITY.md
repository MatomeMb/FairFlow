# Performance & Observability Guide

**Monitoring, profiling, and optimization guidelines for fairflow production systems.**

---

## Performance Targets

### API Response Times (p95)

| Endpoint | Current | Target | Critical |
|----------|---------|--------|----------|
| `GET /health` | 5ms | < 10ms | < 20ms |
| `GET /resolve/:hash` | 25ms | < 50ms | < 100ms |
| `POST /compile` | 60ms | < 100ms | < 200ms |
| `POST /batch` (100 items) | 300ms | < 500ms | < 1000ms |
| `GET /v1/analytics/report` | 400ms | < 500ms | < 1000ms |
| `POST /v1/auth/merchant/login` | 150ms | < 200ms | < 500ms |

**Measurement:**
```bash
npm run load-test              # Generates latency histogram
curl http://localhost:3000/v1/analytics/dashboard  # Check recent p95
```

### Memory Usage

| Component | Target | Warning | Critical |
|-----------|--------|---------|----------|
| Node.js process | < 256MB | > 400MB | > 512MB |
| Rate limit map | < 10MB | > 50MB | > 100MB |
| Query cache | < 50MB | > 200MB | > 300MB |

**Check:**
```bash
ps aux | grep node  # RSS column shows memory
curl http://localhost:3000/v1/analytics/dashboard  # Shows memory breakdown
```

### Cache Hit Rates

| Cache | Target | Warning |
|-------|--------|---------|
| Query cache (analytics) | > 80% | < 50% |
| Product metadata | > 75% | < 40% |
| JSON parse memoization | > 90% | < 70% |

---

## Observability Dashboard

**Access:** `GET /v1/analytics/dashboard` (returns HTML)

### Key Metrics Displayed

1. **Query Performance**
   - Last 100 queries (latency, error status)
   - Histogram of latency distribution
   - Slow query threshold (>1000ms) alerts

2. **Error Tracking**
   - Last 24 hours error rate
   - Error rate alert threshold (5%)
   - Error categories breakdown

3. **System Health**
   - Memory usage (current / peak)
   - Request rate (req/sec)
   - Cache stats (hits, misses, ratio)
   - Storage quota usage

4. **Pre-Aggregation Status**
   - Last aggregation time
   - Aggregates count
   - Pending days to aggregate

### Dashboard Interpretation

**Green (Healthy):**
- Error rate < 1%  
- p95 latency < 500ms
- Memory < 256MB
- Cache hit rate > 80%

**Yellow (Watch):**
- Error rate 1-5%
- p95 latency 500-1000ms
- Memory 256-400MB
- Cache hit rate 50-80%

**Red (Alert):**
- Error rate > 5%
- p95 latency > 1000ms
- Memory > 400MB
- Cache hit rate < 50%

---

## Logging & Log Aggregation

### Log Format

All logs are structured JSON:
```json
{
  "level": "info",
  "ts": "2026-03-02T10:30:45.123Z",
  "service": "shadow-index",
  "msg": "Product compiled",
  "hash": "abc123...",
  "merchant_id": "merchant-001",
  "durationMs": 42
}
```

### Log Levels

| Level | When Used | Volume | Examples |
|-------|-----------|--------|----------|
| `debug` | Development | High | "Cache hit", "SQL query", "Request parsed" |
| `info` | Normal operations | Medium | "Product compiled", "Auth successful", "Report generated" |
| `warn` | Recovering issues | Low | "Retry attempt", "Slow query", "Rate limit approached" |
| `error` | Problems requiring action | Very Low | "Payment failed", "Database error", "Quota exceeded" |

**Control verbosity:**
```bash
LOG_LEVEL=debug npm run dev   # Verbose for development
LOG_LEVEL=error npm start      # Minimal logging in production
```

### Critical Event Alerts

**Must alert immediately if seen:**

```
ERROR: [payment] Stripe webhook failed
ERROR: [database] Connection pool exhausted
ERROR: [storage] Quota exceeded
WARN: [rate-limit] Sustained attacks from IP xxx
WARN: [cache] Hit rate dropped below 50%
```

---

## Profiling for Performance Issues

### Memory Leak Detection

```bash
# 1. Capture heap snapshot
node --expose-gc api/index.js &
PID=$!

# 2. Make requests to generate load
for i in {1..1000}; do curl http://localhost:3000/health; done

# 3. Take snapshot and analyze
node -e "
  require('inspector').open(9229, 'localhost', false);
  console.log('Debugger ready. Visit chrome://inspect/');
" &
```

### Identifying Slow Queries

**Check dashboard latency for > 1000ms queries:**

```bash
# From logs, extract slow queries
grep '"durationMs":[0-9]{4}' shadow-index.log | \
  jq 'select(.durationMs > 1000)'

# Common slow operations:
# - Analytics report on large date ranges
# - Product batch compile (100+ items)
# - Index rebuild operations
```

**Optimization strategies:**
- Add pre-aggregation for analytics
- Implement query caching
- Batch operations limiting
- Connection pooling for database operations

### CPU Usage Spikes

**If CPU > 80%:**

```bash
# Identify hot functions
node --prof api/index.js &

# Generate load
npm run load-test

# Analyze with flame graphs
node --prof-process isolate-*.log > processed.txt
```

---

## Scaling Considerations

### Horizontal Scaling

**Current Limitations (Single Instance):**
- In-memory rate limiting (won't work across instances)
- JWT secret stored locally (must be shared)
- File-based storage (requires shared filesystem or S3/R2)

**To scale horizontally:**

1. **Distributed Rate Limiting**
   ```typescript
   // Replace in-memory Map with Redis
   import Redis from 'redis';
   const redis = Redis.createClient();
   
   // Check rate limit against Redis
   const count = await redis.incr(`ratelimit:${ip}`);
   ```

2. **Database Migration**
   - Replace JSON file storage with PostgreSQL
   - Merchant accounts → Users table
   - Orders → Orders table
   - Products → Products table

3. **Caching Layer**
   - Cache queries in Redis
   - Invalidate cache on updates
   - Set TTL based on freshness requirements

### Vertical Scaling

**Resource Limits to Adjust:**
```bash
# Node.js max memory
NODE_OPTIONS="--max-old-space-size=512" npm start

# Connection limits
MAX_CONNECTIONS=1000

# File descriptor limits
ulimit -n 65536
```

---

## Monitoring Alerts

### Alert Configuration

Set up alerts via your monitoring system (Datadog, New Relic, Prometheus, etc.):

| Alert | Condition | Action |
|-------|-----------|--------|
| High Error Rate | > 5% in 5 min | Page on-call engineer |
| Slow Queries | p95 > 1000ms | Investigate query patterns |
| High Memory | > 400MB sustained | Restart or scale |
| Rate Limit Abuse | > 1000 429s/min from single IP | Block IP, investigate |
| Payment Failures | > 1% in 1 hour | Page payments team |
| Quota Exceeded | Storage > 90% | Alert ops, plan archival |

### Health Check Endpoint

**All instances expose:**
```bash
GET /health

Response (200):
{
  "status": "ok",
  "service": "shadow-index",
  "version": "0.6.0",
  "timestamp": "2026-03-02T10:30:45.123Z"
}
```

**Use in Kubernetes/ECS health checks:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3
```

---

## Performance Optimization Checklist

- [ ] Query caching enabled (analytics reports)
- [ ] Pre-aggregation running (large datasets)
- [ ] Compression enabled (responses > 1KB)
- [ ] Connection pooling configured (if database)
- [ ] File descriptors increased (if high concurrency)
- [ ] Memory limits set appropriately
- [ ] Rate limiting active
- [ ] Error logging <1% of requests
- [ ] P95 latency < 500ms for all endpoints
- [ ] Cache hit rate > 80% for frequently accessed data

---

## Tools & Resources

**Performance Testing:**
- `npm run load-test` — Sustained load test (generates latency data)
- `npm run pre-aggregate` — Pre-aggregate analytics (performance impact)

**Monitoring:**
- `curl /v1/analytics/dashboard` — Real-time HTML dashboard
- `curl /health` — Health check endpoint
- `tail -f shadow-index.log` — Live log stream

**Native Node.js Tools:**
- `--expose-gc` flag — Force garbage collection for profiling
- `--prof` flag — Generate CPU profile
- `inspect` module — Remote debugging via Chrome DevTools

---
