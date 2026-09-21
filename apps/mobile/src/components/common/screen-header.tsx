import type { ReactNode } from 'react';
import { YStack } from 'tamagui';

import { useHeaderMetrics } from './header-metrics';

export function ScreenHeader({ children }: { children: ReactNode }) {
  const { height, titleTop } = useHeaderMetrics();

  return (
    <YStack minH={height} pt={titleTop}>
      {children}
    </YStack>
  );
}
