/**
 * `Intl.DateTimeFormat`, built once per locale and options and reused.
 *
 * Building a formatter is the expensive part — on Hermes, especially on
 * Android, it goes out to the platform's ICU — while `format` on one that
 * exists is cheap. A list renders a date per row and re-renders as it
 * scrolls, so building one per call was paid dozens of times a second for
 * formatters that never change. The cache is small by nature: the app ships
 * two locales and a handful of option sets.
 *
 * The key sorts the options, so `{ day, month }` and `{ month, day }` share
 * one formatter.
 */
const cache = new Map<string, Intl.DateTimeFormat>();

export function dateFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(
    Object.entries(options).sort(([a], [b]) => a.localeCompare(b)),
  )}`;

  let formatter = cache.get(key);
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}
