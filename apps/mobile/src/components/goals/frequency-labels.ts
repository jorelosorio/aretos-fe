/**
 * How often a goal is tracked, as the label a person reads.
 *
 * Its own file because the goal card, the goal's detail screen and home's
 * status card all show it, and none of them owns it — three copies of this
 * map is three chances for "Semanal" to read differently on one of them.
 */

import type { Goal } from '@/features/goals';
import type { TranslationKey } from '@/lib/i18n';

export const FREQUENCY_LABELS: Record<
  Goal['trackingFrequency'],
  TranslationKey
> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};
