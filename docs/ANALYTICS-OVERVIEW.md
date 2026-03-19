# Analytics Overview

**fairflow Analytics Pipeline (MVP-14)**

The analytics system tracks user interactions across the platform: product views, clicks, and purchases. This data powers merchant dashboards, platform metrics, and strategic insights.

## Events Tracked

### Event Types

| Event | When Fired | User | Payload |
|-------|-----------|------|---------|
| **view** | Product page loads | Consumer (anonymous) | product hash, referrer URL, timestamp |
| **click** | Consumer clicks "Buy Now" | Consumer (anonymous) | product hash, referer URL, click timestamp |
| **purchase** | Order completed (payment success) | Consumer (anonymous) | product hash, merchant ID, order ID, amount, currency, timestamp |

### Event Schema

All events follow this structure:

```json
{
  "event": "view|click|purchase",
  "hash": "sha256-product-hash",
  "merchant_id": "uuid (optional, only for purchase)",
  "anon_id": "uuid (anonymous customer identifier)",
  "source_url": "https://referring-page.com (optional)",
  "order_id": "uuid (optional, only for purchase)",
  "amount_cents": 2500,
  "currency": "ZAR",
  "timestamp": "2026-03-19T12:34:56.789Z"
}
```

## Storage

### Format: JSONL (JSON Lines)

Events are stored as newline-delimited JSON files, one event per line:

```
{"event":"view","hash":"abc123","anon_id":"user-1","timestamp":"2026-03-19T12:00:00.000Z"}
{"event":"click","hash":"abc123","anon_id":"user-1","timestamp":"2026-03-19T12:01:00.000Z"}
{"event":"purchase","hash":"abc123","merchant_id":"m-1","order_id":"o-1","amount_cents":2500,"currency":"ZAR","timestamp":"2026-03-19T12:02:00.000Z"}
```

### File Organization

```
data/
└── events/
    ├── 2026-03-19.jsonl      — All events for March 19, 2026
    ├── 2026-03-18.jsonl      — All events for March 18, 2026
    └── ...
```

**Partitioning:** Daily files, UTC timezone. Each file contains events from 00:00:00 to 23:59:59 UTC on that date.

## Retention Policy

Events are automatically archived and deleted based on `RETENTION_DAYS` environment variable:

- **Default:** 90 days
- **Rolling window:** Oldest events deleted automatically
- **Archival:** (Optional) Events older than 30 days can be archived to cold storage before deletion

Configuration:

```env
RETENTION_DAYS=90  # Keep 90 days of event data
```

## API Endpoints

### Ingestion: Track Events

**Endpoint:** `POST /v1/analytics/event`  
**Auth:** None (public)  
**Rate Limit:** 100 requests/minute per IP

**Request Body:**

```json
{
  "event": "view",
  "hash": "product-hash",
  "anon_id": "anonymous-user-id",
  "source_url": "https://referrer.com",
  "timestamp": "2026-03-19T12:34:56.000Z"
}
```

**Response:** 200 OK

```json
{
  "ok": true,
  "message": "Event recorded"
}
```

**Error Response:** 400 Bad Request

```json
{
  "code": "invalid_request",
  "message": "Missing required field",
  "details": { "missing": ["hash"] }
}
```

### Reporting: Get Aggregated Report

**Endpoint:** `GET /v1/analytics/report`  
**Auth:** Merchant JWT (Bearer token)  
**Rate Limit:** 30 requests/minute

**Query Parameters:**

```
?from=2026-03-01&to=2026-03-19&groupBy=day&event=view,click
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | ISO 8601 date | Start date (inclusive) |
| `to` | ISO 8601 date | End date (inclusive) |
| `event` | Enum | Comma-separated: `view`, `click`, `purchase` |
| `groupBy` | Enum | Aggregation granularity: `day`, `week`, `month` |

**Response:** 200 OK

```json
{
  "report": {
    "period": {
      "from": "2026-03-01",
      "to": "2026-03-19",
      "groupBy": "day"
    },
    "data": [
      {
        "date": "2026-03-19",
        "events": {
          "view": 1250,
          "click": 87,
          "purchase": 12
        },
        "revenue_cents": 300000,
        "currency": "ZAR",
        "unique_customers": 93,
        "avg_order_value_cents": 25000
      },
      {
        "date": "2026-03-18",
        "events": {
          "view": 980,
          "click": 65,
          "purchase": 8
        },
        "revenue_cents": 200000,
        "currency": "ZAR",
        "unique_customers": 71,
        "avg_order_value_cents": 25000
      }
    ],
    "summary": {
      "total_views": 23450,
      "total_clicks": 1632,
      "total_purchases": 156,
      "click_through_rate": 0.070,
      "conversion_rate": 0.0094,
      "total_revenue_cents": 3900000,
      "unique_customers": 1249
    }
  }
}
```

### Dashboard: Internal Metrics

**Endpoint:** `GET /v1/analytics/dashboard`  
**Auth:** Admin Secret  
**Response:** HTML page with embedded charts and metrics

Returns an interactive HTML dashboard showing:
- Real-time event counts
- Platform-wide metrics (GMV, order count, active merchants)
- Top products by views, clicks, revenue
- Merchant leaderboard
- Time series charts

## Querying Analytics

### Via API (Merchant)

```bash
# Get last 30 days of analytics for this merchant
curl "http://localhost:3000/v1/analytics/report?from=2026-02-18&to=2026-03-19&groupBy=day" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Via Dashboard (Admin)

Visit `https://api.fairflow.co.za/v1/analytics/dashboard` (requires admin secret in auth header):

```bash
curl "https://api.fairflow.co.za/v1/analytics/dashboard" \
  -H "Authorization: your-admin-secret-key"
```

### Raw Event Access (Advanced)

For analysis beyond standard reports, you can access raw JSONL files:

```bash
# Local development
cat data/events/2026-03-19.jsonl | jq 'select(.event=="purchase")'
```

## Data Privacy & Compliance

### Anonymous Tracking

- Events use `anon_id` (UUID) instead of identifying information
- No PII is stored in event data
- Email addresses and customer details are **never** logged in analytics
- POPIA-compliant: Customers are not personally identifiable

### Data Retention

- Events older than 90 days are automatically deleted (configurable)
- No backup retention beyond the rolling window
- Deletion is permanent

### Audit Logging

Admin actions (KYC approval, payout release) are logged separately in `payout_logs.json` for:
- Compliance audits
- Dispute resolution
- Financial reconciliation

## Common Use Cases

### Merchant Dashboard

Merchants view their analytics at `/dashboard/merchant`:

```
Merchant sees:
- Products sorted by views and clicks
- Daily revenue trend
- Conversion rate (clicks → purchases)
- Customer count
- Average order value
```

This data is powered by `/v1/analytics/report` calls with date ranges and filtering.

### Platform Growth Metrics

CEO Dashboard (CTO Monitor) shows:

```
Platform metrics:
- Total GMV (gross merchandise value)
- Total orders processed
- Active merchant count
- Platform conversion rate
- Top 10 products
```

This is aggregated from all metrics across all merchants.

### Product Optimization

Merchants can identify top-performing and underperforming products:

```
Questions answered by analytics:
- Which products get the most views?
- Which products convert best (clicks → purchases)?
- What's the average time from view to purchase?
- Are there seasonal trends?
```

## Implementation Details

### Event Flow

1. **Ingestion** → Event sent to `/v1/analytics/event`
2. **Validation** → Schema validation with Zod
3. **Storage** → Appended to daily JSONL file
4. **Aggregation** → Nightly job computes summary metrics (optional)
5. **Reporting** → Merchant requests report; JSONL is read and aggregated in-memory

### Performance

- **Ingestion latency:** < 50ms (file append)
- **Reporting latency:** < 500ms for typical date ranges (< 100K events)
- **Storage overhead:** ~800 bytes per event (before compression)

### Scalability

For higher volumes (> 1M events/day):
1. Use Cloudflare R2 instead of local files
2. Implement batch aggregation jobs
3. Cache common report queries
4. Consider moving to a proper time-series database (InfluxDB, TimescaleDB)

## Troubleshooting

### Events not appearing in reports

1. **Check raw files:**
   ```bash
   # Does the event file exist?
   ls -la data/events/2026-03-19.jsonl
   
   # Is the event in the file?
   grep "your-product-hash" data/events/2026-03-19.jsonl
   ```

2. **Verify timestamp:**
   - Ensure event timestamp is within the query date range
   - Check timezone of timestamp (should be UTC)

3. **Check merchant authorization:**
   - Merchant can only see events for their own products
   - Verify JWT token has correct merchant_id

### Dashboard shows no data

1. **Verify admin secret:** `Authorization: your-admin-secret-key` header must match `ADMIN_SECRET_KEY`
2. **Check dates:** Dashboard defaults to last 30 days; expand date range if no recent data
3. **Review logs:** Check server logs for aggregation job errors

## Configuration

### Environment Variables

```env
# Analytics storage location
ANALYTICS_EVENTS_DIR=./data/events

# Data retention period (days)
RETENTION_DAYS=90

# Optional: Archive old events instead of deleting
ANALYTICS_ARCHIVE_DIR=./data/archive

# Optional: Enable nightly aggregation job
ANALYTICS_AGGREGATION_ENABLED=true
```

## Data Backup & Recovery

**Backup strategy:**
- Daily JSONL files are immutable after creation
- Back up entire `data/events/` directory nightly
- Test restore procedure monthly

**If data is lost:**
1. Restore from backup
2. Restart analytics aggregation
3. Merchants can view reports again

## Future Enhancements

Planned improvements for Analytics:

- [ ] Real-time dashboard updates (WebSocket)
- [ ] Cohort analysis (customer segments)
- [ ] Funnel analysis (view → click → purchase conversion)
- [ ] A/B testing support
- [ ] Price optimization recommendations
- [ ] Predictive analytics (forecast demand)
- [ ] Integration with third-party BI tools (Tableau, Looker)
