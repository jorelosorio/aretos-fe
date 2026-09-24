import { Fragment } from 'react';
import { Check } from '@tamagui/lucide-icons-2';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';

import { SectionTitle } from './section-title';

type IconComponent = typeof Check;

export type Option<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  Icon: IconComponent;
};

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
    <YStack gap={SPACING.group}>
      <SectionTitle>{title}</SectionTitle>

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
              {index > 0 && <Separator borderColor="$border" />}

              <XStack
                onPress={() => onChange(option.value)}
                pressStyle={{ bg: '$muted' }}
                items="center"
                gap={SPACING.items}
                px={SPACING.card}
                py={SPACING.items}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                accessibilityHint={option.hint}
              >
                <option.Icon
                  size={20}
                  color={selected ? '$primary' : '$mutedForeground'}
                />

                <YStack flex={1} gap={SPACING.text}>
                  <SizableText size={TEXT.subheading} color="$cardForeground">
                    {option.label}
                  </SizableText>
                  {option.hint && (
                    <SizableText size={TEXT.caption} color="$mutedForeground">
                      {option.hint}
                    </SizableText>
                  )}
                </YStack>

                <YStack width={18} items="center">
                  {selected && <Check size={18} color="$primary" />}
                </YStack>
              </XStack>
            </Fragment>
          );
        })}
      </YStack>
    </YStack>
  );
}
