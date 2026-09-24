/**
 * How a diary entry names its place in time.
 *
 * All of this is the caller's to work out. The endpoint carries what was
 * saved — an `entry_date` and the goal's `tracking_frequency` — and nothing
 * derived from it, so the month an entry groups under and the span its date
 * stands for are computed here.
 *
 * The span matters and is not decoration: the same `entry_date` means
 * "Tuesday" for a daily goal and "the week beginning Monday" for a weekly one,
 * so a label that ignored the frequency would name a date the person did not
 * write on. `logs/period-label.ts` makes the same point for the check-in's
 * header; this is its read-only counterpart, without the "today" case, because
 * a diary is a list of things already past.
 *
 * `Intl` rather than a month table for the reason that file uses it: the app
 * already knows its locale, and the two it ships order the day and the month
 * differently.
 */

import type { TrackingFrequency } from '@/features/goals';
import type { AppLocale } from '@/lib/i18n';

/**
 * Local again, for the reason `features/logs/period.ts` spells out:
 * `new Date('2026-03-01')` is UTC midnight by spec, which in any negative
 * offset is still February 28th locally.
 */
function toDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * The `YYYY-MM` an entry groups under.
 *
 * Sliced rather than parsed and reformatted. The list arrives already ordered
 * newest first, so grouping is only ever a comparison with the previous
 * entry's key — and a slice cannot drift across a timezone the way building a
 * `Date` to read its month back can.
 */
export const monthKey = (entryDate: string): string => entryDate.slice(0, 7);

/**
 * "Septiembre de 2026" for the heading a month's entries sit under.
 *
 * Capitalised on the way out for the reason `date-label.ts`'s
 * `longDateLabel` is: Spanish writes its months in lower case, and `Intl`
 * is right to — that is correct prose. It is not correct as a heading on its
 * own line, which is what this is used for.
 */
export function monthLabel(month: string, locale: AppLocale): string {
  const text = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(toDate(`${month}-01`));

  return text.charAt(0).toUpperCase() + text.slice(1);
}

const weekdayDay = (key: string, locale: AppLocale) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(toDate(key));

const dayOnly = (key: string, locale: AppLocale) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(toDate(key));

const dayMonth = (key: string, locale: AppLocale) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
    toDate(key),
  );

/**
 * The last day of the period `entryDate` opens.
 *
 * Only `weekly` spans more than its own date, and the server has already
 * snapped that entry to its Monday, so the end is six days on. This agrees
 * with `periodKey` in `features/logs/period.ts`, which snaps the same way in
 * the other direction.
 */
function periodEnd(entryDate: string, frequency: TrackingFrequency): string {
  if (frequency !== 'weekly') return entryDate;

  const date = toDate(entryDate);
  date.setDate(date.getDate() + 6);

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * The span an entry covers, as short as it can be said.
 *
 * A daily or flexible goal stands on one date and reads as that weekday. A
 * weekly one has to name both ends, and the month is dropped from the near end
 * when the week does not cross into another one, since the heading above it
 * already said which month this is.
 */
export function periodLabel(
  entryDate: string,
  frequency: TrackingFrequency,
  locale: AppLocale,
): string {
  const end = periodEnd(entryDate, frequency);
  if (end === entryDate) return weekdayDay(entryDate, locale);

  const sameMonth = monthKey(entryDate) === monthKey(end);
  const start = sameMonth
    ? dayOnly(entryDate, locale)
    : dayMonth(entryDate, locale);

  return `${start} – ${dayMonth(end, locale)}`;
}
