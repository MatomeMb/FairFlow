import { useEffect, useRef } from 'react';

/**
 * Polls `fetchAccount` on a fixed interval while `enabled` is true.
 * Cleans up the interval on unmount or when `enabled` becomes false.
 */
export function useKYCStatusPoller(
  enabled: boolean,
  intervalMs: number,
  fetchAccount: () => void | Promise<void>,
): void {
  const fetchRef = useRef(fetchAccount);
  fetchRef.current = fetchAccount;

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      void fetchRef.current();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
}
