import { Flame } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { ICON, SPACING } from '@/constants/layout';
import type { Goal } from '@/features/goals';
import type { MoodScore } from '@/features/logs';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { GoalMark } from './goal-mark';
import type { GoalStatus } from './today-status';
import { weekCells } from './week-days';
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
  status,
  streak,
  onPress,
}: {
  status: GoalStatus;
  streak: number;
  onPress: () => void;
}) {
  const { t } = useTranslations();

  const { goal, log, weekLogs, habits, answered, total } = status;
  const logged = log !== undefined;

  const context = `${t(total === 1 ? 'habits.countOne' : 'habits.countMany', {
    count: total,
  })} · ${t(FREQUENCY_LABELS[goal.trackingFrequency])}`;

  const cells = weekCells(goal, habits, weekLogs);
  const loggedDays = cells.filter((cell) => cell.logged).length;
  const completeDays = cells.filter(
    (cell) => cell.status === 'complete',
  ).length;

  const label = [
    goal.name,
    context,
    t(logged ? 'home.logged' : 'home.notLogged'),
    ...(total > 0 ? [t('home.progress', { answered, total })] : []),
    streak === 0
      ? t('home.streaks.none')
      : t('home.streaks.label', { count: streak }),
    ...(log?.mood != null ? [t(MOOD_LABELS[log.mood])] : []),
    t('home.week.summary', { logged: loggedDays, total: cells.length }),
    t('home.week.complete', { count: completeDays }),
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
        <GoalMark colorSlot={goal.colorSlot} mood={log?.mood} />

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
              color={streak === 0 ? '$mutedForeground' : '$primary'}
            />

            <SizableText
              size="$2"
              fontWeight="600"
              color={streak === 0 ? '$mutedForeground' : '$primary'}
            >
              {t('home.streaks.days', { count: streak })}
            </SizableText>
          </XStack>

          <YStack mt="$2">
            {habits.length > 0 ? (
              <WeekStrip cells={cells} />
            ) : (
              <SizableText size="$1" color="$mutedForeground">
                {t('home.noHabits')}
              </SizableText>
            )}
          </YStack>
        </YStack>
      </XStack>
    </YStack>
  );
}
