import { ChevronRight, Lightbulb } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';
import type { Habit } from '@/features/habits';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { UNIT_LABELS } from './unit-labels';

const WEIGHT_BADGES: Record<number, TranslationKey> = {
  2: 'habits.weight.doubleBadge',
  3: 'habits.weight.tripleBadge',
};

const MODE_LABELS: Record<Habit['trackingMode'], TranslationKey> = {
  binary: 'habits.mode.binary',
  count: 'habits.mode.count',
  duration: 'habits.mode.duration',
  rating: 'habits.mode.rating',
};

function Badge({ children }: { children: string }) {
  return (
    <XStack px="$2" py="$1" rounded="$lg" bg="$muted">
      <SizableText size="$1" color="$mutedForeground">
        {children}
      </SizableText>
    </XStack>
  );
}

export function HabitCard({
  habit,
  onPress,
}: {
  habit: Habit;
  onPress?: () => void;
}) {
  const { t } = useTranslations();
  const unit = UNIT_LABELS[habit.trackingMode];

  return (
    <XStack
      onPress={onPress}
      pressStyle={onPress ? { bg: '$muted' } : undefined}
      items="center"
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={habit.name}
    >
      <YStack flex={1} gap={SPACING.group}>
        <SizableText size="$4" fontFamily="$heading" color="$cardForeground">
          {habit.name}
        </SizableText>

        <XStack gap="$2" items="center" flexWrap="wrap">
          <Badge>{t(MODE_LABELS[habit.trackingMode])}</Badge>
          {habit.weight > 1 && (
            <Badge>
              {WEIGHT_BADGES[habit.weight]
                ? t(WEIGHT_BADGES[habit.weight])
                : t('habits.weightBadge', { weight: habit.weight })}
            </Badge>
          )}
          {habit.successThreshold !== null && unit && (
            <Badge>
              {t('habits.targetBadge', {
                target: habit.successThreshold,
                unit: t(unit),
              })}
            </Badge>
          )}
        </XStack>

        {habit.ifThenPlan !== '' && (
          <XStack gap="$2" items="flex-start">
            <Lightbulb size={13} color="$mutedForeground" mt={2} />
            <Paragraph flex={1} size={TEXT.caption} color="$mutedForeground">
              {habit.ifThenPlan}
            </Paragraph>
          </XStack>
        )}
      </YStack>

      {onPress && <ChevronRight size={18} color="$mutedForeground" />}
    </XStack>
  );
}
