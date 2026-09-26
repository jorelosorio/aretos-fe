import { memo } from 'react';
import { ChevronRight, Flame } from '@tamagui/lucide-icons-2';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { CompletionStatus } from '@/components/goals/completion-status';
import { GoalDot } from '@/components/goals/goal-dot';
import {
  PERIOD_STATUS_COLORS,
  PERIOD_STATUS_LABELS,
} from '@/components/goals/period-status';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Goal, GoalProgress, PeriodStatus } from '@/features/goals';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { WeekStrip } from './week-strip';
import { WeekWindow } from './week-window';

const FREQUENCY_LABELS: Record<Goal['trackingFrequency'], TranslationKey> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};

const TRACK_HEIGHT = 6;

const STREAK_DAYS = {
  short: 'home.streaks.days',
  one: 'home.streaks.labelDay',
  many: 'home.streaks.labelDays',
  best: 'home.streaks.bestDays',
} as const satisfies Record<string, TranslationKey>;

const STREAK_WEEKS = {
  short: 'home.streaks.weeks',
  one: 'home.streaks.labelWeek',
  many: 'home.streaks.labelWeeks',
  best: 'home.streaks.bestWeeks',
} as const satisfies Record<string, TranslationKey>;

function StreakChip({ text }: { text: string }) {
  return (
    <XStack
      items="center"
      gap="$1"
      px="$2"
      py="$1"
      rounded="$lg"
      bg="$accentSurface"
    >
      <Flame size={ICON.inline} color="$primary" />
      <SizableText size={TEXT.caption} fontWeight="700" color="$primary">
        {text}
      </SizableText>
    </XStack>
  );
}

function ProgressTrack({
  answered,
  total,
  status,
}: {
  answered: number;
  total: number;
  status: PeriodStatus;
}) {
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <YStack
      height={TRACK_HEIGHT}
      rounded={TRACK_HEIGHT / 2}
      bg="$vizTrack"
      overflow="hidden"
    >
      {percent > 0 && (
        <YStack
          height={TRACK_HEIGHT}
          width={`${percent}%`}
          rounded={TRACK_HEIGHT / 2}
          bg={status === 'empty' ? '$primary' : PERIOD_STATUS_COLORS[status]}
        />
      )}
    </YStack>
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

  const context = `${t(
    goal.habitCount === 1 ? 'habits.countOne' : 'habits.countMany',
    { count: goal.habitCount },
  )} · ${t(FREQUENCY_LABELS[goal.trackingFrequency])}`;

  let action: string;
  if (goal.habitCount === 0) action = t('home.cta.addHabit');
  else if (logged) action = t('home.cta.edit');
  else action = t(weekly ? 'home.cta.logWeek' : 'home.cta.log');

  const streak = weekly ? STREAK_WEEKS : STREAK_DAYS;
  const hasStreak = currentStreak > 0;

  let note = '';
  if (hasStreak && currentStreak >= longestStreak) {
    note = t('home.streaks.bestNow');
  } else if (longestStreak > 0) {
    note = t(streak.best, { count: longestStreak });
  }

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
    ...(note !== '' ? [note] : []),
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
        <XStack items="flex-start" gap={SPACING.items}>
          <YStack flex={1} minW={0} gap={SPACING.text}>
            <XStack items="center" gap="$2">
              <GoalDot slot={goal.colorSlot} />
              <SizableText
                flex={1}
                size={TEXT.subheading}
                fontFamily="$heading"
                color="$cardForeground"
                numberOfLines={2}
              >
                {goal.name}
              </SizableText>
            </XStack>
            <SizableText
              size={TEXT.caption}
              color="$mutedForeground"
              numberOfLines={1}
            >
              {context}
            </SizableText>
          </YStack>

          {hasStreak && (
            <StreakChip text={t(streak.short, { count: currentStreak })} />
          )}
        </XStack>

        {hasHabits ? (
          <>
            <YStack gap={SPACING.group}>
              <CompletionStatus
                status={status}
                answered={answered}
                total={total}
              />

              <ProgressTrack
                answered={answered}
                total={total}
                status={status}
              />
            </YStack>

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

      <Separator borderColor="$border" />

      <XStack
        items="center"
        gap={SPACING.items}
        px={SPACING.card}
        py={SPACING.items}
      >
        <SizableText flex={1} size={TEXT.caption} color="$mutedForeground">
          {note}
        </SizableText>

        <XStack items="center" gap="$1">
          <SizableText size={TEXT.body} fontWeight="700" color="$primary">
            {action}
          </SizableText>
          <ChevronRight size={ICON.row} color="$primary" />
        </XStack>
      </XStack>
    </YStack>
  );
});
