import { Check, Minus } from '@tamagui/lucide-icons-2';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import { dayNumber, weekdayInitial } from '@/components/common/date-label';
import { PeriodMood } from '@/components/logs/period-mood';
import { ICON, TEXT } from '@/constants/layout';
import type {
  GoalPeriod,
  PeriodStatus,
  TrackingFrequency,
} from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

const STEP_SIZE = '$1';
const MOOD_SIZE = 18;
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
  today,
  frequency,
}: {
  periods: readonly GoalPeriod[];
  currentEntryDate: string;
  today: string;
  frequency: TrackingFrequency;
}) {
  const { locale } = useTranslations();
  const byDay = frequency !== 'weekly';

  return (
    <XStack items="center" justify="flex-start" gap="$1">
      {periods.map((period) => {
        const isNow = byDay
          ? period.entryDate === today
          : period.entryDate === currentEntryDate;
        const counted = period.countsForStreak;
        const hasStatusRing = !counted && (period.status !== 'empty' || isNow);
        const ink = counted ? '$primaryForeground' : RING[period.status];
        const Glyph =
          period.status === 'complete' || period.status === 'skipped'
            ? GLYPH[period.status]
            : null;

        return (
          <YStack
            key={period.entryDate}
            flex={byDay ? 1 : undefined}
            flexBasis={byDay ? 0 : undefined}
            items="center"
            justify="center"
            gap="$1.5"
            px="$1"
            py="$2"
            rounded="$lg"
            bg={isNow ? '$muted' : 'transparent'}
            opacity={period.entryDate > currentEntryDate ? UPCOMING_OPACITY : 1}
          >
            {byDay && (
              <SizableText
                size={TEXT.micro}
                color={isNow ? '$color' : '$mutedForeground'}
              >
                {weekdayInitial(period.entryDate, locale)}
              </SizableText>
            )}

            <SizableText
              size={TEXT.caption}
              fontWeight={isNow ? '800' : '500'}
              color={isNow ? '$color' : '$mutedForeground'}
            >
              {dayNumber(period.entryDate)}
            </SizableText>

            <Circle
              size={STEP_SIZE}
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

            <PeriodMood mood={period.mood} size={MOOD_SIZE} active={isNow} />
          </YStack>
        );
      })}
    </XStack>
  );
}
