import { Check, Minus, Plus, X } from '@tamagui/lucide-icons-2';
import { Button, SizableText, XStack, YStack } from 'tamagui';

import { UNIT_LABELS } from '@/components/habits/unit-labels';
import { SPACING } from '@/constants/layout';
import type { Habit } from '@/features/habits';
import type { LogEntry } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

const COUNT_STEP = 1;
const DURATION_STEP = 5;
const DURATION_PRESETS = [15, 30, 60, 90];
const RATINGS = [1, 2, 3, 4, 5];

export type EntryPatch = Partial<Omit<LogEntry, 'habitId'>>;

function BinaryInput({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (patch: EntryPatch) => void;
}) {
  const { t } = useTranslations();

  const pick = (next: boolean) =>
    onChange({ done: value === next ? null : next });

  return (
    <XStack gap={SPACING.items}>
      <Button
        flex={1}
        size="$5"
        theme={value === true ? 'accent' : undefined}
        bg={value === true ? undefined : '$card'}
        borderColor={value === true ? undefined : '$border'}
        icon={value === true ? Check : undefined}
        onPress={() => pick(true)}
        accessibilityRole="radio"
        accessibilityState={{ selected: value === true }}
        accessibilityHint={t('logs.entry.clear')}
      >
        {t('logs.entry.done')}
      </Button>

      <Button
        flex={1}
        size="$5"
        bg={value === false ? '$muted' : '$card'}
        borderColor={value === false ? '$mutedForeground' : '$border'}
        icon={value === false ? X : undefined}
        onPress={() => pick(false)}
        accessibilityRole="radio"
        accessibilityState={{ selected: value === false }}
        accessibilityHint={t('logs.entry.clear')}
      >
        {t('logs.entry.notDone')}
      </Button>
    </XStack>
  );
}

function AmountInput({
  value,
  step,
  unit,
  presets,
  onChange,
}: {
  value: number | null;
  step: number;
  unit: string;
  presets?: readonly number[];
  onChange: (patch: EntryPatch) => void;
}) {
  const set = (amount: number | null) => onChange({ amount });
  const atZero = value === null || value <= 0;

  return (
    <YStack gap={SPACING.items}>
      <XStack
        items="center"
        justify="space-between"
        p="$2"
        bg="$card"
        rounded="$xl2"
        borderWidth={1}
        borderColor="$border"
      >
        <Button
          size="$4"
          circular
          chromeless
          disabled={atZero}
          opacity={atZero ? 0.4 : 1}
          onPress={() => set(value === null ? null : Math.max(0, value - step))}
          icon={<Minus size={20} color="$color" />}
          accessibilityLabel={`${unit} −`}
        />

        <SizableText
          size="$7"
          fontFamily="$heading"
          color={value === null ? '$mutedForeground' : '$cardForeground'}
        >
          {value === null ? '—' : `${value} ${unit}`}
        </SizableText>

        <Button
          size="$4"
          circular
          chromeless
          onPress={() => set((value ?? 0) + step)}
          icon={<Plus size={20} color="$color" />}
          accessibilityLabel={`${unit} +`}
        />
      </XStack>

      {presets && (
        <XStack gap={SPACING.text}>
          {presets.map((preset) => (
            <Button
              key={preset}
              flex={1}
              size="$3"
              chromeless
              bg={value === preset ? '$muted' : 'transparent'}
              color="$mutedForeground"
              onPress={() => set(value === preset ? null : preset)}
            >
              {String(preset)}
            </Button>
          ))}
        </XStack>
      )}
    </YStack>
  );
}

function RatingInput({
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
    <XStack gap={SPACING.text} accessibilityRole="radiogroup">
      {RATINGS.map((score) => {
        const selected = value === score;
        const meetsTarget = threshold !== null && score >= threshold;

        return (
          <YStack
            key={score}
            flex={1}
            height={56}
            items="center"
            justify="center"
            rounded="$xl"
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
              size="$6"
              fontFamily="$heading"
              color={selected ? '$primaryForeground' : '$cardForeground'}
            >
              {score}
            </SizableText>
          </YStack>
        );
      })}
    </XStack>
  );
}

export function EntryValueInput({
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
  const unit = unitKey ? t(unitKey) : '';

  switch (habit.trackingMode) {
    case 'binary':
      return <BinaryInput value={entry.done} onChange={onChange} />;
    case 'count':
      return (
        <AmountInput
          value={entry.amount}
          step={COUNT_STEP}
          unit={unit}
          onChange={onChange}
        />
      );
    case 'duration':
      return (
        <AmountInput
          value={entry.amount}
          step={DURATION_STEP}
          unit={unit}
          presets={DURATION_PRESETS}
          onChange={onChange}
        />
      );
    case 'rating':
      return (
        <RatingInput
          value={entry.amount}
          threshold={habit.successThreshold}
          onChange={onChange}
        />
      );
  }
}
