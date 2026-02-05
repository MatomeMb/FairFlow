//! Matter CLI — Compile product JSON to .thing files.
//!
//! Usage: matter compile <input.json>
//! Writes {hash}.thing to the current directory and prints the matter URI.

use matter_core::Compiler;
use std::env;
use std::fs;
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 || args[1] != "compile" {
        eprintln!("Usage: matter compile <input.json>");
        eprintln!("  Reads product JSON, writes {{hash}}.thing and prints matter://{{hash}}");
        std::process::exit(1);
    }

    let input_path = Path::new(&args[2]);
    let product_data = fs::read_to_string(input_path)
        .map_err(|e| anyhow::anyhow!("Failed to read {}: {}", input_path.display(), e))?;

    let compiler = Compiler::new();
    let hash = compiler.hash_product(&product_data)?;
    let bytes = compiler.compile(&product_data)?;

    let out_name = format!("{}.thing", hash);
    let out_path = Path::new(&out_name);
    fs::write(out_path, &bytes)
        .map_err(|e| anyhow::anyhow!("Failed to write {}: {}", out_path.display(), e))?;

    println!("Compiled: {}", out_name);
    println!("matter://{}", hash);

    Ok(())
}
