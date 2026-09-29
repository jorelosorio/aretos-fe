import { useState } from 'react';
import { CircleDashed } from '@tamagui/lucide-icons-2/icons/CircleDashed';
import { Lightbulb } from '@tamagui/lucide-icons-2/icons/Lightbulb';
import { RotateCcw } from '@tamagui/lucide-icons-2/icons/RotateCcw';
import { Button, Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { UNIT_LABELS } from '@/components/habits/unit-labels';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';
import type { Habit } from '@/features/habits/types';
import { outcomeOf } from '@/features/logs/outcome';
import type { LogEntry } from '@/features/logs/types';
import { useTranslations } from '@/lib/i18n';

import { completionAmount, stepFor } from './entry-actions';
import { InlineEntryInput, type EntryPatch } from './entry-value-input';
import { OutcomeRail } from './outcome-rail';

export function HabitTrackRow({
  habit,
  entry,
  isFirst,
  isLast,
  onChange,
  onToggleSkip,
}: {
  habit: Habit;
  entry: LogEntry;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: EntryPatch) => void;
  onToggleSkip: () => void;
}) {
  const { t } = useTranslations();
  const [planOpen, setPlanOpen] = useState(false);

  const outcome = outcomeOf(habit, entry);
  const measured = habit.trackingMode !== 'binary';
  const steps =
    habit.trackingMode === 'count' || habit.trackingMode === 'duration';

  const unitKey = UNIT_LABELS[habit.trackingMode];
  const target =
    habit.successThreshold === null || unitKey === null
      ? null
      : t('logs.entry.target', {
          target: habit.successThreshold,
          unit: t(unitKey),
        });

  const meta = [
    target,
    habit.weight > 1 ? t('habits.weightBadge', { weight: habit.weight }) : null,
  ]
    .filter((part) => part !== null)
    .join(' · ');

  const cycleBinary = () =>
    onChange({ done: entry.done === null ? true : entry.done ? false : null });

  const markPress = () => {
    if (entry.skipped) {
      onToggleSkip();
      return;
    }
    if (!measured) {
      cycleBinary();
      return;
    }
    onChange({ amount: outcome === 'done' ? null : completionAmount(habit) });
  };

  const rowPress = () => {
    if (!measured) {
      cycleBinary();
      return;
    }
    onChange({ amount: (entry.amount ?? 0) + stepFor(habit.trackingMode) });
  };

  const tappable = !entry.skipped && (steps || !measured);
  const tapHint = measured ? 'logs.tap.amount' : 'logs.tap.done';

  return (
    <XStack gap="$2">
      <OutcomeRail
        outcome={outcome}
        label={`${habit.name}. ${t(`logs.outcome.${outcome}`)}`}
        isFirst={isFirst}
        isLast={isLast}
        onPress={markPress}
      />

      <Card
        flex={1}
        gap={SPACING.text}
        mb={isLast ? 0 : SPACING.items}
        density="tight"
        opacity={entry.skipped ? 0.65 : 1}
      >
        <XStack items="center" gap={SPACING.items}>
          <YStack
            flex={1}
            gap={SPACING.text}
            onPress={tappable ? rowPress : undefined}
            pressStyle={tappable ? { opacity: 0.6 } : undefined}
            accessibilityRole={tappable ? 'button' : undefined}
            accessibilityLabel={tappable ? habit.name : undefined}
            accessibilityHint={tappable ? t(tapHint) : undefined}
          >
            <SizableText
              size={TEXT.subheading}
              fontWeight="700"
              color="$cardForeground"
              numberOfLines={2}
            >
              {habit.name}
            </SizableText>

            {meta !== '' && (
              <SizableText size={TEXT.micro} color="$mutedForeground">
                {meta}
              </SizableText>
            )}
          </YStack>

          {entry.skipped ? (
            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t('logs.outcome.skipped')}
            </SizableText>
          ) : (
            <InlineEntryInput habit={habit} entry={entry} onChange={onChange} />
          )}

          <Button
            size={BUTTON.compact}
            circular
            bg={entry.skipped ? '$card' : '$muted'}
            borderWidth={1}
            borderColor={entry.skipped ? '$primary' : '$border'}
            pressStyle={{ bg: '$border' }}
            onPress={onToggleSkip}
            icon={
              entry.skipped ? (
                <RotateCcw size={ICON.row} color="$primary" />
              ) : (
                <CircleDashed size={ICON.row} color="$mutedForeground" />
              )
            }
            accessibilityLabel={t(
              entry.skipped ? 'logs.entry.unskip' : 'logs.entry.skip',
            )}
          />
        </XStack>

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
              <Lightbulb size={ICON.inline} color="$mutedForeground" />
              <SizableText size={TEXT.micro} color="$mutedForeground">
                {t('logs.entry.plan')}
              </SizableText>
            </XStack>

            {planOpen && (
              <Paragraph
                size={TEXT.caption}
                color="$mutedForeground"
                p={SPACING.items}
                bg="$muted"
                rounded="$lg"
              >
                {habit.ifThenPlan}
              </Paragraph>
            )}
          </YStack>
        )}
      </Card>
    </XStack>
  );
}
