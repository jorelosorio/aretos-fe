/**
 * Dates as the calendar strips read them.
 *
 * `Intl` rather than a hand-rolled table of names: the app already knows its
 * locale and the two it ships name their days differently — and "narrow" is
 * not the first letter of "short" in every language, so slicing a string
 * would quietly be wrong somewhere.
 *
 * In `common/` because two strips now use it — the check-in's week picker
 * and the home card's week — and a day that reads "mié" in one place and "M"
 * in the other is the kind of drift nobody notices until both are on screen.
 */

import type { AppLocale } from '@/lib/i18n';
import { dateFormat } from '@/utils/date-format';
import { capitalize } from '@/utils/text';

/**
 * Local again, for the same reason `features/logs` parses its own keys:
 * `new Date('2026-03-01')` is UTC midnight, which is still February in any
 * negative offset — a whole column of the strip under the wrong weekday.
 */
function toDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** One letter, for a strip with seven columns and no room for more. */
export function weekdayInitial(key: string, locale: AppLocale): string {
  return capitalize(
    dateFormat(locale, { weekday: 'narrow' }).format(toDate(key)),
  );
}

/** The weekday's short name, for a strip that can afford three letters. */
export function weekdayLabel(key: string, locale: AppLocale): string {
  return capitalize(
    dateFormat(locale, { weekday: 'short' }).format(toDate(key)),
  );
}

/**
 * A day and a short month — "21 sept" — for a range whose two ends each need
 * their month, because a week can straddle two of them.
 */
export function shortDateLabel(key: string, locale: AppLocale): string {
  return dateFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(toDate(key));
}

/** The day of the month, which is what a picker's circles carry. */
export function dayNumber(key: string): string {
  return String(toDate(key).getDate());
}

/**
 * The whole day, spelled out — what a screen's header says today is.
 *
 * Capitalised on the way out because Spanish writes its weekdays and months
 * in lower case, and `Intl` is right to: "lunes, 21 de septiembre" is correct
 * prose. It is not correct as the opening of a line, which is what this is
 * used for, so the first letter is raised here rather than by a caller that
 * would have to know which locales need it.
 */
export function longDateLabel(key: string, locale: AppLocale): string {
  const text = dateFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(toDate(key));

  return capitalize(text);
}

/**
 * The month a displayed week belongs to, named after its Thursday.
 *
 * A week that straddles two months has to be filed under one of them, and
 * the ISO week — the same one `periodKey` snaps to — belongs to whichever
 * month holds its Thursday. Taking Monday's month instead would label the
 * last week of March as February in some years.
 */
export function weekMonthLabel(key: string, locale: AppLocale): string {
  const thursday = toDate(key);
  thursday.setDate(thursday.getDate() + 3);

  return capitalize(
    dateFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(thursday),
  );
}
