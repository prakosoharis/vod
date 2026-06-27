/**
 * Format helpers for safe display of API data that may come as string or number
 */

/**
 * Format rating value safely.
 * API may return rating as string ("8.5"), number (8.5), or null.
 * Returns formatted string like "8.5" or null if no rating.
 */
export function formatRating(rating: unknown): string | null {
  if (rating === null || rating === undefined || rating === '') return null;

  const num = typeof rating === 'string' ? parseFloat(rating) : Number(rating);

  if (isNaN(num) || !isFinite(num)) return null;

  // Use up to 1 decimal place, but strip trailing .0
  return num.toFixed(1);
}

/**
 * Format duration string from API (e.g., "120 min" or "2h 30min")
 * Just returns as-is if string, formats seconds if number.
 */
export function formatDuration(duration: unknown): string {
  if (!duration) return '';
  if (typeof duration === 'string') return duration;
  if (typeof duration === 'number') {
    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m`;
  }
  return String(duration);
}

/**
 * Safe number conversion
 */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num) || !isFinite(num)) return null;
  return num;
}
