import { Fragment, type ReactNode } from 'react';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { SPACING, TEXT } from '@/constants/layout';

export type Row = {
  label: string;
  onPress: () => void;
  trailing: ReactNode;
};

export function RowGroup({
  title,
  rows,
}: {
  title: string;
  rows: readonly Row[];
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
        {rows.map((row, index) => (
          <Fragment key={row.label}>
            {index > 0 && <Separator borderColor="$border" />}

            <XStack
              onPress={row.onPress}
              pressStyle={{ bg: '$muted' }}
              items="center"
              gap={SPACING.items}
              px={SPACING.card}
              py={SPACING.items}
              accessibilityRole="button"
              accessibilityLabel={row.label}
            >
              <SizableText
                flex={1}
                size={TEXT.subheading}
                color="$cardForeground"
              >
                {row.label}
              </SizableText>

              {row.trailing}
            </XStack>
          </Fragment>
        ))}
      </YStack>
    </YStack>
  );
}
