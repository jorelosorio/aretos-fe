import type { ReactNode } from 'react';
import { SizableText } from 'tamagui';

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <SizableText size="$5" fontFamily="$heading" color="$color">
      {children}
    </SizableText>
  );
}
