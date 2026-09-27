import type { ReactNode } from 'react';
import { YStack } from 'tamagui';

import { SPACING } from '@/constants/layout';

import { FormScrollView } from './form-scroll-view';

export function FormScreen({ children }: { children: ReactNode }) {
  return (
    <YStack flex={1} bg="$background">
      <FormScrollView>
        <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
          {children}
        </YStack>
      </FormScrollView>
    </YStack>
  );
}
