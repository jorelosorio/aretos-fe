import { useState } from 'react';
import { Ban, Lightbulb, Undo2 } from '@tamagui/lucide-icons-2';
import {
  Button,
  Circle,
  Paragraph,
  SizableText,
  XStack,
  YStack,
} from 'tamagui';

import { SPACING } from '@/constants/layout';
import type { Habit } from '@/features/habits';
import { OUTCOME_COLORS, outcomeOf, type LogEntry } from '@/features/logs';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { EntryValueInput, type EntryPatch } from './entry-value-input';

const UNIT_LABELS: Record<Habit['trackingMode'], TranslationKey | null> = {
  binary: null,
  count: 'habits.unit.count',
  duration: 'habits.unit.duration',
  rating: 'habits.unit.rating',
};

export function HabitEntryCard({
  habit,
  entry,
  onChange,
  onToggleSkip,
}: {
  habit: Habit;
  entry: LogEntry;
  onChange: (patch: EntryPatch) => void;
  onToggleSkip: () => void;
}) {
  const { t } = useTranslations();
  const [planOpen, setPlanOpen] = useState(false);

  const unitKey = UNIT_LABELS[habit.trackingMode];
  const target =
    habit.successThreshold === null || unitKey === null
      ? null
      : t('logs.entry.target', {
          target: habit.successThreshold,
          unit: t(unitKey),
        });

  return (
    <YStack
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      opacity={entry.skipped ? 0.6 : 1}
    >
      <XStack items="flex-start" gap={SPACING.items}>
        <Circle
          size={10}
          bg={OUTCOME_COLORS[outcomeOf(habit, entry)]}
          mt="$2"
        />

        <YStack flex={1} gap={SPACING.text}>
          <SizableText size="$5" fontFamily="$heading" color="$cardForeground">
            {habit.name}
          </SizableText>

          <XStack items="center" gap="$2" flexWrap="wrap">
            {entry.skipped ? (
              <SizableText size="$2" color="$mutedForeground">
                {t('logs.entry.skipped')}
              </SizableText>
            ) : (
              <>
                {target && (
                  <SizableText size="$2" color="$mutedForeground">
                    {target}
                  </SizableText>
                )}
                {habit.weight > 1 && (
                  <SizableText size="$2" color="$mutedForeground">
                    {t('habits.weightBadge', { weight: habit.weight })}
                  </SizableText>
                )}
              </>
            )}
          </XStack>
        </YStack>

        <Button
          size="$3"
          circular
          chromeless
          onPress={onToggleSkip}
          icon={
            entry.skipped ? (
              <Undo2 size={18} color="$mutedForeground" />
            ) : (
              <Ban size={18} color="$mutedForeground" />
            )
          }
          accessibilityLabel={t(
            entry.skipped ? 'logs.entry.unskip' : 'logs.entry.skip',
          )}
        />
      </XStack>

      {!entry.skipped && (
        <EntryValueInput habit={habit} entry={entry} onChange={onChange} />
      )}

      {!entry.skipped && habit.ifThenPlan !== '' && (
        <YStack gap={SPACING.text}>
          <XStack
            items="center"
            gap="$2"
            onPress={() => setPlanOpen((open) => !open)}
            pressStyle={{ opacity: 0.7 }}
            accessibilityRole="button"
            accessibilityState={{ expanded: planOpen }}
            accessibilityLabel={t('logs.entry.plan')}
          >
            <Lightbulb size={14} color="$mutedForeground" />
            <SizableText size="$2" color="$mutedForeground">
              {t('logs.entry.plan')}
            </SizableText>
          </XStack>

          {planOpen && (
            <Paragraph
              size="$2"
              color="$mutedForeground"
              p="$3"
              bg="$muted"
              rounded="$lg"
            >
              {habit.ifThenPlan}
            </Paragraph>
          )}
        </YStack>
      )}
    </YStack>
  );
}
