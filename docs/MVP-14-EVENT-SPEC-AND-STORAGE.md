# MVP-14: Event Specification and Storage Strategy

**Date:** February 20, 2026  
**Subject:** Conversion Tracking (Analytics) for Matter Protocol  
**Owner:** Lead Engineer / CTO

---

## 1. Event Specification

To quantify the value of `matter://` distribution, we tracking two primary interaction points: **Discovery (View)** and **Intent (Click)**.

### 1.1 View Event
Triggered when the Lens extension successfully resolves a hash and displays the product overlay.

**Schema:**
```json
{
  "event": "view",
  "hash": "string (64-char SHA-256)",
  "timestamp": "ISO8601 String",
  "source_url": "string (URL where the interaction started)",
  "anon_id": "string (Short-lived anonymous browser seed)"
}
```

### 1.2 Click Event
Triggered when a user interacts with a call-to-action (CTA) within the overlay (e.g., "Buy Now").

**Schema:**
```json
{
  "event": "click",
  "hash": "string (64-char SHA-256)",
  "timestamp": "ISO8601 String",
  "source_url": "string (URL where the interaction started)",
  "target_action": "checkout_initiated | image_expanded | external_link",
  "anon_id": "string (Short-lived anonymous browser seed)"
}
```

### 1.3 Implementation Constraints
- **Lightweight:** Payload must be < 1KB.
- **Fire-and-Forget:** Extension should not wait for API confirmation (Navigator.sendBeacon or non-blocking fetch).
- **No PII:** No IP addresses, email addresses, or persistent user tracking. `anon_id` is for session de-duplication only.

### 1.4 Zod Validation (Shadow Index)
```typescript
const EventSchema = z.object({
  event: z.enum(['view', 'click']),
  hash: z.string().length(64),
  timestamp: z.string().datetime(),
  source_url: z.string().url(),
  target_action: z.enum(['checkout_initiated', 'image_expanded', 'external_link']).optional(),
  anon_id: z.string().max(32)
});
```

---

## 2. Storage Decision

**Choice:** API logs (JSONL / Append-only text files)

### 2.1 Rationale
- **Speed to Market:** Implementation is a simple `fs.appendFile` operation.
- **Low Cost:** No database hosting or connection pool management required for the MVP.
- **Node/Hono Fit:** Extremely efficient for non-blocking I/O.
- **Evolvability:** We can easily ingest these files into Supabase, BigQuery, or ClickHouse once volume justifies a real DB.

### 2.2 Logistics
- **Path:** `packages/shadow-index/data/events/YYYY-MM-DD.jsonl`
- **Format:** Each line is a valid JSON object.
- **Retention:** 90 days (Auto-purge via script or simple monthly archival).
- **Aggregation:** A daily background job (Sprint 3 Day 6) will process these files into summarizes counts per hash.
