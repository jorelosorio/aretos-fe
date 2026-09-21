/**
 * How a period reads in the check-in's header.
 *
 * A date is not enough on its own: the same `entry_date` means "Tuesday" for a
 * daily goal and "the week starting Monday" for a weekly one, so the label has
 * to be told which frequency produced it or it will quietly under-report what
 * the person is about to overwrite.
 *
 * `Intl` is used rather than a hand-rolled month table because the app already
 * knows its locale and both of the ones it ships have different word orders.
 */

import type { TrackingFrequency } from '@/features/goals';
import { periodKey, todayKey, type DateKey } from '@/features/logs';
import type { AppLocale, TranslateFn } from '@/lib/i18n';

/** Local again, for the same reason `fromDateKey` is: `new Date(key)` is UTC. */
function toDate(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const dayMonth = (key: DateKey, locale: AppLocale) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(toDate(key));

const shortDate = (key: DateKey, locale: AppLocale) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
    toDate(key),
  );

/** The weekday's short name, for the heading above a day in the strip. */
export function weekdayLabel(key: DateKey, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
    toDate(key),
  );
}

/** The day of the month, which is what the strip's circles carry. */
export function dayNumber(key: DateKey): string {
  return String(toDate(key).getDate());
}

/**
 * The month a displayed week belongs to, named after its Thursday.
 *
 * A week that straddles two months has to be filed under one of them, and
 * the ISO week — the same one `periodKey` snaps to — belongs to whichever
 * month holds its Thursday. Taking Monday's month instead would label the
 * last week of March as February in some years.
 */
export function weekMonthLabel(key: DateKey, locale: AppLocale): string {
  const thursday = toDate(key);
  thursday.setDate(thursday.getDate() + 3);

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(thursday);
}

/**
 * "Hoy" for the period the person is in, its date otherwise.
 *
 * "Today" is compared period-to-period, not date-to-date: for a weekly goal
 * every day of the current week *is* the current period, and calling it by
 * Monday's date would make this week look like history.
 */
export function periodLabel(
  key: DateKey,
  frequency: TrackingFrequency,
  locale: AppLocale,
  t: TranslateFn,
): string {
  if (key === periodKey(todayKey(), frequency)) return t('logs.period.today');
  if (frequency === 'weekly') {
    return t('logs.period.week', { date: shortDate(key, locale) });
  }
  return dayMonth(key, locale);
}
