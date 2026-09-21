/**
 * What each point on the 1-5 scale is called.
 *
 * Its own file because the faces are drawn in two places that share nothing
 * else: the picker, where the two ends of the scale are printed under the
 * row and the rest are spoken, and the diary card, where the face is marked
 * hidden and this is all a screen reader gets — so a missing label would make
 * the mood invisible rather than merely unlabelled.
 */

import type { MoodScore } from '@/features/logs';
import type { TranslationKey } from '@/lib/i18n';

export const MOOD_LABELS: Record<MoodScore, TranslationKey> = {
  1: 'logs.mood.scale.1',
  2: 'logs.mood.scale.2',
  3: 'logs.mood.scale.3',
  4: 'logs.mood.scale.4',
  5: 'logs.mood.scale.5',
};
