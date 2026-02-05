# Development Environment Setup Guide

This guide will help you set up your development environment for `.things that Matter`.

## Prerequisites

Before starting, ensure you have the following installed:

- **Git** - [Download](https://git-scm.com/downloads)
- **Rust** (1.70+) - Install via [rustup](https://rustup.rs/)
- **Node.js** (18+) - [Download](https://nodejs.org/)
- **pnpm** (recommended) or npm - `npm install -g pnpm`
- **VS Code** or **Cursor** - Your preferred IDE

## Quick Start

### 1. Install Rust Toolchain

```bash
# Install rustup (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Or on Windows, download and run rustup-init.exe from https://rustup.rs/

# Verify installation
rustc --version
cargo --version
```

### 2. Install Node.js Dependencies

```bash
# Install pnpm globally (recommended)
npm install -g pnpm

# Or use npm
npm install -g npm@latest
```

### 3. Clone and Setup Repository

```bash
# If you haven't already cloned the repo
git clone <repository-url>
cd .Things-That-Matter

# Install dependencies for shadow-index API
cd packages/shadow-index
pnpm install  # or npm install
cd ../..
```

### 4. Set Up Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys and credentials (see [Environment Variables](#environment-variables) section below)

3. **Never commit `.env` files to git!**

## Project Structure

```
.Things-That-Matter/
├── packages/
│   ├── matter-core/          # Rust compiler library
│   ├── matter-ffi/            # FFI bindings (C/C++/Node)
│   ├── shadow-index/          # API service (Node.js/TypeScript)
│   └── lens-extension/        # Browser extension (Vanilla JS)
├── docs/                      # Project documentation
├── scripts/                   # Build/deploy scripts
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=xxx
CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxx
CLOUDFLARE_R2_BUCKET_NAME=matter-artifacts
CLOUDFLARE_R2_PUBLIC_URL=https://xxx.r2.cloudflarestorage.com

# Replicate API (CLIP)
REPLICATE_API_KEY=xxx

# Cryptographic Signing
SIGNING_PRIVATE_KEY=xxx  # Ed25519 private key (base64 encoded)
SIGNING_PUBLIC_KEY=xxx   # Ed25519 public key (base64 encoded)

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Development
NODE_ENV=development
LOG_LEVEL=debug
```

### Getting API Keys

1. **Supabase**: 
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get URL and keys from Project Settings > API

2. **Cloudflare R2**:
   - Create account at [cloudflare.com](https://cloudflare.com)
   - Enable R2 in dashboard
   - Create bucket and generate API tokens

3. **Replicate**:
   - Create account at [replicate.com](https://replicate.com)
   - Get API key from Account Settings

4. **Ed25519 Keys**:
   - Generate using Rust: `cargo run --bin generate-keys` (once implemented)
   - Or use OpenSSL: `openssl genpkey -algorithm Ed25519 -out private.pem`

## Development Workflow

### Rust Development (matter-core)

```bash
cd packages/matter-core

# Build the project
cargo build

# Run tests
cargo test

# Run with watch mode (requires cargo-watch)
cargo install cargo-watch
cargo watch -x test

# Build for WASM
wasm-pack build --target web
```

### Node.js API Development (shadow-index)

```bash
cd packages/shadow-index

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Browser Extension Development (lens-extension)

```bash
cd packages/lens-extension

# Install dependencies
pnpm install

# Build extension
pnpm build

# Load in browser:
# Chrome: chrome://extensions > Load unpacked > Select dist/ folder
# Firefox: about:debugging > This Firefox > Load Temporary Add-on > Select manifest.json
```

## Infrastructure Setup

### Supabase Setup

1. Create a new Supabase project
2. Run the database migrations (once created):
   ```bash
   cd packages/shadow-index
   pnpm db:migrate
   ```

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login and deploy:
   ```bash
   cd packages/shadow-index
   vercel login
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Cloudflare R2 Setup

1. Create R2 bucket: `matter-artifacts`
2. Configure CORS for web access
3. Create public CDN endpoint
4. Add credentials to `.env`

## Testing the Setup

### Test Rust Installation

```bash
cd packages/matter-core
cargo test
```

### Test Node.js Setup

```bash
cd packages/shadow-index
pnpm test
```

### Test API Endpoints

Once the API is running:
```bash
curl http://localhost:3000/health
```

## Troubleshooting

### Rust Issues

- **rustup not found**: Add `~/.cargo/bin` to your PATH
- **Compilation errors**: Ensure you're using Rust 1.70+
- **WASM build fails**: Install `wasm-pack`: `cargo install wasm-pack`

### Node.js Issues

- **Module not found**: Run `pnpm install` in the package directory
- **Port already in use**: Change port in `packages/shadow-index/.env`
- **TypeScript errors**: Run `pnpm type-check`

### Environment Variables

- **Variables not loading**: Ensure `.env` is in the root directory
- **Missing keys**: Check `.env.example` for required variables

## Next Steps

After completing setup:

1. Verify all tools are installed
2. Set up infrastructure accounts (Supabase, Vercel, Cloudflare)
3. Configure environment variables
4. Run initial tests
5. Read the [Technical Architecture](./docs/02-TECHNICAL-ARCHITECTURE.md)
6. Review [CTO Next Steps](./docs/08-CTO-NEXT-STEPS.md)

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [FlatBuffers Guide](https://google.github.io/flatbuffers/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review project documentation in `docs/`
3. Check GitHub issues (once repo is public)
4. Contact the CTO (Matome Mboweni)

---

**Last Updated:** January 21, 2026  
**Version:** 1.0
