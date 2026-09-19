import { SizableText, XStack } from 'tamagui';

export type Segment<T extends string> = {
  value: T;
  label: string;
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

        return (
          <XStack
            key={segment.value}
            flex={1}
            items="center"
            justify="center"
            py="$2"
            rounded="$xl"
            bg={selected ? '$card' : 'transparent'}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => onChange(segment.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={segment.label}
          >
            <SizableText
              size="$3"
              fontWeight="600"
              color={selected ? '$cardForeground' : '$mutedForeground'}
            >
              {segment.label}
            </SizableText>
          </XStack>
        );
      })}
    </XStack>
  );
}
