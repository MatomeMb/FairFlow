import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface RetentionConfig {
  eventsDir: string;
  archiveDir: string;
  retentionDays: number;
}

export interface RetentionResult {
  processed: number;
  archived: number;
  errors: string[];
}

/**
 * RetentionPolicy handles moving old event logs to an archive directory.
 * Event files are expected to be named YYYY-MM-DD.jsonl
 */
export class RetentionPolicy {
  private config: RetentionConfig;

  constructor(config: RetentionConfig) {
    this.config = config;
  }

  /**
   * Run the retention process.
   * Returns stats about how many files were archived.
   */
  async execute(): Promise<RetentionResult> {
    const result: RetentionResult = {
      processed: 0,
      archived: 0,
      errors: []
    };

    try {
      // Ensure archive dir exists
      await fs.mkdir(this.config.archiveDir, { recursive: true });

      const files = await fs.readdir(this.config.eventsDir);
      const now = new Date();
      const cutoff = new Date(now.getTime() - (this.config.retentionDays * 24 * 60 * 60 * 1000));

      for (const file of files) {
        if (!file.endsWith('.jsonl')) continue;
        
        result.processed++;

        // Extract date from filename YYYY-MM-DD.jsonl
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.jsonl$/);
        if (!dateMatch) continue;

        const fileDate = new Date(dateMatch[1] + 'T00:00:00Z');
        if (isNaN(fileDate.getTime())) continue;

        if (fileDate < cutoff) {
          const sourcePath = path.join(this.config.eventsDir, file);
          const destPath = path.join(this.config.archiveDir, file);

          try {
            await fs.rename(sourcePath, destPath);
            result.archived++;
          } catch (err) {
            const errorMessage = `Failed to archive ${file}: ${(err as Error).message}`;
            result.errors.push(errorMessage);
          }
        }
      }
    } catch (err) {
      result.errors.push(`Critical retention error: ${(err as Error).message}`);
    }

    return result;
  }
}
