import { styled, YStack } from 'tamagui';

import { SPACING } from '@/constants/layout';

export const Card = styled(YStack, {
  name: 'Card',
  bg: '$card',
  rounded: '$xl2',
  p: SPACING.card,
  gap: SPACING.items,

  variants: {
    row: {
      true: { flexDirection: 'row' },
    },
    density: {
      regular: { p: SPACING.card },
      tight: { p: SPACING.cardTight },
      flush: { p: 0, gap: 0, overflow: 'hidden' },
    },
    pressable: {
      true: { pressStyle: { bg: '$cardPress' } },
    },
  } as const,
});
