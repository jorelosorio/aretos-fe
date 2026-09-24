import type { ReactNode } from 'react';
import { SizableText } from 'tamagui';

import { TEXT } from '@/constants/layout';

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <SizableText size={TEXT.subheading} fontWeight="700" color="$color">
      {children}
    </SizableText>
  );
}
