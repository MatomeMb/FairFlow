/**
 * Format utilities for display values
 * All functions use en-ZA locale for South African formatting
 */

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(1)} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(dateObj.toISOString());
}

export function truncateId(uuid: string, length: number = 8): string {
  return `${uuid.slice(0, length)}…`;
}

export function formatCurrency(amount: number, currency: 'ZAR' | 'USD' = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : '$';
  return `${symbol} ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const formatPrice = (amount: number, currency: string): string => {
  const value = (amount / 100).toFixed(2);
  if (currency === 'ZAR') return `R ${value}`;
  if (currency === 'USD') return `$${value}`;
  if (currency === 'EUR') return `€${value}`;
  return `${currency} ${value}`;
};

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
