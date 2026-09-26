/**
 * The glyph each tracking mode is drawn with.
 *
 * Shared because two places show a mode and must agree: the form's picker,
 * where it is chosen, and the habit card's chip, where it is read back. A
 * duration that is a clock in one and an hourglass in the other would read
 * as two different settings.
 */

import { CircleCheck, Clock, Hash, Star } from '@tamagui/lucide-icons-2';

import type { TrackingMode } from '@/features/habits';

export const MODE_ICONS: Record<TrackingMode, typeof CircleCheck> = {
  binary: CircleCheck,
  count: Hash,
  duration: Clock,
  rating: Star,
};
