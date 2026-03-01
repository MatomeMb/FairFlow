# System Diagrams

UML and system architecture diagrams. See [02-TECHNICAL-ARCHITECTURE.md](./02-TECHNICAL-ARCHITECTURE.md) for narrative.

---

## Data Flow

```
.thing source -> matter-core (compile) -> .thing.bin
-> shadow-index (upload/index) -> hash -> lens-extension (resolve) -> overlay
-> auth-portal (analytics, management)
```

---

## Component Diagram

- matter-core: Rust compiler
- shadow-index: Node.js/Hono API
- auth-portal: React/Vite
- lens-extension: Chrome MV3
