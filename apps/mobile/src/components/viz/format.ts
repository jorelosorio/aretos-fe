/**
 * Turning the report's numbers into strings, in one place.
 *
 * Every rate the server sends is `0..1`. The scaling to a percent happens here
 * and nowhere else, which is the point: the web app scales some rates in its
 * API layer and then compares `score >= 70` against `spread >= 20` in a single
 * component, two scales in one file. Keeping the domain at `0..1` and the
 * formatting at the edge makes that impossible.
 *
 * Every function takes the caller's own "no data" string rather than owning
 * one, because the copy is translated and `lib/i18n` sits below `components/`
 * in the dependency order. A null is never silently turned into a zero: that
 * is the one rule this whole feature is built to keep.
 */

/** A rate as a whole-number percent, or the caller's empty string. */
export function formatRate(rate: number | null, empty: string): string {
  if (rate === null) return empty;
  return `${Math.round(rate * 100)}%`;
}

/**
 * A rate as bare percentage points, for a gap or a spread where the "%" sign
 * would suggest a proportion of something rather than a difference.
 */
export function formatPoints(value: number | null, empty: string): string {
  if (value === null) return empty;
  return `${Math.round(value * 100)}`;
}

/** A signed change in percentage points: `+12`, `-4`, `0`. */
export function formatDelta(delta: number | null, empty: string): string {
  if (delta === null) return empty;

  const points = Math.round(delta * 100);
  return points > 0 ? `+${points}` : `${points}`;
}

/** A correlation coefficient at two decimals, which is how they are read. */
export function formatRho(rho: number): string {
  return rho.toFixed(2);
}

/**
 * A rate as a `0..100` number for a bar's width, or null.
 *
 * Separate from `formatRate` because a bar needs the number and a label needs
 * the string, and a component that parsed the string back would be one more
 * place the scale could drift.
 */
export function percentOf(rate: number | null): number | null {
  if (rate === null) return null;
  return Math.max(0, Math.min(100, rate * 100));
}
