/**
 * A `YYYY-MM-DD` day key as a local date, never as an instant.
 *
 * The one parser every screen and feature shares. `new Date(key)` on a bare
 * date reads it as UTC midnight by spec, so anywhere west of Greenwich the
 * local result is the evening before — a weekday header over the wrong
 * column, a log filed under yesterday. Handing `Date` the parts separately
 * builds local midnight instead, which is what a calendar day means.
 */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}
