#!/usr/bin/env node
/**
 * Launch full demo: API + Demo server
 * Usage: node scripts/launch-demo.mjs
 * Prerequisite: cd packages/shadow-index && npm run build (or npm run start will build)
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const shadowIndex = path.join(root, 'packages', 'shadow-index');

const api = spawn('npm', ['run', 'start'], {
  cwd: shadowIndex,
  stdio: 'inherit',
  shell: true,
});

const demo = spawn('node', ['scripts/demo-server.mjs'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  api.kill();
  demo.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

api.on('error', (err) => {
  console.error('Failed to start API:', err.message);
  process.exit(1);
});

demo.on('error', (err) => {
  console.error('Failed to start demo server:', err.message);
  process.exit(1);
});
