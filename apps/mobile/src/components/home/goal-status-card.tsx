import {
  Check,
  CircleDashed,
  CircleDot,
  Flame,
  Minus,
  X,
} from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import {
  PERIOD_STATUS_COLORS,
  PERIOD_STATUS_LABELS,
} from '@/components/goals/period-status';
import { ICON, SPACING } from '@/constants/layout';
import type { Goal, GoalProgress, PeriodStatus } from '@/features/goals';
import type { MoodScore } from '@/features/logs';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { WeekStrip } from './week-strip';

const FREQUENCY_LABELS: Record<Goal['trackingFrequency'], TranslationKey> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};

const MOOD_LABELS: Record<MoodScore, TranslationKey> = {
  1: 'logs.mood.scale.1',
  2: 'logs.mood.scale.2',
  3: 'logs.mood.scale.3',
  4: 'logs.mood.scale.4',
  5: 'logs.mood.scale.5',
};

const STATUS_GLYPHS = {
  complete: Check,
  partial: CircleDot,
  missed: X,
  skipped: Minus,
  empty: CircleDashed,
} as const satisfies Record<PeriodStatus, unknown>;

function StatusColumn({
  status,
  answered,
  total,
}: {
  status: PeriodStatus;
  answered: number;
  total: number;
}) {
  const { t } = useTranslations();

  const Glyph = STATUS_GLYPHS[status];
  const color =
    status === 'empty' ? '$mutedForeground' : PERIOD_STATUS_COLORS[status];

  return (
    <YStack items="flex-end" gap={SPACING.text}>
      <XStack items="center" gap="$1.5">
        <Glyph size={ICON.inline} color={color} strokeWidth={2.5} />

        <SizableText size="$2" color={color} numberOfLines={1}>
          {t(PERIOD_STATUS_LABELS[status])}
        </SizableText>
      </XStack>

      <SizableText size="$2" fontWeight="600" color="$mutedForeground">
        {t('home.progress', { answered, total })}
      </SizableText>
    </YStack>
  );
}

export function GoalStatusCard({
  goal,
  progress,
  onPress,
}: {
  goal: Goal;
  progress: GoalProgress;
  onPress: () => void;
}) {
  const { t } = useTranslations();

  const { currentPeriod, currentStreak } = progress;
  const { mood, status, answered, total } = currentPeriod;
  const hasStreak = currentStreak > 0;

  const context = `${t(total === 1 ? 'habits.countOne' : 'habits.countMany', {
    count: total,
  })} · ${t(FREQUENCY_LABELS[goal.trackingFrequency])}`;

  const completeCount = progress.periods.filter(
    (period) => period.status === 'complete',
  ).length;

  const countedCount = progress.periods.filter(
    (period) => period.countsForStreak,
  ).length;

  const label = [
    goal.name,
    context,
    t(PERIOD_STATUS_LABELS[status]),
    ...(total > 0 ? [t('home.progress', { answered, total })] : []),
    hasStreak
      ? t('home.streaks.label', { count: currentStreak })
      : t('home.streaks.none'),
    ...(mood != null ? [t(MOOD_LABELS[mood])] : []),
    t('home.week.summary', {
      complete: completeCount,
      total: progress.periods.length,
    }),
    t('home.week.counted', { count: countedCount }),
  ].join('. ');

  return (
    <YStack
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      onPress={onPress}
      pressStyle={{ bg: '$muted' }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <XStack items="flex-start" gap={SPACING.items}>
        <YStack flex={1} gap={SPACING.text}>
          <SizableText
            size="$5"
            fontFamily="$heading"
            color="$cardForeground"
            numberOfLines={2}
          >
            {goal.name}
          </SizableText>

          <XStack items="center" gap="$1.5">
            <SizableText
              shrink={1}
              size="$2"
              color="$mutedForeground"
              numberOfLines={1}
            >
              {`${context} ·`}
            </SizableText>

            <Flame
              size={ICON.inline}
              color={hasStreak ? '$primary' : '$mutedForeground'}
            />

            <SizableText
              size="$2"
              fontWeight="600"
              color={hasStreak ? '$primary' : '$mutedForeground'}
            >
              {t('home.streaks.days', { count: currentStreak })}
            </SizableText>
          </XStack>
        </YStack>

        {total > 0 && (
          <StatusColumn status={status} answered={answered} total={total} />
        )}
      </XStack>

      {total > 0 ? (
        <WeekStrip
          periods={progress.periods}
          currentEntryDate={currentPeriod.entryDate}
          frequency={goal.trackingFrequency}
        />
      ) : (
        <SizableText size="$1" color="$mutedForeground">
          {t('home.noHabits')}
        </SizableText>
      )}
    </YStack>
  );
}
