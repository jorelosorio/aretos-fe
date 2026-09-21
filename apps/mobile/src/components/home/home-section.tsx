import type { ReactNode } from 'react';
import { XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
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
      <YStack flex={1} minW={0}>
        <SectionTitle>{title}</SectionTitle>
      </YStack>

      {children}
    </XStack>
  );
}
