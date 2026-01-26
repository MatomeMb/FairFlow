//! Matter Core - Commerce Compiler Library
//!
//! This library transforms product data into Universal Commerce Containers (.thing files).
//! It handles compilation, signing, vectorization, and steganographic embedding.

pub mod compiler;
pub mod crypto;
pub mod schema;
pub mod steg;
pub mod clip;

// Re-export main types
pub use compiler::Compiler;
pub use crypto::{KeyPair, Signature};

/// Library version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version() {
        assert!(!VERSION.is_empty());
    }
}
