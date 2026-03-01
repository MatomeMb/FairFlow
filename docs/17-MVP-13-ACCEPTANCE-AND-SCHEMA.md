# MVP-13 Acceptance and Schema

IndexedDB cache design for lens extension. Status: Complete.

---

## Schema

- Store: resolve
- Key: hash (64-char hex)
- Value: { gist, thing_url, image_url?, checkout_url?, fetchedAt }

---

## Acceptance Criteria

- Cache-first reads
- 24h TTL
- Cross-browser (Chrome, Edge, Brave, Firefox)
