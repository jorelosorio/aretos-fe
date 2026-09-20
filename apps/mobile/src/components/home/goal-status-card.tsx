import { useTheme } from '@tamagui/core';
import { Check, ChevronRight } from '@tamagui/lucide-icons-2';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import { MoodFace } from '@/components/logs/mood-face';
import { slotColor } from '@/components/goals/slot-color';
import { SPACING } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import type { GoalStatus } from './today-status';
import { weekCells } from './week-days';
import { WeekStrip } from './week-strip';

const MOOD_FACE_SIZE = 32;

export function GoalStatusCard({
  status,
  onPress,
}: {
  status: GoalStatus;
  onPress: () => void;
}) {
  const { t } = useTranslations();
  const theme = useTheme();

  const { goal, log, weekLogs, habits, answered, total } = status;
  const logged = log !== undefined;
  const hasHabits = habits.length > 0;

  const cells = weekCells(goal, weekLogs);
  const loggedDays = cells.filter((cell) => cell.logged).length;

  return (
    <YStack
      onPress={onPress}
      pressStyle={{ bg: '$muted' }}
      gap={SPACING.group}
      p={SPACING.cardTight}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}. ${t(
        logged ? 'home.logged' : 'home.notLogged',
      )}. ${t('home.week.summary', { logged: loggedDays, total: cells.length })}`}
    >
      <XStack items="center" gap={SPACING.group}>
        <Circle size={8} bg={slotColor(goal.colorSlot)} />

        <SizableText
          flex={1}
          size="$4"
          fontFamily="$heading"
          color="$cardForeground"
          numberOfLines={1}
        >
          {goal.name}
        </SizableText>

        {log?.mood != null && (
          <MoodFace
            score={log.mood}
            size={MOOD_FACE_SIZE}
            color={theme.mutedForeground.val}
          />
        )}

        <ChevronRight size={16} color="$mutedForeground" />
      </XStack>

      <XStack items="center" gap={SPACING.group}>
        <XStack flex={1} items="center" gap="$1.5">
          {logged && <Check size={12} color="$primary" />}
          <SizableText
            size="$2"
            color={logged ? '$primary' : '$mutedForeground'}
            fontWeight={logged ? '600' : '400'}
            numberOfLines={1}
          >
            {t(logged ? 'home.logged' : 'home.notLogged')}
          </SizableText>

          {hasHabits && (
            <SizableText size="$2" color="$mutedForeground" numberOfLines={1}>
              {`· ${t('home.progress', { answered, total })}`}
            </SizableText>
          )}
        </XStack>

        {hasHabits ? (
          <WeekStrip goal={goal} logs={weekLogs} />
        ) : (
          <SizableText size="$2" color="$mutedForeground">
            {t('home.noHabits')}
          </SizableText>
        )}
      </XStack>
    </YStack>
  );
}
