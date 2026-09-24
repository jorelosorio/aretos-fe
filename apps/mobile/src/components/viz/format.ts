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
 * A rate as "how many out of ten", for a comparison a person reads at a
 * glance.
 *
 * The report used to state differences as "23 pts" — percentage points,
 * which is the correct unit and one nobody outside a statistics class reads.
 * "8 of every 10 on Thursdays, 6 on Mondays" says the same thing in a form
 * that needs no legend. Rounding to tenths loses precision a phone screen was
 * never going to convey, and the exact percent always travels beside it.
 */
export function outOfTen(rate: number): number {
  return Math.round(Math.max(0, Math.min(1, rate)) * 10);
}

/** A mood mean on the 1–5 scale at one decimal, the way a mean is read. */
export function formatMood(mean: number): string {
  return mean.toFixed(1);
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
