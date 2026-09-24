import { Flame } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { CompletionStatus } from '@/components/goals/completion-status';
import { PERIOD_STATUS_LABELS } from '@/components/goals/period-status';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Goal, GoalProgress } from '@/features/goals';
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
    ...(total > 0 ? [t('goals.progress', { answered, total })] : []),
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
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('home.openCheckIn')}
    >
      <YStack gap={SPACING.text}>
        <SizableText
          size={TEXT.subheading}
          fontFamily="$heading"
          color="$cardForeground"
          numberOfLines={2}
        >
          {goal.name}
        </SizableText>

        <XStack items="center" gap="$1.5">
          <SizableText
            shrink={1}
            size={TEXT.caption}
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
            size={TEXT.caption}
            fontWeight="600"
            color={hasStreak ? '$primary' : '$mutedForeground'}
          >
            {t('home.streaks.days', { count: currentStreak })}
          </SizableText>
        </XStack>

        {total > 0 && (
          <CompletionStatus status={status} answered={answered} total={total} />
        )}
      </YStack>

      {total > 0 ? (
        <WeekStrip
          periods={progress.periods}
          currentEntryDate={currentPeriod.entryDate}
          today={progress.today}
          frequency={goal.trackingFrequency}
        />
      ) : (
        <SizableText size={TEXT.micro} color="$mutedForeground">
          {t('home.noHabits')}
        </SizableText>
      )}
    </YStack>
  );
}
