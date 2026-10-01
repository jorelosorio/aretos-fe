/**
 * Timestamps as the device's database stores them: UTC, microseconds, a `Z`,
 * always the same width — `2026-10-01T08:15:00.120000Z`.
 *
 * The diary is ordered by `listed_at` and `created_at`, and the device sorts
 * them as text. Text sorts as time only when every value has the same shape.
 * The server's do not: Go drops trailing zeros from the fraction (`…:00.12Z`)
 * and may write an offset instead of `Z`. So every timestamp is rewritten on
 * the way in, keeping the server's microseconds, which a `Date` would round
 * to milliseconds.
 */

const PATTERN =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/;

/** Throws on anything that is not an RFC 3339 timestamp. */
export function toTimestamp(value: string): string {
  const match = PATTERN.exec(value);
  if (match === null) throw new Error(`not an RFC 3339 timestamp: ${value}`);

  const [, seconds, fraction = '', zone] = match;
  // An offset moves whole minutes, so the fraction survives it untouched.
  const utc = new Date(`${seconds}${zone}`).toISOString().slice(0, 19);
  return `${utc}.${fraction.padEnd(6, '0').slice(0, 6)}Z`;
}

/** Now, in the same shape. A `Date` has milliseconds; the rest are zeros. */
export function nowTimestamp(now: Date = new Date()): string {
  return `${now.toISOString().slice(0, 23)}000Z`;
}
