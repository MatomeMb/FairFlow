import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StorageMonitor } from '../lib/storage-monitor.js';

describe('StorageMonitor', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should calculate directory size correctly', async () => {
    const file1 = path.join(tempDir, 'file1.txt');
    const file2 = path.join(tempDir, 'file2.txt');
    
    // Total 10 + 20 = 30 bytes
    await fs.writeFile(file1, Buffer.alloc(10));
    await fs.writeFile(file2, Buffer.alloc(20));

    const monitor = new StorageMonitor([tempDir], 100);
    const stats = await monitor.getUsageStats();

    expect(stats.totalSizeBytes).toBe(30);
    expect(stats.quotaBytes).toBe(100);
    expect(stats.usagePercent).toBe(30);
    expect(stats.isOverQuota).toBe(false);
  });

  it('should detect over quota', async () => {
    const file1 = path.join(tempDir, 'file1.txt');
    await fs.writeFile(file1, Buffer.alloc(150));

    const monitor = new StorageMonitor([tempDir], 100);
    const stats = await monitor.getUsageStats();

    expect(stats.totalSizeBytes).toBe(150);
    expect(stats.isOverQuota).toBe(true);
  });
});
