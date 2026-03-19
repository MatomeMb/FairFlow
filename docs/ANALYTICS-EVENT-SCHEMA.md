# Analytics Event Schema

**Detailed Specification of Event Payloads and Storage Format**

This document defines the exact structure of each event type, required fields, optional fields, data types, and storage format.

## Event Payload Structure

### View Event

Fired when a consumer loads a product page.

```json
{
  "event": "view",
  "hash": "string (sha256 hash of product name)",
  "anon_id": "string (UUID v4, consumer anonymous identifier)",
  "source_url": "string (optional, referring page URL)",
  "timestamp": "string (ISO 8601, UTC)",
  "merchant_id": null,
  "order_id": null,
  "amount_cents": null,
  "currency": null
}
```

**Field Specifications:**

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `event` | string | ✓ | Enum: "view" | "view" |
| `hash` | string | ✓ | SHA256 hex string, 64 chars | "5d41402abc4b2a76b9719d911017c592" |
| `anon_id` | string | ✓ | UUID v4 | "550e8400-e29b-41d4-a716-446655440000" |
| `source_url` | string | (optional) | Valid HTTP(S) URL or null | "https://twitter.com/share" |
| `timestamp` | string | ✓ | ISO 8601 UTC, format: YYYY-MM-DDTHH:mm:ss.sssZ | "2026-03-19T14:30:45.123Z" |
| `merchant_id` | null | — | Must be null for view events | null |
| `order_id` | null | — | Must be null for view events | null |
| `amount_cents` | null | — | Must be null for view events | null |
| `currency` | null | — | Must be null for view events | null |

**Example:**

```json
{
  "event": "view",
  "hash": "abc123def456abc123def456abc123de",
  "anon_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "source_url": "https://twitter.com/fairflow_za",
  "timestamp": "2026-03-19T14:30:45.123Z",
  "merchant_id": null,
  "order_id": null,
  "amount_cents": null,
  "currency": null
}
```

### Click Event

Fired when a consumer clicks the "Buy Now" button on a product page.

```json
{
  "event": "click",
  "hash": "string (sha256 hash of product name)",
  "anon_id": "string (UUID v4, consumer anonymous identifier)",
  "source_url": "string (optional, product page URL)",
  "timestamp": "string (ISO 8601, UTC)",
  "merchant_id": null,
  "order_id": null,
  "amount_cents": null,
  "currency": null
}
```

**Field Specifications:**

Same as View Event above. The distinction is the `event` field value.

**Example:**

```json
{
  "event": "click",
  "hash": "abc123def456abc123def456abc123de",
  "anon_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "source_url": "https://shop.fairflow.co.za/product/abc123",
  "timestamp": "2026-03-19T14:31:22.456Z",
  "merchant_id": null,
  "order_id": null,
  "amount_cents": null,
  "currency": null
}
```

### Purchase Event

Fired when a consumer successfully completes payment for an order.

```json
{
  "event": "purchase",
  "hash": "string (sha256 hash of product name)",
  "anon_id": "string (UUID v4, consumer anonymous identifier)",
  "merchant_id": "string (UUID v4, merchant identifier)",
  "order_id": "string (UUID v4, order record ID)",
  "amount_cents": "number (integer, transaction amount in cents)",
  "currency": "string (ISO 4217 currency code)",
  "timestamp": "string (ISO 8601, UTC)",
  "source_url": null
}
```

**Field Specifications:**

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `event` | string | ✓ | Enum: "purchase" | "purchase" |
| `hash` | string | ✓ | SHA256 hex string, 64 chars | "5d41402abc4b2a76b9719d911017c592" |
| `anon_id` | string | ✓ | UUID v4 | "550e8400-e29b-41d4-a716-446655440000" |
| `merchant_id` | string | ✓ | UUID v4 format | "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" |
| `order_id` | string | ✓ | UUID v4 format | "f47ac10b-58cc-4372-a567-0e02b2c3d479" |
| `amount_cents` | number | ✓ | Integer, >= 0 | 250000 |
| `currency` | string | ✓ | ISO 4217 code, uppercase | "ZAR" |
| `timestamp` | string | ✓ | ISO 8601 UTC | "2026-03-19T14:35:10.789Z" |
| `source_url` | null | — | Must be null for purchase events | null |

**Example:**

```json
{
  "event": "purchase",
  "hash": "abc123def456abc123def456abc123de",
  "anon_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "merchant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "order_id": "12345678-1234-1234-1234-123456789012",
  "amount_cents": 250000,
  "currency": "ZAR",
  "timestamp": "2026-03-19T14:35:10.789Z",
  "source_url": null
}
```

## Event Validation Rules

### Field Constraints

**`event` field:**
- Allowed values: "view", "click", "purchase" (case-sensitive)
- No whitespace, exactly one per event

**`hash` field:**
- Must be valid SHA256 hex digest (64 lowercase hex characters)
- Cannot be empty or null
- Should match the product identifier being tracked

**`anon_id` field:**
- Must be a valid UUID v4
- Cannot be null or empty
- Must be consistent for same consumer (browser cookie or session-based)

**`merchant_id` field:**
- For "view" and "click": must be null
- For "purchase": must be valid UUID v4, non-null
- Identifies which merchant owns the product

**`order_id` field:**
- For "view" and "click": must be null
- For "purchase": must be valid UUID v4, non-null
- Unique identifier for the transaction

**`amount_cents` field:**
- For "view" and "click": must be null
- For "purchase": must be integer >= 0
- Represents total transaction value in cents (e.g., 250000 = R2500.00)

**`currency` field:**
- For "view" and "click": must be null
- For "purchase": must be valid ISO 4217 code (e.g., "ZAR", "USD", "GBP")
- Uppercase only

**`timestamp` field:**
- Must be valid ISO 8601 date-time in UTC timezone
- Format: YYYY-MM-DDTHH:mm:ss.sssZ (millisecond precision required)
- Must be within reasonable bounds (not in future, not before product creation)

**`source_url` field:**
- Optional for "view" and "click" (can be null or string)
- Must be valid HTTP(S) URL if provided
- For "purchase": must be null
- Used to track referrer and traffic source

## Storage Format: JSONL (JSON Lines)

### File Structure

Events are stored in daily JSONL files in the `data/events/` directory:

```
data/events/
├── 2026-03-19.jsonl
├── 2026-03-18.jsonl
├── 2026-03-17.jsonl
└── ...
```

### JSONL Format Rules

1. **One event per line:** Each line is a complete, valid JSON object
2. **No pretty-printing:** Events are newline-delimited, not indented
3. **Newline separator:** Events are separated by `\n` (LF, not CRLF)
4. **No trailing newlines:** File ends immediately after last event's newline
5. **All events valid:** Every line must be parseable as valid JSON

**Example file content (`2026-03-19.jsonl`):**

```
{"event":"view","hash":"abc123def456","anon_id":"f47ac10b-58cc-4372-a567-0e02b2c3d479","source_url":"https://twitter.com/fairflow_za","timestamp":"2026-03-19T14:30:45.123Z","merchant_id":null,"order_id":null,"amount_cents":null,"currency":null}
{"event":"click","hash":"abc123def456","anon_id":"f47ac10b-58cc-4372-a567-0e02b2c3d479","source_url":"https://shop.fairflow.co.za/product/abc123","timestamp":"2026-03-19T14:31:22.456Z","merchant_id":null,"order_id":null,"amount_cents":null,"currency":null}
{"event":"purchase","hash":"abc123def456","anon_id":"f47ac10b-58cc-4372-a567-0e02b2c3d479","merchant_id":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","order_id":"12345678-1234-1234-1234-123456789012","amount_cents":250000,"currency":"ZAR","timestamp":"2026-03-19T14:35:10.789Z","source_url":null}
```

### Appending Events

When appending a new event, ensure:
1. Event is valid JSON (no stray characters)
2. Previous last line has a newline character
3. New event is appended with `\n` at the end
4. File remains valid JSONL throughout

**Node.js example:**

```javascript
const fs = require('fs');
const path = require('path');

function appendEvent(event) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filepath = path.join('data/events', `${today}.jsonl`);
  
  // Validate event structure
  if (!event.event || !['view', 'click', 'purchase'].includes(event.event)) {
    throw new Error('Invalid event type');
  }
  
  // Append to file
  const line = JSON.stringify(event) + '\n';
  fs.appendFileSync(filepath, line, 'utf8');
}
```

## Date Partitioning

### File Naming Convention

Files are named by UTC date: `YYYY-MM-DD.jsonl`

| File | Date Range | Timezone |
|------|------------|----------|
| `2026-03-19.jsonl` | 2026-03-19T00:00:00Z to 2026-03-19T23:59:59Z | UTC |
| `2026-03-20.jsonl` | 2026-03-20T00:00:00Z to 2026-03-20T23:59:59Z | UTC |

### Timezone Handling

- All timestamps in events are UTC (ISO 8601 format with Z suffix)
- File partitioning is based on UTC date, not local time zone
- No events should have ambiguous timezone information

**Routing example:**

```javascript
function getEventFile(timestamp) {
  // timestamp is ISO 8601 string like "2026-03-19T14:30:45.123Z"
  const date = timestamp.split('T')[0]; // Extract YYYY-MM-DD
  return `data/events/${date}.jsonl`;
}
```

## Data Types and Serialization

### JSON Serialization Rules

Events are serialized to JSON using standard JSON rules:

| Type | JSON Representation | Example |
|------|-------------------|---------|
| string | Quoted text | "abc123def456" |
| number | Numeric (no quotes) | 250000 |
| null | Unquoted null | null |
| boolean | unquoted true/false | true (if ever used) |

### Field Type Reference

```typescript
// TypeScript definition of event payload
export interface AnalyticsEvent {
  // All events
  event: 'view' | 'click' | 'purchase';
  hash: string;                    // sha256 hex
  anon_id: string;                 // uuid v4
  timestamp: string;               // iso8601 utc
  
  // View/Click only
  source_url?: string | null;
  
  // View/Click: nulls
  merchant_id: null;
  order_id: null;
  amount_cents: null;
  currency: null;
  
  // Purchase events
  merchant_id?: string;            // uuid v4 (required for purchase)
  order_id?: string;               // uuid v4 (required for purchase)
  amount_cents?: number;           // integer >= 0 (required for purchase)
  currency?: string;               // iso4217 (required for purchase)
}
```

## Null vs. Omitted Fields

### Storage Policy

Fields that are not applicable to an event type are stored as **explicit `null`**, not omitted:

```json
// view events include merchant_id, order_id, etc. as null
{"event":"view","hash":"...","anon_id":"...","source_url":"...","timestamp":"...","merchant_id":null,"order_id":null,"amount_cents":null,"currency":null}

// purchase events include source_url as null
{"event":"purchase","hash":"...","anon_id":"...","merchant_id":"...","order_id":"...","amount_cents":2500,"currency":"ZAR","timestamp":"...","source_url":null}
```

### Rationale

- Explicit nulls make file structure consistent across all events
- Downstream parsers/aggregators always know what fields exist
- Easier to validate completeness (missing fields vs. null fields are different errors)

## Example Events - Real Scenarios

### Scenario 1: Product View Flow

University student views a phone case product via Twitter link:

```json
{"event":"view","hash":"7ae6b4c5e8c9d1f3a5b7c9e1f3a5b7c9","anon_id":"550e8400-e29b-41d4-a716-446655440001","source_url":"https://twitter.com/fairflow_za/status/123456","timestamp":"2026-03-19T08:15:30.000Z","merchant_id":null,"order_id":null,"amount_cents":null,"currency":null}
```

### Scenario 2: Purchase Completion

Same student clicks Buy Now, completes payment via PayStack:

```json
{"event":"click","hash":"7ae6b4c5e8c9d1f3a5b7c9e1f3a5b7c9","anon_id":"550e8400-e29b-41d4-a716-446655440001","source_url":"https://fairflow.co.za/product/7ae6b4c5e8c9d1f3a5b7c9e1f3a5b7c9","timestamp":"2026-03-19T08:16:05.000Z","merchant_id":null,"order_id":null,"amount_cents":null,"currency":null}
{"event":"purchase","hash":"7ae6b4c5e8c9d1f3a5b7c9e1f3a5b7c9","anon_id":"550e8400-e29b-41d4-a716-446655440001","merchant_id":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","order_id":"f47ac10b-58cc-4372-a567-0e02b2c3d479","amount_cents":19999,"currency":"ZAR","timestamp":"2026-03-19T08:17:45.123Z","source_url":null}
```

### Scenario 3: Direct Link (No Referrer)

Customer visits product page without referrer (direct link or mobile app):

```json
{"event":"view","hash":"1234567890abcdef1234567890abcdef","anon_id":"660f8501-f39c-42d5-b917-557766550002","source_url":null,"timestamp":"2026-03-19T10:22:15.000Z","merchant_id":null,"order_id":null,"amount_cents":null,"currency":null}
```

## Backward Compatibility

### Schema Evolution

Current schema version: **v1.0**

If schema changes in the future:
1. Add optional new fields to JSON (don't break old readers)
2. Consider versioning events with a `schema_version` field
3. Run migration scripts to backfill old events
4. Update this document to reflect new version

**Never remove required fields or change field types.**

## Validation Tools

### Python - Event Validation

```python
import json
from datetime import datetime
import uuid
import hashlib

def validate_event(event_str: str) -> bool:
    try:
        event = json.loads(event_str)
        
        # Check event type
        assert event['event'] in ['view', 'click', 'purchase']
        
        # Check common fields
        assert isinstance(event['hash'], str) and len(event['hash']) == 64
        assert isinstance(event['anon_id'], str)
        uuid.UUID(event['anon_id'])
        
        # Check timestamp
        dt = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
        
        # Check event-specific fields
        if event['event'] in ['view', 'click']:
            assert event['merchant_id'] is None
            assert event['order_id'] is None
            assert event['amount_cents'] is None
            assert event['currency'] is None
        elif event['event'] == 'purchase':
            assert isinstance(event['merchant_id'], str)
            uuid.UUID(event['merchant_id'])
            assert isinstance(event['order_id'], str)
            uuid.UUID(event['order_id'])
            assert isinstance(event['amount_cents'], int)
            assert isinstance(event['currency'], str)
            assert event['source_url'] is None
        
        return True
    except Exception as e:
        print(f"Validation failed: {e}")
        return False
```

### JavaScript - Event Validation

```javascript
function validateEvent(event) {
  if (!['view', 'click', 'purchase'].includes(event.event)) {
    throw new Error('Invalid event type');
  }
  
  // Validate hash (SHA256 hex)
  if (!/^[a-f0-9]{64}$/.test(event.hash)) {
    throw new Error('Invalid hash format');
  }
  
  // Validate UUID fields
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(event.anon_id)) {
    throw new Error('Invalid anon_id');
  }
  
  // Validate timestamp
  const timestamp = new Date(event.timestamp);
  if (isNaN(timestamp)) {
    throw new Error('Invalid timestamp');
  }
  
  // Event-specific validation
  if (['view', 'click'].includes(event.event)) {
    if (event.merchant_id !== null || event.order_id !== null) {
      throw new Error('View/Click events must have null merchant_id and order_id');
    }
  } else if (event.event === 'purchase') {
    if (!uuidRegex.test(event.merchant_id)) {
      throw new Error('Invalid merchant_id');
    }
    if (!uuidRegex.test(event.order_id)) {
      throw new Error('Invalid order_id');
    }
    if (typeof event.amount_cents !== 'number' || event.amount_cents < 0) {
      throw new Error('Invalid amount_cents');
    }
  }
  
  return true;
}
```

## Migration & Backfill Examples

### Reading Existing Events

```bash
# Count all events in a file
wc -l data/events/2026-03-19.jsonl

# Extract only purchase events
grep '"event":"purchase"' data/events/2026-03-19.jsonl

# Find purchases by specific merchant
grep '"merchant_id":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"' data/events/2026-03-19.jsonl

# Extract and sum revenue for a date
grep '"event":"purchase"' data/events/2026-03-19.jsonl | jq '.amount_cents' | awk '{sum+=$1} END {print sum/100 " ZAR"}'
```

### Fixing Corrupted Data

If a line is corrupted, it can be removed and the file remains valid:

```bash
# Remove invalid JSON lines
grep -v '<invalid-data>' data/events/2026-03-19.jsonl > data/events/2026-03-19.jsonl.tmp
mv data/events/2026-03-19.jsonl.tmp data/events/2026-03-19.jsonl
```

## Performance Notes

### Event Size

- Average event size: ~350-450 bytes (JSON serialized)
- With gzip compression: ~100-150 bytes per event
- Daily file (10K events): ~3.5 MB uncompressed, ~1 MB compressed

### Query Performance

- **Ingestion:** Append-only, O(1) per event
- **Reading:** Sequential scan, O(n) for n events in file
- **Aggregation:** O(n) scan + in-memory grouping
- **For millions of events:** Consider database (PostgreSQL + JSONB) or data warehouse

## See Also

- [Analytics Overview](ANALYTICS-OVERVIEW.md) — High-level overview, API endpoints, use cases
- [shadow-index README](../packages/shadow-index/README.md) — Implementation details, endpoints
- [MVP-14 Event Spec and Storage](MVP-14-EVENT-SPEC-AND-STORAGE.md) — Original specification
