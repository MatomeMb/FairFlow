# Rust Compiler — CTO Execution Guide

**Sprint 3 Part D** | **Owner:** CTO | **Status:** In progress

---

## 1. Objective

Implement `Compiler::compile()` in `packages/matter-core` so that:

- Product JSON → same SHA-256 hash as Shadow Index API → identical `.thing` semantics
- Enables CLI (`matter compile`), future WASM, and batch pipelines without depending on the Node API for hashing

**Acceptance criteria (Sprint 3 Plan §2.2):**

- [x] Compiler::compile() accepts product JSON string, returns .thing bytes
- [x] Hash algorithm matches API (stable key order, SHA-256 hex)
- [x] .thing format matches API (JSON; FlatBuffers deferred)
- [x] Unit tests: valid JSON → valid .thing; hash deterministic; validation errors
- [ ] Optional: CLI `matter compile <file.json>` writes `{hash}.thing`

---

## 2. Hash Algorithm (Must Match API)

**Reference:** `packages/shadow-index/api/index.ts` — `stableStringify`, `hashProduct`

- **Input to hash:** The product object only (no `created_at`). Keys: `checkout_url`, `currency`, `description`, `id`, `image_url`, `price`, `title` (only keys that are present).
- **Stable stringify:** Recursive. For objects: sort keys alphabetically (e.g. `a.localeCompare(b)`), then `key:value` for each. For arrays: `[elem,...]`. Primitives: JSON-style.
- **Hash:** SHA-256 of the UTF-8 stable string, output as lowercase hex (64 chars).

**Validation (must match API zod schema):**

- `title`: non-empty string
- `price`: non-negative integer
- `currency`: exactly 3 characters
- `description`, `image_url`, `checkout_url`, `id`: optional

---

## 3. .thing File Format

- **Content:** Single JSON object: `{ "hash": "<hex>", ...product, "created_at": "<ISO8601>" }`.
- **Serialization:** Pretty-printed JSON with 2-space indent (`JSON.stringify(payload, null, 2)`).
- **Filename:** `{hash}.thing` (e.g. for CLI).

---

## 4. Implementation Layout

| Component        | Location                    | Responsibility |
|-----------------|-----------------------------|----------------|
| Compiler core   | `src/compiler/mod.rs`       | Parse, validate, stable stringify, hash, build thing JSON |
| Stable stringify| Same (private)              | Recursive key-sorted serialization for hash input |
| CLI             | `src/bin/matter.rs`         | `compile <input.json>` → write `{hash}.thing`, print matter URI |
| Tests           | `src/compiler/mod.rs` #[cfg(test)] | Determinism, validation, cross-check with known API hash |

---

## 5. Cross-Validation With API

Use a fixed product JSON and a known hash from the API (e.g. from `POST /compile` response). Add a test that compiles the same JSON in Rust and asserts `hash == expected_hash`.

Example (from demo):  
Product `{"title":"Demo Product","price":14999,"currency":"USD","image_url":"...","checkout_url":"..."}`  
→ hash `45c2bee2699cf3bbf3cae468d27bad04a3bf516afa9cb3bd1235eaaa2c106495`

---

## 6. Commands

```bash
cd packages/matter-core
cargo test compiler
cargo build --release --bin matter
./target/release/matter compile product.json
```

---

## 7. Definition of Done

- [x] Compiler::compile() implemented; hash matches API for same input
- [x] Unit tests pass; no #[ignore] on compiler tests
- [x] CLI binary `matter compile <file.json>`
- [x] README and CTO guide updated

---

**Document version:** 1.0  
**Last updated:** 2026-02-05
