# matter-core

Commerce Compiler - Rust library for transforming product data into Universal Commerce Containers (.thing files).

## Overview

This is the core compiler library that:
- Validates and processes product data
- Generates CLIP semantic vectors
- Serializes to FlatBuffers binary format
- Signs with Ed25519 cryptography
- Embeds into polyglot images (steganography)

## Building

```bash
cargo build
cargo test
```

## Building for WASM

```bash
# Install wasm-pack if not already installed
cargo install wasm-pack

# Build for web target
wasm-pack build --target web
```

## Usage

```rust
use matter_core::Compiler;

let compiler = Compiler::new();
let thing_data = compiler.compile(product_json)?;
```

## Project Structure

```
src/
├── lib.rs          # Main library entry point
├── compiler/       # Compilation pipeline
├── crypto/         # Ed25519 signing
├── schema/         # FlatBuffers definitions
├── steg/           # Steganography engine
└── clip/           # CLIP integration
```

## Dependencies

- `flatbuffers` - Binary serialization
- `ed25519-dalek` - Cryptographic signing
- `image` - Image processing
- `reqwest` - HTTP client for CLIP API
- `zstd` - Compression

## Status

🚧 **In Development** - This package is currently being set up. Core functionality will be implemented in Phase 0 and Foundation sprints.
