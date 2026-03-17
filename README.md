# fairflow

**Object-Oriented Commerce Platform**

fairflow turns product data into portable digital objects (`.thing` files) — cryptographically signed, content-addressed, and transactable anywhere on the web.

## Repository

The main project lives in [`mcj/`](./mcj/). See [mcj/README.md](./mcj/README.md) for setup and [mcj/docs/](./mcj/docs/) for documentation.

## Quick Start

```bash
cd mcj
# Terminal 1: API (http://localhost:3000)
cd packages/shadow-index && npm install && npm run dev
# Terminal 2: Portal (http://localhost:5178)
cd packages/auth-portal && npm install && npm run dev
```

## License

MIT
