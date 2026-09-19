import { ChevronRight } from '@tamagui/lucide-icons-2';
import { Circle, SizableText, XStack, YStack } from 'tamagui';

import type { Goal } from '@/features/goals';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { SPACING } from '@/constants/layout';

import { slotColor } from './slot-color';

const FREQUENCY_LABELS: Record<Goal['trackingFrequency'], TranslationKey> = {
  daily: 'goals.frequency.daily',
  weekly: 'goals.frequency.weekly',
  flexible: 'goals.frequency.flexible',
};

export function GoalCard({
  goal,
  onPress,
}: {
  goal: Goal;
  onPress: () => void;
}) {
  const { t } = useTranslations();

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
      accessibilityLabel={goal.name}
    >
      <Circle size={10} bg={slotColor(goal.colorSlot)} />

      <YStack flex={1} gap={SPACING.text}>
        <SizableText size="$5" fontFamily="$heading" color="$cardForeground">
          {goal.name}
        </SizableText>

        {goal.description !== '' && (
          <SizableText size="$3" color="$mutedForeground" numberOfLines={2}>
            {goal.description}
          </SizableText>
        )}

        <SizableText size="$2" color="$mutedForeground">
          {t(FREQUENCY_LABELS[goal.trackingFrequency])}
        </SizableText>
      </YStack>

      <ChevronRight size={18} color="$mutedForeground" />
    </XStack>
  );
}
