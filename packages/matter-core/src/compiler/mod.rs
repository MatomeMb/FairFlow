//! Compiler module — Transforms product data into .thing files.
//!
//! Hash algorithm and .thing format match the Shadow Index API so that
//! CLI-compiled artifacts resolve identically to API-compiled ones.

use anyhow::{ensure, Result};
use chrono::Utc;
use serde_json::Value;
use sha2::{Digest, Sha256};

/// Commerce Compiler: product JSON → .thing bytes (hash matches Shadow Index API).
pub struct Compiler {}

impl Compiler {
    pub fn new() -> Self {
        Self {}
    }

    /// Compile product JSON into .thing file bytes (pretty JSON).
    /// Hash is computed with the same stable stringify + SHA-256 as the API.
    pub fn compile(&self, product_data: &str) -> Result<Vec<u8>> {
        let product: Value = serde_json::from_str(product_data)
            .map_err(|e| anyhow::anyhow!("invalid_json: {}", e))?;

        validate_product(&product)?;

        let hash = compute_hash(&product)?;
        let created_at = Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true);

        let mut thing = product.as_object().cloned().unwrap_or_default();
        thing.insert("hash".to_string(), Value::String(hash.clone()));
        thing.insert("created_at".to_string(), Value::String(created_at));

        let payload = Value::Object(thing);
        let bytes = serde_json::to_vec_pretty(&payload)
            .map_err(|e| anyhow::anyhow!("serialize: {}", e))?;

        Ok(bytes)
    }

    /// Compute the product hash only (no .thing built). Useful for tests and CLI.
    pub fn hash_product(&self, product_data: &str) -> Result<String> {
        let product: Value = serde_json::from_str(product_data)
            .map_err(|e| anyhow::anyhow!("invalid_json: {}", e))?;
        validate_product(&product)?;
        compute_hash(&product)
    }
}

impl Default for Compiler {
    fn default() -> Self {
        Self::new()
    }
}

/// Stable stringify: object keys sorted alphabetically, recursive. Matches API.
fn stable_stringify(value: &Value) -> String {
    match value {
        Value::Object(map) => {
            let mut keys: Vec<_> = map.keys().collect();
            keys.sort_by(|a, b| a.cmp(b));
            let parts: Vec<String> = keys
                .into_iter()
                .map(|k| {
                    let v = map.get(k).unwrap();
                    format!("{}:{}", serde_json::to_string(k).unwrap(), stable_stringify(v))
                })
                .collect();
            format!("{{{}}}", parts.join(","))
        }
        Value::Array(arr) => {
            let parts: Vec<String> = arr.iter().map(stable_stringify).collect();
            format!("[{}]", parts.join(","))
        }
        _ => value.to_string(),
    }
}

fn compute_hash(product: &Value) -> Result<String> {
    let s = stable_stringify(product);
    let mut hasher = Sha256::new();
    hasher.update(s.as_bytes());
    Ok(hex::encode(hasher.finalize()))
}

fn validate_product(product: &Value) -> Result<()> {
    let obj = product
        .as_object()
        .ok_or_else(|| anyhow::anyhow!("invalid_product: expected object"))?;

    let title = obj
        .get("title")
        .and_then(Value::as_str)
        .ok_or_else(|| anyhow::anyhow!("invalid_product: title required"))?;
    ensure!(!title.is_empty(), "invalid_product: title must be non-empty");

    let price = obj
        .get("price")
        .and_then(Value::as_i64)
        .ok_or_else(|| anyhow::anyhow!("invalid_product: price required"))?;
    ensure!(price >= 0, "invalid_product: price must be non-negative");

    let currency = obj
        .get("currency")
        .and_then(Value::as_str)
        .ok_or_else(|| anyhow::anyhow!("invalid_product: currency required"))?;
    ensure!(
        currency.len() == 3,
        "invalid_product: currency must be 3 characters"
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compiler_creation() {
        let compiler = Compiler::new();
        assert!(compiler.hash_product("{}").is_err());
    }

    #[test]
    fn test_compile_valid_product() {
        let c = Compiler::new();
        let json = r#"{"title":"Test","price":100,"currency":"USD"}"#;
        let out = c.compile(json).unwrap();
        let parsed: Value = serde_json::from_slice(&out).unwrap();
        let obj = parsed.as_object().unwrap();
        assert!(obj.get("hash").unwrap().as_str().unwrap().len() == 64);
        assert_eq!(obj.get("title").unwrap().as_str().unwrap(), "Test");
        assert_eq!(obj.get("price").unwrap().as_i64().unwrap(), 100);
        assert_eq!(obj.get("currency").unwrap().as_str().unwrap(), "USD");
        assert!(obj.contains_key("created_at"));
    }

    #[test]
    fn test_hash_deterministic() {
        let c = Compiler::new();
        let json = r#"{"title":"A","price":1,"currency":"USD"}"#;
        let h1 = c.hash_product(json).unwrap();
        let h2 = c.hash_product(json).unwrap();
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_hash_matches_api_demo_product() {
        let c = Compiler::new();
        let json = r#"{"title":"Demo Product","price":14999,"currency":"USD","image_url":"https://picsum.photos/seed/matter-demo/300/200","checkout_url":"https://example.com/buy"}"#;
        let hash = c.hash_product(json).unwrap();
        let expected = "45c2bee2699cf3bbf3cae468d27bad04a3bf516afa9cb3bd1235eaaa2c106495";
        assert_eq!(hash, expected, "Rust hash must match Shadow Index API hash");
    }

    #[test]
    fn test_compile_missing_title() {
        let c = Compiler::new();
        let json = r#"{"price":100,"currency":"USD"}"#;
        let err = c.compile(json).unwrap_err();
        assert!(err.to_string().contains("title"));
    }

    #[test]
    fn test_compile_empty_title() {
        let c = Compiler::new();
        let json = r#"{"title":"","price":100,"currency":"USD"}"#;
        let err = c.compile(json).unwrap_err();
        assert!(err.to_string().contains("non-empty"));
    }

    #[test]
    fn test_compile_invalid_json() {
        let c = Compiler::new();
        let err = c.compile("not json").unwrap_err();
        assert!(err.to_string().contains("invalid_json") || err.to_string().contains("invalid"));
    }
}
