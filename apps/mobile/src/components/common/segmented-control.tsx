import type { Check } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { ICON } from '@/constants/layout';

type IconComponent = typeof Check;

export type Segment<T extends string> = {
  value: T;
  label: string;
  /** Stacks above the label. One segment carrying an icon stacks them all. */
  Icon?: IconComponent;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const stacked = segments.some((segment) => segment.Icon !== undefined);

  return (
    <XStack
      bg="$muted"
      rounded="$xl2"
      p={4}
      gap={4}
      accessibilityRole="tablist"
    >
      {segments.map((segment) => {
        const selected = segment.value === value;
        const ink = selected ? '$cardForeground' : '$mutedForeground';
        const Icon = segment.Icon;

        return (
          <YStack
            key={segment.value}
            flex={1}
            items="center"
            justify="center"
            gap="$1"
            py={stacked ? '$1.5' : '$2'}
            rounded="$xl"
            bg={selected ? '$card' : 'transparent'}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => onChange(segment.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={segment.label}
          >
            {Icon !== undefined && <Icon size={ICON.row} color={ink} />}

            <SizableText
              size={stacked ? '$2' : '$3'}
              fontWeight="600"
              color={ink}
              numberOfLines={1}
            >
              {segment.label}
            </SizableText>
          </YStack>
        );
      })}
    </XStack>
  );
}
