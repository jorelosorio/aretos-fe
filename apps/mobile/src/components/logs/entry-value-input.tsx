import { Minus, Plus } from '@tamagui/lucide-icons-2';
import { Button, Circle, SizableText, XStack } from 'tamagui';

import { UNIT_LABELS } from '@/components/habits/unit-labels';
import type { Habit } from '@/features/habits';
import type { LogEntry } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { stepFor } from './entry-actions';

const RATINGS = [1, 2, 3, 4, 5];
const PIP = 26;

export type EntryPatch = Partial<Omit<LogEntry, 'habitId'>>;

function AmountPill({
  value,
  step,
  unit,
  onChange,
}: {
  value: number | null;
  step: number;
  unit: string;
  onChange: (patch: EntryPatch) => void;
}) {
  const atZero = value === null || value <= 0;
  const set = (amount: number | null) => onChange({ amount });

  return (
    <XStack
      items="center"
      gap="$1"
      p="$1"
      bg="$muted"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <Button
        size="$2"
        circular
        chromeless
        disabled={atZero}
        opacity={atZero ? 0.35 : 1}
        onPress={() => set(value === null ? null : Math.max(0, value - step))}
        icon={<Minus size={14} color="$color" />}
        accessibilityLabel={`${unit} −`}
      />

      <SizableText
        size="$2"
        fontFamily="$heading"
        minW={52}
        text="center"
        color={value === null ? '$mutedForeground' : '$cardForeground'}
      >
        {value === null ? '—' : `${value} ${unit}`}
      </SizableText>

      <Button
        size="$2"
        circular
        chromeless
        onPress={() => set((value ?? 0) + step)}
        icon={<Plus size={14} color="$color" />}
        accessibilityLabel={`${unit} +`}
      />
    </XStack>
  );
}

function RatingPips({
  value,
  threshold,
  onChange,
}: {
  value: number | null;
  threshold: number | null;
  onChange: (patch: EntryPatch) => void;
}) {
  const { t } = useTranslations();

  return (
    <XStack gap="$1" accessibilityRole="radiogroup">
      {RATINGS.map((score) => {
        const selected = value === score;
        const meetsTarget = threshold !== null && score >= threshold;

        return (
          <Circle
            key={score}
            size={PIP}
            bg={selected ? '$primary' : '$card'}
            borderWidth={1}
            borderColor={
              selected
                ? '$primary'
                : meetsTarget
                  ? '$mutedForeground'
                  : '$border'
            }
            pressStyle={{ opacity: 0.7 }}
            onPress={() => onChange({ amount: selected ? null : score })}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={String(score)}
            accessibilityHint={t('logs.entry.clear')}
          >
            <SizableText
              size="$2"
              fontFamily="$heading"
              color={selected ? '$primaryForeground' : '$cardForeground'}
            >
              {score}
            </SizableText>
          </Circle>
        );
      })}
    </XStack>
  );
}

export function InlineEntryInput({
  habit,
  entry,
  onChange,
}: {
  habit: Habit;
  entry: LogEntry;
  onChange: (patch: EntryPatch) => void;
}) {
  const { t } = useTranslations();
  const unitKey = UNIT_LABELS[habit.trackingMode];

  if (habit.trackingMode === 'binary') return null;

  if (habit.trackingMode === 'rating') {
    return (
      <RatingPips
        value={entry.amount}
        threshold={habit.successThreshold}
        onChange={onChange}
      />
    );
  }

  return (
    <AmountPill
      value={entry.amount}
      step={stepFor(habit.trackingMode)}
      unit={unitKey ? t(unitKey) : ''}
      onChange={onChange}
    />
  );
}
