import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnvFromFile = async (filePath: string) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      const cleaned = rawValue.replace(/^['"]|['"]$/g, '').trim();
      if (process.env[key] === undefined) {
        process.env[key] = cleaned;
      }
    }
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') throw error;
  }
};

const loadEnvForShadowIndex = async () => {
  const packageRoot = path.join(__dirname, '..');
  await loadEnvFromFile(path.join(packageRoot, '.env'));
  await loadEnvFromFile(path.join(packageRoot, '.env.local'));
};

// In Vitest, .env files load asynchronously and could repopulate SHADOW_INDEX_API_KEY after the
// synchronous test-mode delete below — breaking the "no keys = open API" contract tests rely on.
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  void loadEnvForShadowIndex();
}

const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'AUTH_PORTAL_BASE_URL',
  'PAYSTACK_SECRET_KEY',
];
const _missingEnv = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  _missingEnv.push('SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY');
}
if (_missingEnv.length > 0) {
  console.error(`[FATAL] Missing environment variables: ${_missingEnv.join(', ')}`);
}

if (process.env.NODE_ENV === 'test') {
  delete process.env.SHADOW_INDEX_API_KEY;
  delete process.env.SHADOW_INDEX_API_KEYS;
}

if (
  process.env.NODE_ENV !== 'test' &&
  !process.env.SHADOW_INDEX_API_KEY &&
  !process.env.SHADOW_INDEX_API_KEYS
) {
  const msg = '[FATAL] SHADOW_INDEX_API_KEY is required.';
  if (process.env.VERCEL) {
    // Keep the function alive in hosted runtimes and surface the misconfiguration in logs.
    console.error(`${msg} Continuing startup on Vercel to avoid total API outage.`);
  } else {
    console.error(`${msg} Refusing to start.`);
    process.exit(1);
  }
}
