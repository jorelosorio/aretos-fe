import { memo } from 'react';
import { Lightbulb, Target, Weight } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { Chip, type ChipLeading } from '@/components/common/chip';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import type { Habit } from '@/features/habits';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { MODE_ICONS } from './mode-icons';
import { UNIT_LABELS } from './unit-labels';

const WEIGHT_BADGES: Record<number, TranslationKey> = {
  1: 'habits.weight.normalBadge',
  2: 'habits.weight.doubleBadge',
  3: 'habits.weight.tripleBadge',
};

const MODE_LABELS: Record<Habit['trackingMode'], TranslationKey> = {
  binary: 'habits.mode.binary',
  count: 'habits.mode.count',
  duration: 'habits.mode.duration',
  rating: 'habits.mode.rating',
};

const MARK = { size: ICON.inline, color: '$mutedForeground' } as const;

const MODE_MARKS: Record<Habit['trackingMode'], ChipLeading> = {
  binary: () => <MODE_ICONS.binary {...MARK} />,
  count: () => <MODE_ICONS.count {...MARK} />,
  duration: () => <MODE_ICONS.duration {...MARK} />,
  rating: () => <MODE_ICONS.rating {...MARK} />,
};

const targetMark: ChipLeading = () => <Target {...MARK} />;

const weightMark: ChipLeading = () => <Weight {...MARK} />;

export const HabitCard = memo(function HabitCard({
  habit,
  onOpen,
}: {
  habit: Habit;
  onOpen?: (habit: Habit) => void;
}) {
  const { t } = useTranslations();
  const unit = UNIT_LABELS[habit.trackingMode];

  const weight = WEIGHT_BADGES[habit.weight]
    ? t(WEIGHT_BADGES[habit.weight])
    : t('habits.weightBadge', { weight: habit.weight });

  return (
    <XStack
      onPress={onOpen === undefined ? undefined : () => onOpen(habit)}
      pressStyle={onOpen ? { bg: '$cardPress' } : undefined}
      items="center"
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
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
            leading={MODE_MARKS[habit.trackingMode]}
          />
          {habit.successThreshold !== null && unit && (
            <Chip
              label={t('habits.targetBadge', {
                target: habit.successThreshold,
                unit: t(unit),
              })}
              leading={targetMark}
            />
          )}
          <Chip label={weight} leading={weightMark} />
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
    </XStack>
  );
});
