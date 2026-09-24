import { SizableText, XStack, YStack, type ColorTokens } from 'tamagui';

import { slotColor } from '@/components/goals/slot-color';
import { TEXT } from '@/constants/layout';
import type { Goal } from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

function Chip({
  label,
  selected,
  dot,
  onPress,
}: {
  label: string;
  selected: boolean;
  dot?: ColorTokens;
  onPress: () => void;
}) {
  return (
    <XStack
      items="center"
      gap="$1.5"
      px="$3"
      py="$2"
      rounded="$xl2"
      bg={selected ? '$primary' : '$muted'}
      pressStyle={{ opacity: 0.7 }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {dot !== undefined && (
        <YStack
          width={8}
          height={8}
          rounded={4}
          bg={selected ? '$primaryForeground' : dot}
        />
      )}

      <SizableText
        size={TEXT.caption}
        fontWeight="600"
        color={selected ? '$primaryForeground' : '$mutedForeground'}
      >
        {label}
      </SizableText>
    </XStack>
  );
}

export function ScopeFilter({
  goals,
  value,
  onChange,
}: {
  goals: readonly Goal[];
  value: string | null;
  onChange: (goalId: string | null) => void;
}) {
  const { t } = useTranslations();

  if (goals.length === 0) return null;

  return (
    <XStack flexWrap="wrap" gap="$2">
      <Chip
        label={t('analysis.scope.all')}
        selected={value === null}
        onPress={() => onChange(null)}
      />

      {goals.map((goal) => (
        <Chip
          key={goal.id}
          label={goal.name}
          dot={slotColor(goal.colorSlot)}
          selected={value === goal.id}
          onPress={() => onChange(goal.id)}
        />
      ))}
    </XStack>
  );
}
