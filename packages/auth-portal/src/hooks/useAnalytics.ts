import { useState, useEffect, useCallback } from "react";
import type { AnalyticsDashboard } from "../types/analytics";
import { apiBase, apiKey } from "../lib/config";

const buildHeaders = (includeAccept = false): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (includeAccept) headers.Accept = "application/json";
  if (apiKey) headers["x-api-key"] = apiKey;
  return headers;
};

export function useAnalytics(refreshInterval = 30000) {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [secondsSince, setSecondsSince] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/v1/analytics/dashboard`, {
        headers: buildHeaders(true),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastRefreshed(new Date());
      setSecondsSince(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "API unreachable");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/health`, {
        headers: buildHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, refreshInterval);
    const tickInterval = setInterval(() => setSecondsSince(s => s + 1), 1000);
    return () => { clearInterval(dataInterval); clearInterval(tickInterval); };
  }, [fetchData, refreshInterval]);

  return { data, error, loading, lastRefreshed, secondsSince, refresh: fetchData, checkHealth };
}
