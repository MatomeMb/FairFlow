const zarCurrencyFormatter = new Intl.NumberFormat('en-ZA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats integer cents into a ZAR string like `R 291.00`.
 */
export function formatZarFromCents(value: number | null | undefined): string {
  const cents = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `R ${zarCurrencyFormatter.format(cents / 100)}`;
}
