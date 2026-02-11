import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface StorageStats {
  totalSizeBytes: number;
  totalSizeMB: number;
  quotaBytes: number;
  usagePercent: number;
  isOverQuota: boolean;
  directories: Array<{
    path: string;
    sizeBytes: number;
  }>;
}

export class StorageMonitor {
  private dataDirs: string[];
  private quotaBytes: number;

  constructor(dataDirs: string[], quotaBytes: number) {
    this.dataDirs = dataDirs;
    this.quotaBytes = quotaBytes;
  }

  /**
   * Calculate total size of all monitored directories
   */
  async getUsageStats(): Promise<StorageStats> {
    const stats: StorageStats = {
      totalSizeBytes: 0,
      totalSizeMB: 0,
      quotaBytes: this.quotaBytes,
      usagePercent: 0,
      isOverQuota: false,
      directories: []
    };

    for (const dir of this.dataDirs) {
      const size = await this.getDirSize(dir);
      stats.directories.push({
        path: path.basename(dir) || dir,
        sizeBytes: size
      });
      stats.totalSizeBytes += size;
    }

    stats.totalSizeMB = Math.round(stats.totalSizeBytes / (1024 * 1024) * 100) / 100;
    stats.usagePercent = Math.round((stats.totalSizeBytes / this.quotaBytes) * 10000) / 100;
    stats.isOverQuota = stats.totalSizeBytes > this.quotaBytes;

    return stats;
  }

  private async getDirSize(dirPath: string): Promise<number> {
    let size = 0;
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          size += await this.getDirSize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          size += stats.size;
        }
      }
    } catch (err) {
      // If directory doesn't exist, size is 0
    }
    return size;
  }
}
