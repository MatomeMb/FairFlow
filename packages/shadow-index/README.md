# shadow-index

Shadow Index API - Fast hash-to-artifact resolution service.

## Overview

This API service provides:
- Product compilation endpoint (`POST /compile`)
- Hash resolution (`GET /resolve/:hash`)
- Gist retrieval (`GET /gist/:hash`)
- Batch operations (`POST /batch`)

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Environment Variables

See `.env.example` in the root directory for required environment variables.

## Deployment

This service is designed to be deployed on Vercel Edge Functions:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## API Endpoints

### `GET /health`
Health check endpoint.

### `POST /compile`
Compile product data into a .thing file.

**Request:**
```json
{
  "id": "product-123",
  "title": "Product Name",
  "description": "Product description",
  "price": 2999,
  "currency": "USD",
  "image_url": "https://example.com/image.jpg",
  "checkout_url": "https://merchant.com/checkout"
}
```

**Response:**
```json
{
  "hash": "a1b2c3d4...",
  "thing_url": "https://cdn.example.com/thing/a1b2c3d4.thing",
  "image_url": "https://cdn.example.com/images/a1b2c3d4.jpg",
  "matter_uri": "matter://a1b2c3d4..."
}
```

### `GET /resolve/:hash`
Resolve hash to artifact URLs.

### `GET /gist/:hash`
Get minimal product data (gist) by hash.

### `POST /batch`
Batch compile multiple products.

## Status

🚧 **In Development** - This API is currently being set up. Core functionality will be implemented in Foundation and Core sprints.
