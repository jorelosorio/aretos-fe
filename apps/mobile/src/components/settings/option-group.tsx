import { Fragment } from 'react';
import { Check } from '@tamagui/lucide-icons-2';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

/**
 * The icon components' own type, taken off one of them because the package
 * declares it but does not export it. Redeclaring the shape here instead would
 * compile to a second, unrelated `IconComponent` that no real icon satisfies.
 */
type IconComponent = typeof Check;

export type Option<T extends string> = {
  value: T;
  label: string;
  Icon: IconComponent;
};

/**
 * A titled card of mutually exclusive choices — the settings equivalent of a
 * radio group, which is also how it reads to a screen reader.
 *
 * Generic over the value so each group keeps its own union: passing a theme
 * option to the language group is a type error rather than a runtime surprise.
 */
export function OptionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <YStack gap="$2">
      <SizableText
        size="$2"
        color="$mutedForeground"
        fontFamily="$body"
        fontWeight="600"
        letterSpacing={0.8}
        px="$2"
      >
        {title.toUpperCase()}
      </SizableText>

      <YStack
        bg="$card"
        rounded="$xl2"
        borderWidth={1}
        borderColor="$border"
        overflow="hidden"
      >
        {options.map((option, index) => {
          const selected = option.value === value;

          return (
            <Fragment key={option.value}>
              {/* Between rows only, so the card's own border is not doubled. */}
              {index > 0 && <Separator borderColor="$border" />}

              <XStack
                onPress={() => onChange(option.value)}
                pressStyle={{ bg: '$muted' }}
                items="center"
                gap="$3"
                px="$4"
                py="$3.5"
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
              >
                <option.Icon
                  size={20}
                  color={selected ? '$primary' : '$mutedForeground'}
                />
                <SizableText flex={1} size="$4" color="$cardForeground">
                  {option.label}
                </SizableText>
                {/* The only selection cue that survives a colourblind user or
                    a theme where primary and muted sit close together. */}
                {selected && <Check size={18} color="$primary" />}
              </XStack>
            </Fragment>
          );
        })}
      </YStack>
    </YStack>
  );
}
