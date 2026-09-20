import type { ReactNode } from 'react';
import { SizableText, XStack } from 'tamagui';

import { SPACING } from '@/constants/layout';

export function HomeSection({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <XStack items="center" gap={SPACING.items}>
      <SizableText
        flex={1}
        size="$5"
        fontFamily="$heading"
        color="$color"
        numberOfLines={1}
      >
        {title}
      </SizableText>

      {children}
    </XStack>
  );
}
