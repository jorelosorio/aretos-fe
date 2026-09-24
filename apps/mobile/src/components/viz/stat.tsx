import type { ReactNode } from 'react';
import { SizableText, YStack, type ColorTokens } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';

export type StatTone = 'good' | 'watch' | 'neutral';

const TONE_COLOR = {
  good: '$good',
  watch: '$warning',
  neutral: '$cardForeground',
} as const satisfies Record<StatTone, ColorTokens>;

export function Stat({
  label,
  value,
  tone = 'neutral',
  reading,
}: {
  label: string;
  value: string;
  tone?: StatTone;
  reading?: ReactNode;
}) {
  return (
    <YStack gap={SPACING.text}>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {label}
      </SizableText>

      <SizableText
        size={TEXT.display}
        fontWeight="700"
        color={TONE_COLOR[tone]}
      >
        {value}
      </SizableText>

      {reading !== undefined && (
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {reading}
        </SizableText>
      )}
    </YStack>
  );
}
