import { useState, type ReactNode } from 'react';
import { SizableText, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';

const CARD_HORIZONTAL_PADDING = 18;

export function ChartCard({
  title,
  subtitle,
  footnote,
  children,
}: {
  title: string;
  subtitle?: string;
  footnote?: ReactNode;
  children: ReactNode | ((width: number) => ReactNode);
}) {
  const [width, setWidth] = useState(0);

  return (
    <YStack
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      p={SPACING.card}
      gap={SPACING.items}
      onLayout={(event) => {
        const measured = Math.round(
          event.nativeEvent.layout.width - 2 * CARD_HORIZONTAL_PADDING,
        );
        setWidth((current) => (current === measured ? current : measured));
      }}
    >
      <YStack gap={SPACING.text}>
        <SizableText size={TEXT.body} fontWeight="600" color="$cardForeground">
          {title}
        </SizableText>

        {subtitle !== undefined && (
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {subtitle}
          </SizableText>
        )}
      </YStack>

      {typeof children === 'function' ? width > 0 && children(width) : children}

      {footnote}
    </YStack>
  );
}
