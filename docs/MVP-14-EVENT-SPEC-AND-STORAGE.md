# MVP-14 Event Spec & Storage Decision — Sprint 3 Day 1

**Date:** February 20, 2026  
**Author:** CTO / Lead Engineer  
**Status:** Draft for Sprint 3 kickoff

---

## 1. Draft Event Spec (JSON Schema)

### 1.1 View Events

Fired when a `matter://` overlay is shown to the user.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | string | yes | `"view"` |
| `hash` | string | yes | 64-char SHA-256 hex (the thing hash) |
| `timestamp` | string | yes | ISO 8601 (e.g. `2026-02-20T10:15:00.000Z`) |
| `source_url` | string | yes | URL where the matter:// interaction initiated (e.g. `https://example.com/page`) |

**Example:**
```json
{
  "event": "view",
  "hash": "bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96",
  "timestamp": "2026-02-20T10:15:00.000Z",
  "source_url": "https://example.com/catalog"
}
```

### 1.2 Click Events

Fired when the user performs an action from the overlay (e.g. Buy Now, image expand).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | string | yes | `"click"` |
| `hash` | string | yes | 64-char SHA-256 hex |
| `timestamp` | string | yes | ISO 8601 |
| `source_url` | string | yes | URL where the matter:// interaction initiated |
| `target_action` | string | yes | Action performed, e.g. `checkout_initiated`, `image_expanded` |

**Allowed `target_action` values:**
- `checkout_initiated` — User clicked Buy Now / checkout link
- `image_expanded` — User expanded or interacted with the product image
- (extensible for future actions)

**Example:**
```json
{
  "event": "click",
  "hash": "bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96",
  "timestamp": "2026-02-20T10:16:00.000Z",
  "source_url": "https://example.com/catalog",
  "target_action": "checkout_initiated"
}
```

### 1.3 Design Constraints

- **Lightweight:** Events must be dispatchable from the extension background worker without impacting overlay render performance.
- **Fire-and-forget:** POST to API; no blocking on response.
- **No PII:** Hash and source_url only; no user ID, IP, or fingerprint in the event payload for analytics.

---

## 2. Storage Choice — Decision & Rationale

**Decision:** **API Logs (JSONL / Text)** as the initial persistence layer.

**Rationale:**

We choose file-based JSONL logging for the first implementation because:

1. **Speed to market:** We need a working conversion loop by Mar 5. JSONL append is trivial to implement in the Shadow Index API; no DB setup, migrations, or connection pooling.
2. **Low cost:** No additional service (Supabase, D1) or billing. Logs live alongside the API; rotation and retention can be handled in-process.
3. **Vercel compatibility:** Edge/serverless functions can write to writable temp storage or a mounted volume; we can defer deployment complexity by running the API on Node (Hono) where `fs.appendFile` is straightforward. If we later move to Vercel Edge, we will need a sync path (e.g. Supabase or R2) — but that is a "Day 2" concern.
4. **Aggregation is acceptable:** A separate aggregation job (cron or on-demand) can scan JSONL files by date range and produce daily counts. This is sufficient for proving conversion and powering a minimal merchant report. Once we have 1,000+ gists and need real-time dashboards, we can migrate to Supabase or another managed DB.

**Trade-offs accepted:**
- No real-time queryability; reports will be batch (e.g. nightly or on-demand).
- File rotation and retention must be implemented (e.g. one file per day, 90-day retention).
- Supabase and SQLite/D1 remain in the backlog for scale-out.

**Next step:** Implement `POST /v1/analytics/event` to validate payload and append to a daily JSONL file (e.g. `data/events/YYYY-MM-DD.jsonl`). Unblock Day 2 implementation.

---

## 3. Schema Validation (Zod)

For reference, the ingestion endpoint will validate with:

```typescript
const ViewEventSchema = z.object({
  event: z.literal('view'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime(),
  source_url: z.string().url(),
});

const ClickEventSchema = z.object({
  event: z.literal('click'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime(),
  source_url: z.string().url(),
  target_action: z.enum(['checkout_initiated', 'image_expanded']),
});

const EventSchema = z.discriminatedUnion('event', [
  ViewEventSchema,
  ClickEventSchema,
]);
```

---

*Sprint 3 Day 1 deliverable. Ready for implementation starting Feb 21.*
