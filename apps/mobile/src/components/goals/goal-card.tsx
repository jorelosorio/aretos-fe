import { ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Goal } from '@/features/goals';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { GoalDot } from './goal-dot';

const FREQUENCY_LABELS: Record<Goal['trackingFrequency'], TranslationKey> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};

export function GoalCard({
  goal,
  habitCount,
  onPress,
}: {
  goal: Goal;
  habitCount: number;
  onPress: () => void;
}) {
  const { t } = useTranslations();

  const actions = t(habitCount === 1 ? 'habits.countOne' : 'habits.countMany', {
    count: habitCount,
  });

  return (
    <XStack
      onPress={onPress}
      pressStyle={{ bg: '$muted' }}
      items="center"
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}. ${actions}`}
    >
      <YStack flex={1} gap={SPACING.text}>
        <XStack items="center" gap="$2">
          <GoalDot slot={goal.colorSlot} />
          <SizableText
            flex={1}
            size={TEXT.subheading}
            fontFamily="$heading"
            color="$cardForeground"
          >
            {goal.name}
          </SizableText>
        </XStack>

        {goal.description !== '' && (
          <Paragraph
            size={TEXT.body}
            color="$mutedForeground"
            numberOfLines={2}
          >
            {goal.description}
          </Paragraph>
        )}

        <XStack items="center" gap="$2">
          <SizableText size={TEXT.caption} color="$primary" fontWeight="600">
            {actions}
          </SizableText>
          <SizableText size={TEXT.caption} color="$mutedForeground">
            ·
          </SizableText>
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t(FREQUENCY_LABELS[goal.trackingFrequency])}
          </SizableText>
        </XStack>
      </YStack>

      <ChevronRight size={ICON.row} color="$mutedForeground" />
    </XStack>
  );
}
