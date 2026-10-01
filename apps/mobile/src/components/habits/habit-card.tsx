import { memo } from 'react';
import { Lightbulb } from '@tamagui/lucide-icons-2/icons/Lightbulb';
import { Target } from '@tamagui/lucide-icons-2/icons/Target';
import { Weight } from '@tamagui/lucide-icons-2/icons/Weight';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { Chip } from '@/components/common/chip';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Habit } from '@/features/habits/types';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { MODE_ICONS } from './mode-icons';
import { UNIT_LABELS } from './unit-labels';

const WEIGHT_BADGES: Record<number, TranslationKey> = {
  1: 'habits.weight.normalBadge',
  2: 'habits.weight.doubleBadge',
  3: 'habits.weight.tripleBadge',
};

export type HabitSummary = Pick<
  Habit,
  'name' | 'trackingMode' | 'weight' | 'successThreshold' | 'ifThenPlan'
>;

const MODE_LABELS: Record<Habit['trackingMode'], TranslationKey> = {
  binary: 'habits.mode.binary',
  count: 'habits.mode.count',
  duration: 'habits.mode.duration',
  rating: 'habits.mode.rating',
};

function HabitCardBase<T extends HabitSummary>({
  habit,
  onOpen,
}: {
  habit: T;
  onOpen?: (habit: T) => void;
}) {
  const { t } = useTranslations();
  const unit = UNIT_LABELS[habit.trackingMode];

  const weight = WEIGHT_BADGES[habit.weight]
    ? t(WEIGHT_BADGES[habit.weight])
    : t('habits.weightBadge', { weight: habit.weight });

  return (
    <Card
      row
      onPress={onOpen === undefined ? undefined : () => onOpen(habit)}
      pressable={onOpen !== undefined}
      items="center"
      accessibilityRole={onOpen ? 'button' : undefined}
      accessibilityLabel={habit.name}
    >
      <YStack flex={1} gap={SPACING.group}>
        <SizableText
          size={TEXT.subheading}
          fontWeight="700"
          color="$cardForeground"
        >
          {habit.name}
        </SizableText>

        <XStack gap="$1.5" items="center" flexWrap="wrap">
          <Chip
            label={t(MODE_LABELS[habit.trackingMode])}
            Icon={MODE_ICONS[habit.trackingMode]}
          />
          {habit.successThreshold !== null && unit && (
            <Chip
              label={t('habits.targetBadge', {
                target: habit.successThreshold,
                unit: t(unit),
              })}
              Icon={Target}
            />
          )}
          <Chip label={weight} Icon={Weight} />
        </XStack>

        {habit.ifThenPlan !== '' && (
          <XStack gap="$2" items="flex-start">
            <Lightbulb size={ICON.inline} color="$mutedForeground" mt={2} />
            <Paragraph flex={1} size={TEXT.caption} color="$mutedForeground">
              {habit.ifThenPlan}
            </Paragraph>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}

export const HabitCard = memo(HabitCardBase) as typeof HabitCardBase;
