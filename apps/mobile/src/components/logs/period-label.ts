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
import type { DateKey } from '@/features/logs';
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

/**
 * "Hoy" for the period the person is in, its date otherwise.
 *
 * "Today" is compared period-to-period, not date-to-date: for a weekly goal
 * every day of the current week *is* the current period, and calling it by
 * Monday's date would make this week look like history. `current` is the
 * server's `current_period.entry_date`, so which period "now" is — and in
 * which timezone — is never worked out on the device.
 */
export function periodLabel(
  key: DateKey,
  current: DateKey,
  frequency: TrackingFrequency,
  locale: AppLocale,
  t: TranslateFn,
): string {
  if (key === current) return t('logs.period.today');
  if (frequency === 'weekly') {
    return t('logs.period.week', { date: shortDate(key, locale) });
  }
  return dayMonth(key, locale);
}
