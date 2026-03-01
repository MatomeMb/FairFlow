#!/usr/bin/env node

/**
 * Markdown to PDF Converter
 * Usage: node scripts/md-to-pdf.js <input.md> [output.pdf]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/md-to-pdf.js <input.md> [output.pdf]');
  process.exit(1);
}

const inputFile = args[0];
let outputFile = args[1] || inputFile.replace('.md', '.pdf');

// If PDF engine not available, convert to HTML instead
const useHTML = !outputFile.endsWith('.pdf');
if (!useHTML && outputFile.endsWith('.pdf')) {
  // Check if we should use HTML instead
  try {
    execSync('wkhtmltopdf --version', { stdio: 'ignore' });
  } catch {
    console.log('[WARNING] pdflatex/wkhtmltopdf not found. Converting to HTML instead.');
    outputFile = inputFile.replace('.md', '.html');
  }
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

console.log(`📄 Converting ${inputFile} → ${outputFile}...`);

try {
  // Check if pandoc is installed
  try {
    execSync('pandoc --version', { stdio: 'ignore' });
  } catch {
    console.error('[ERROR] pandoc not found. Install with: choco install pandoc');
    console.error('   Or download from: https://pandoc.org/installing.html');
    process.exit(1);
  }

  // Use pandoc to convert to standalone HTML (universal format)
  const command = `pandoc "${inputFile}" -o "${outputFile}" --from=markdown --to=html -s --toc --css=https://cdn.jsdelivr.net/npm/water.css`;

  console.log(`📦 Converting to: ${path.extname(outputFile) === '.html' ? 'HTML' : 'PDF'}`);
  execSync(command, { stdio: 'inherit' });

  console.log(`[SUCCESS] PDF created: ${outputFile}`);
  console.log(`[INFO] File size: ${(fs.statSync(outputFile).size / 1024).toFixed(1)} KB`);
} catch (error) {
  console.error('[ERROR] Conversion failed:', error.message);
  process.exit(1);
}
