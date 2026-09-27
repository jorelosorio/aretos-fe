import { memo } from 'react';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { SPACING, TEXT } from '@/constants/layout';
import type { Goal } from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

import { FREQUENCY_LABELS } from './frequency-labels';
import { GoalName } from './goal-name';

export const GoalCard = memo(function GoalCard({
  goal,
  habitCount,
  onOpen,
}: {
  goal: Goal;
  habitCount: number;
  onOpen: (goal: Goal) => void;
}) {
  const { t } = useTranslations();

  const actions = t(habitCount === 1 ? 'habits.countOne' : 'habits.countMany', {
    count: habitCount,
  });

  return (
    <Card
      row
      pressable
      items="center"
      onPress={() => onOpen(goal)}
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}. ${actions}`}
    >
      <YStack flex={1} gap={SPACING.text}>
        <GoalName slot={goal.colorSlot} name={goal.name} />

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
    </Card>
  );
});
