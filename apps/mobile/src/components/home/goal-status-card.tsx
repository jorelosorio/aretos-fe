import { memo } from 'react';
import { Flame, Plus, SquarePen, Trophy } from '@tamagui/lucide-icons-2';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import { CompletionStatus } from '@/components/goals/completion-status';
import { GoalDot } from '@/components/goals/goal-dot';
import { PERIOD_STATUS_LABELS } from '@/components/goals/period-status';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Goal, GoalProgress } from '@/features/goals';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { WeekStrip } from './week-strip';
import { WeekWindow } from './week-window';

const FREQUENCY_LABELS: Record<Goal['trackingFrequency'], TranslationKey> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};

const ACTION_SIZE = 28;

const STREAK_DAYS = {
  short: 'home.streaks.days',
  one: 'home.streaks.labelDay',
  many: 'home.streaks.labelDays',
} as const satisfies Record<string, TranslationKey>;

const STREAK_WEEKS = {
  short: 'home.streaks.weeks',
  one: 'home.streaks.labelWeek',
  many: 'home.streaks.labelWeeks',
} as const satisfies Record<string, TranslationKey>;

function StreakChip({ text, record }: { text: string; record: boolean }) {
  return (
    <XStack
      shrink={0}
      items="center"
      gap="$1"
      px="$2"
      py="$1"
      rounded="$lg"
      bg="$accentSurface"
    >
      {record && <Trophy size={ICON.inline} color="$primary" />}
      <Flame size={ICON.inline} color="$primary" />
      <SizableText
        size={TEXT.caption}
        fontWeight="700"
        color="$primary"
        numberOfLines={1}
      >
        {text}
      </SizableText>
    </XStack>
  );
}

export const GoalStatusCard = memo(function GoalStatusCard({
  goal,
  progress,
  onOpen,
}: {
  goal: Goal;
  progress: GoalProgress;
  onOpen: (goal: Goal) => void;
}) {
  const { t } = useTranslations();

  const { currentPeriod, currentStreak, longestStreak, daysLeft } = progress;
  const { mood, status, answered, total, logged } = currentPeriod;

  const weekly = goal.trackingFrequency === 'weekly';
  const hasHabits = total > 0;

  const cadence = t(FREQUENCY_LABELS[goal.trackingFrequency]);
  const context = `${t(
    goal.habitCount === 1 ? 'habits.countOne' : 'habits.countMany',
    { count: goal.habitCount },
  )} · ${cadence}`;

  let action: string;
  if (goal.habitCount === 0) action = t('home.cta.addHabit');
  else if (logged) action = t('home.cta.edit');
  else action = t(weekly ? 'home.cta.logWeek' : 'home.cta.log');
  const ActionIcon = goal.habitCount === 0 ? Plus : SquarePen;

  const streak = weekly ? STREAK_WEEKS : STREAK_DAYS;
  const hasStreak = currentStreak > 0;

  const isRecord = currentStreak > 1 && currentStreak >= longestStreak;

  const label = [
    goal.name,
    context,
    ...(hasStreak
      ? [
          t(currentStreak === 1 ? streak.one : streak.many, {
            count: currentStreak,
          }),
        ]
      : []),
    ...(hasHabits
      ? [
          t(PERIOD_STATUS_LABELS[status]),
          t('goals.progress', { answered, total }),
        ]
      : [t('home.noHabits')]),
    ...(mood != null ? [t(MOOD_LABELS[mood])] : []),
    ...(isRecord ? [t('home.streaks.bestNow')] : []),
  ].join('. ');

  return (
    <YStack
      onPress={() => onOpen(goal)}
      pressStyle={{ bg: '$cardPress' }}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      overflow="hidden"
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={action}
    >
      <YStack gap={SPACING.items} p={SPACING.card}>
        <YStack gap={SPACING.text}>
          <XStack items="center" gap={SPACING.items}>
            <XStack flex={1} minW={0} items="center" gap="$2">
              <GoalDot slot={goal.colorSlot} />
              <SizableText
                flex={1}
                size={TEXT.subheading}
                fontWeight="700"
                color="$cardForeground"
                numberOfLines={2}
              >
                {goal.name}
              </SizableText>
            </XStack>

            <XStack shrink={0} items="center" gap="$2">
              {hasStreak && (
                <StreakChip
                  text={t(streak.short, { count: currentStreak })}
                  record={isRecord}
                />
              )}

              <Circle size={ACTION_SIZE} bg="$muted">
                <ActionIcon size={ICON.inline} color="$primary" />
              </Circle>
            </XStack>
          </XStack>

          {hasHabits ? (
            <CompletionStatus
              status={status}
              answered={answered}
              total={total}
              detail={`${t(
                total === 1 ? 'habits.progressOne' : 'habits.progressMany',
                { answered, total },
              )} · ${cadence}`}
            />
          ) : (
            <SizableText
              size={TEXT.caption}
              color="$mutedForeground"
              numberOfLines={1}
            >
              {context}
            </SizableText>
          )}
        </YStack>

        {hasHabits ? (
          <>
            {weekly ? (
              <WeekWindow
                entryDate={currentPeriod.entryDate}
                endDate={currentPeriod.endDate}
                daysLeft={daysLeft}
                mood={mood}
              />
            ) : (
              <WeekStrip
                periods={progress.periods}
                currentEntryDate={currentPeriod.entryDate}
                today={progress.today}
                frequency={goal.trackingFrequency}
              />
            )}
          </>
        ) : (
          <SizableText size={TEXT.body} color="$mutedForeground">
            {t('home.noHabits')}
          </SizableText>
        )}
      </YStack>
    </YStack>
  );
});
