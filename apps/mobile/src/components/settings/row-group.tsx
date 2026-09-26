import { Fragment, type ReactNode } from 'react';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { SPACING, TEXT } from '@/constants/layout';

export type Row = {
  label: string;
  onPress: () => void;
  trailing: ReactNode;
  disabled?: boolean;
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
              onPress={row.disabled ? undefined : row.onPress}
              pressStyle={row.disabled ? undefined : { bg: '$cardPress' }}
              opacity={row.disabled ? 0.6 : 1}
              accessibilityState={{ disabled: row.disabled === true }}
              items="center"
              gap={SPACING.items}
              px={SPACING.card}
              py={SPACING.items}
              accessibilityRole="button"
              accessibilityLabel={row.label}
            >
              <SizableText flex={1} size={TEXT.body} color="$cardForeground">
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
