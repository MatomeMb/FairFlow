import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { RetentionPolicy } from '../lib/retention-policy.js';

describe('RetentionPolicy', () => {
  let tempDir: string;
  let eventsDir: string;
  let archiveDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'retention-test-'));
    eventsDir = path.join(tempDir, 'events');
    archiveDir = path.join(tempDir, 'archive');
    await fs.mkdir(eventsDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should move files older than retention days', async () => {
    // Create a new file (today)
    const today = new Date().toISOString().split('T')[0];
    const todayFile = path.join(eventsDir, `${today}.jsonl`);
    await fs.writeFile(todayFile, 'test');

    // Create an old file (100 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);
    const oldDateStr = oldDate.toISOString().split('T')[0];
    const oldFile = path.join(eventsDir, `${oldDateStr}.jsonl`);
    await fs.writeFile(oldFile, 'test old');

    const policy = new RetentionPolicy({
      eventsDir,
      archiveDir,
      retentionDays: 90
    });

    const result = await policy.execute();

    expect(result.archived).toBe(1);
    expect(result.processed).toBe(2);

    // Verify today's file is still there
    const todayExists = await fs.access(todayFile).then(() => true).catch(() => false);
    expect(todayExists).toBe(true);

    // Verify old file is moved
    const oldExistsInSource = await fs.access(oldFile).then(() => true).catch(() => false);
    expect(oldExistsInSource).toBe(false);

    const oldExistsInArchive = await fs.access(path.join(archiveDir, `${oldDateStr}.jsonl`)).then(() => true).catch(() => false);
    expect(oldExistsInArchive).toBe(true);
  });
});
