export interface AnalyticsDashboard {
  status: string;
  lastUpdated: string;
  storage: { totalSize: number; events: number; things: number; quota: number };
  cache: { enabled: boolean; hitRate: number; hits: number; misses: number; entries: number; size: number; evictions: number };
  preAggregation: { status: string; files: number; lastRun: string | null };
  system: { memoryHeap: number; memoryRss: number; concurrentQueries: number; totalQueries: number };
  errors: { count: number; period: string };
  queryHistogram: Array<{ duration: number; count: number }>;
  recentQueries: Array<{ timestamp: string; duration: number; params: unknown; results: number; status: string }>;
}
