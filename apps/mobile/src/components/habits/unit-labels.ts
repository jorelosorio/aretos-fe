/**
 * What a habit's logged number is counted in, by tracking mode.
 *
 * `binary` has no unit because it has no number — it is done or it is not.
 *
 * Its own file because three screens now render the same value and none of
 * them owns it: the habit card, the check-in's input, and the diary, where an
 * answer is read back long after it was given. A bare `45` means nothing
 * without "min" beside it, and three copies of this map is three chances for
 * one of them to drift.
 */

import type { TrackingMode } from '@/features/habits';
import type { TranslationKey } from '@/lib/i18n';

export const UNIT_LABELS: Record<TrackingMode, TranslationKey | null> = {
  binary: null,
  count: 'habits.unit.count',
  duration: 'habits.unit.duration',
  rating: 'habits.unit.rating',
};
