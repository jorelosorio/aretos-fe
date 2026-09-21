import { Check, Minus } from '@tamagui/lucide-icons-2';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import { weekdayInitial } from '@/components/common/date-label';
import { ICON } from '@/constants/layout';
import type {
  GoalPeriod,
  PeriodStatus,
  TrackingFrequency,
} from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

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
  frequency,
}: {
  periods: readonly GoalPeriod[];
  currentEntryDate: string;
  frequency: TrackingFrequency;
}) {
  const { locale } = useTranslations();
  const byDay = frequency !== 'weekly';

  return (
    <XStack
      items="flex-end"
      justify={byDay ? 'space-between' : 'flex-start'}
      gap="$1"
    >
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
          <YStack
            key={period.entryDate}
            items="center"
            gap="$1"
            opacity={period.entryDate > currentEntryDate ? UPCOMING_OPACITY : 1}
          >
            {byDay && (
              <SizableText
                size="$1"
                fontWeight={isCurrent ? '700' : '400'}
                color={isCurrent ? '$color' : '$mutedForeground'}
              >
                {weekdayInitial(period.entryDate, locale)}
              </SizableText>
            )}

            <Circle
              size={isCurrent ? CURRENT_SIZE : STEP_SIZE}
              items="center"
              justify="center"
              bg={counted ? '$primary' : TRACK_FILL}
              borderWidth={counted ? 0 : hasStatusRing ? 2 : 1}
              borderColor={hasStatusRing ? RING[period.status] : TRACK_RING}
            >
              {Glyph !== null && (
                <Glyph size={ICON.inline} color={ink} strokeWidth={3} />
              )}

              {period.status === 'partial' && (
                <Circle size={CORE_SIZE} bg={ink} />
              )}
            </Circle>
          </YStack>
        );
      })}
    </XStack>
  );
}
