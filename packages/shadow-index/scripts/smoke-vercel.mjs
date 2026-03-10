#!/usr/bin/env node
/**
 * Shadow Index production smoke test.
 *
 * Usage:
 *   node scripts/smoke-vercel.mjs https://your-api-domain
 *   SHADOW_INDEX_BASE_URL=https://your-api-domain node scripts/smoke-vercel.mjs
 */

const arg = process.argv[2];
if (arg === '--help' || arg === '-h') {
  console.log('Usage: node scripts/smoke-vercel.mjs <base_url>');
  console.log('Env fallback: SHADOW_INDEX_BASE_URL=https://your-api-domain');
  process.exit(0);
}

const rawBaseUrl = arg || process.env.SHADOW_INDEX_BASE_URL;
if (!rawBaseUrl) {
  console.error('Missing base URL.');
  console.error('Usage: node scripts/smoke-vercel.mjs https://your-api-domain');
  process.exit(1);
}

const baseUrl = rawBaseUrl.replace(/\/+$/, '');
const timeoutMs = parseInt(process.env.SMOKE_TIMEOUT_MS || '8000', 10) || 8000;

const checks = [
  {
    name: 'GET /',
    path: '/',
    expectStatus: [200],
    validate: (body) => body?.status === 'ok' && body?.service === 'shadow-index',
  },
  {
    name: 'GET /health',
    path: '/health',
    expectStatus: [200],
    validate: (body) =>
      (body?.status === 'ok' || body?.status === 'degraded') &&
      body?.service === 'shadow-index',
  },
  {
    name: 'GET /healthz',
    path: '/healthz',
    expectStatus: [200],
    validate: (body) => body?.status === 'ok',
  },
  {
    name: 'GET /resolve/:missingHash',
    path: `/resolve/${'0'.repeat(64)}`,
    expectStatus: [404],
    validate: (body) => typeof body?.code === 'string',
  },
];

async function runCheck(check) {
  const url = `${baseUrl}${check.path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const response = await fetch(url, { signal: controller.signal });
    const elapsed = Date.now() - started;
    const bodyText = await response.text();
    let body = null;
    try {
      body = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      body = null;
    }

    const statusOk = check.expectStatus.includes(response.status);
    const bodyOk = check.validate(body);
    const ok = statusOk && bodyOk;

    return {
      ok,
      name: check.name,
      status: response.status,
      elapsed,
      details: ok ? 'ok' : `unexpected response body/status (${response.status})`,
      sample: body,
    };
  } catch (error) {
    const elapsed = Date.now() - started;
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      name: check.name,
      status: 'ERR',
      elapsed,
      details: message,
      sample: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log(`\n[smoke] Target: ${baseUrl}`);
  console.log(`[smoke] Timeout per check: ${timeoutMs}ms\n`);

  const results = [];
  for (const check of checks) {
    const result = await runCheck(check);
    results.push(result);
    const prefix = result.ok ? 'PASS' : 'FAIL';
    console.log(`${prefix}  ${result.name} (${result.status}, ${result.elapsed}ms)`);
    if (!result.ok) {
      console.log(`      ${result.details}`);
      if (result.sample) {
        console.log(`      sample=${JSON.stringify(result.sample)}`);
      }
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log('');
  if (failed.length > 0) {
    console.error(`[smoke] FAILED: ${failed.length}/${results.length} checks failed.`);
    process.exit(1);
  }

  console.log(`[smoke] PASSED: ${results.length}/${results.length} checks passed.`);
}

main().catch((error) => {
  console.error('[smoke] Fatal error:', error);
  process.exit(1);
});
