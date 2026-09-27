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
import { fromDateKey } from '@/utils/date-key';
import { capitalize } from '@/utils/text';

/** One letter, for a strip with seven columns and no room for more. */
export function weekdayInitial(key: string, locale: AppLocale): string {
  return capitalize(
    dateFormat(locale, { weekday: 'narrow' }).format(fromDateKey(key)),
  );
}

/** The weekday's short name, for a strip that can afford three letters. */
export function weekdayLabel(key: string, locale: AppLocale): string {
  return capitalize(
    dateFormat(locale, { weekday: 'short' }).format(fromDateKey(key)),
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
  }).format(fromDateKey(key));
}

/**
 * "Thu, Sep 24" — enough to place a day without spelling it out, for a
 * pill that should read at a glance rather than as a sentence.
 */
export function mediumDateLabel(key: string, locale: AppLocale): string {
  return capitalize(
    dateFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(fromDateKey(key)),
  );
}

/** The day of the month, which is what a picker's circles carry. */
export function dayNumber(key: string): string {
  return String(fromDateKey(key).getDate());
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
  }).format(fromDateKey(key));

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
  const thursday = fromDateKey(key);
  thursday.setDate(thursday.getDate() + 3);

  return capitalize(
    dateFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(thursday),
  );
}

/** "Septiembre de <year>", for a month standing on its own line. */
export function monthLabel(month: string, locale: AppLocale): string {
  return capitalize(
    dateFormat(locale, { month: 'long', year: 'numeric' }).format(
      fromDateKey(`${month}-01`),
    ),
  );
}
