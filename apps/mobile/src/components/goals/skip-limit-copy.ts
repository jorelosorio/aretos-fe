/**
 * How the skip limit is worded for each cadence.
 *
 * A pause is one of the goal's own periods, so its unit follows the
 * frequency: days for a daily goal, weeks for a weekly one, check-ins for a
 * flexible one. The form's stepper, its hint and the explanation sheet all
 * read this map so the three never disagree on what "2" counts.
 */

import type { TrackingFrequency } from '@/features/goals/types';
import type { TranslateFn, TranslationKey } from '@/lib/i18n';

type SkipLimitCopy = {
  /** One line under the stepper. */
  hint: TranslationKey;
  /** What a pause is, for the explanation sheet. */
  pause: TranslationKey;
  one: TranslationKey;
  many: TranslationKey;
};

export const SKIP_LIMIT_COPY: Record<TrackingFrequency, SkipLimitCopy> = {
  daily: {
    hint: 'goals.skipLimit.dailyHint',
    pause: 'goals.skipLimit.dailyPause',
    one: 'goals.skipLimit.dayOne',
    many: 'goals.skipLimit.dayMany',
  },
  weekly: {
    hint: 'goals.skipLimit.weeklyHint',
    pause: 'goals.skipLimit.weeklyPause',
    one: 'goals.skipLimit.weekOne',
    many: 'goals.skipLimit.weekMany',
  },
  flexible: {
    hint: 'goals.skipLimit.flexibleHint',
    pause: 'goals.skipLimit.flexiblePause',
    one: 'goals.skipLimit.checkInOne',
    many: 'goals.skipLimit.checkInMany',
  },
};

/** The unit alone, singular or plural: "día", "semanas". */
export function skipUnit(
  t: TranslateFn,
  frequency: TrackingFrequency,
  count: number,
): string {
  const copy = SKIP_LIMIT_COPY[frequency];
  return t(count === 1 ? copy.one : copy.many);
}

/** A count with its unit: "1 día", "3 semanas". */
export function skipAmount(
  t: TranslateFn,
  frequency: TrackingFrequency,
  count: number,
): string {
  return `${count} ${skipUnit(t, frequency, count)}`;
}
