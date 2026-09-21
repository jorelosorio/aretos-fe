import { Check, Minus } from '@tamagui/lucide-icons-2';
import { Circle, XStack } from 'tamagui';

import { ICON } from '@/constants/layout';
import type { GoalPeriod, PeriodStatus } from '@/features/goals';

const STEP_SIZE = '$1';
const CURRENT_SIZE = '$1.5';
const CORE_SIZE = '$0.75';

const TRACK_FILL = '$outcomeBlank';
const TRACK_RING = '$vizAxis';
const UPCOMING_OPACITY = 0.6;

const RING = {
  complete: '$primary',
  partial: '$primary',
  missed: '$outcomeMissed',
  skipped: '$outcomeSkipped',
  empty: '$primary',
} as const satisfies Record<PeriodStatus, string>;

const GLYPH = {
  complete: Check,
  skipped: Minus,
} as const satisfies Partial<Record<PeriodStatus, unknown>>;

export function WeekStrip({
  periods,
  currentEntryDate,
}: {
  periods: readonly GoalPeriod[];
  currentEntryDate: string;
}) {
  return (
    <XStack items="center" gap="$1.5">
      {periods.map((period) => {
        const isCurrent = period.entryDate === currentEntryDate;
        const counted = period.countsForStreak;
        const hasStatusRing =
          !counted && (period.status !== 'empty' || isCurrent);
        const ink = counted ? '$primaryForeground' : RING[period.status];
        const Glyph =
          period.status === 'complete' || period.status === 'skipped'
            ? GLYPH[period.status]
            : null;

        return (
          <Circle
            key={period.entryDate}
            size={isCurrent ? CURRENT_SIZE : STEP_SIZE}
            items="center"
            justify="center"
            bg={counted ? '$primary' : TRACK_FILL}
            borderWidth={counted ? 0 : hasStatusRing ? 2 : 1}
            borderColor={hasStatusRing ? RING[period.status] : TRACK_RING}
            opacity={period.entryDate > currentEntryDate ? UPCOMING_OPACITY : 1}
          >
            {Glyph !== null && (
              <Glyph size={ICON.inline} color={ink} strokeWidth={3} />
            )}

            {period.status === 'partial' && (
              <Circle size={CORE_SIZE} bg={ink} />
            )}
          </Circle>
        );
      })}
    </XStack>
  );
}
