import { Paragraph, styled } from 'tamagui';

import { TEXT } from '@/constants/layout';

export const BodyText = styled(Paragraph, {
  name: 'BodyText',
  size: TEXT.body,

  variants: {
    tone: {
      content: { color: '$cardForeground' },
      muted: { color: '$mutedForeground' },
    },
  } as const,

  defaultVariants: {
    tone: 'content',
  },
});
