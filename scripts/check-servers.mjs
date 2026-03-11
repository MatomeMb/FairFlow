#!/usr/bin/env node
/**
 * Verifies API (3000) and Portal (5178) are running before demo.
 */
const API = 'http://127.0.0.1:3000/health';
const PORTAL = 'http://127.0.0.1:5178';

async function check(url, name) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return r.ok || r.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  const [apiOk, portalOk] = await Promise.all([
    check(API, 'API'),
    check(PORTAL, 'Portal'),
  ]);

  if (!apiOk) {
    console.error('\n[ERROR] API not running on localhost:3000');
    console.error('  Start it: npm run start:api\n');
    process.exit(1);
  }
  if (!portalOk) {
    console.error('\n[ERROR] Portal not running on localhost:5178');
    console.error('  Start it: cd packages/auth-portal && npm run dev\n');
    process.exit(1);
  }
  console.log('  API OK, Portal OK\n');
}

main();
