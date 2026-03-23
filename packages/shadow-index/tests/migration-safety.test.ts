import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const MIGRATIONS_DIR = path.resolve(process.cwd(), '..', '..', 'supabase', 'migrations');

async function loadMigration(name: string): Promise<string> {
  return readFile(path.join(MIGRATIONS_DIR, name), 'utf8');
}

describe('migration safety checks', () => {
  it('oauth user_id migration is idempotent and guarded', async () => {
    const sql = await loadMigration('008_merchant_accounts_oauth_user_id.sql');
    expect(sql).toMatch(/DO\s+\$\$/i);
    expect(sql).toMatch(/IF EXISTS\s*\(/i);
    expect(sql).toMatch(/ALTER TABLE public\.merchant_accounts ALTER COLUMN user_id DROP NOT NULL/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
  });

  it('email uniqueness migration runs transactionally and can roll back on failure', async () => {
    const sql = await loadMigration('009_merchant_accounts_email_uniqueness.sql');
    expect(sql).toMatch(/begin;/i);
    expect(sql).toMatch(/commit;/i);
    expect(sql).toMatch(/create unique index if not exists merchant_accounts_email_unique_ci/i);
    expect(sql).toMatch(/delete from public\.merchant_accounts/i);
  });
});
