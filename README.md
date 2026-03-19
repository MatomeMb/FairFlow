# fairflow

> Professional commerce operations for merchants, teams, and trusted customer journeys.

## What is fairflow?

Fairflow is a commerce platform that helps South African merchants get their products online, sell them, and stay connected with their customers. It provides a merchant portal, consumer checkout, admin operations, and a browser extension for portable product discovery.

## Project Structure

This is a monorepo. All active code lives in the `mcj/` directory.

```
.
├── mcj/                        ← Main project (start here)
│   ├── packages/
│   │   ├── auth-portal/        ← React frontend (merchant portal, admin, consumer shop)
│   │   ├── shadow-index/       ← Node.js API (Hono framework)
│   │   ├── matter-core/        ← Rust compiler (.thing files, matter:// URIs)
│   │   └── lens-extension/     ← Chrome browser extension
│   ├── docs/                   ← Project documentation
│   └── README.md               ← Detailed setup guide (see GETTING-STARTED.md)
├── packages/                   ← Mirrored worktree (same code, different branch)
└── docs/                       ← Top-level documentation index
```

## Quick Start

```bash
cd mcj
npm install
cp .env.example .env
# Fill in environment variables — see docs/API_KEYS_GUIDE.md

npm run dev
```

**Frontend:** http://localhost:5178  
**API:** http://localhost:3000

## Documentation

- [Getting Started Guide](./docs/GETTING-STARTED.md)
- [Technical Architecture](./docs/02-TECHNICAL-ARCHITECTURE.md)
- [API Reference](./packages/shadow-index/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security & Hardening](./docs/20-SECURITY-HARDENING.md)
- [All Documentation](./docs/README.md)

## Team

| Role | Name |
|------|------|
| CEO | Sobuhle Nyambali |
| CTO | Matome Mboweni |

## Live Site

[fairflow.co.za](https://fairflow.co.za)

## License

MIT
