import { useState, type ReactNode } from 'react';
import { Info } from '@tamagui/lucide-icons-2/icons/Info';
import { X } from '@tamagui/lucide-icons-2/icons/X';
import { Button, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { ChartWidthContext } from './chart-width';

export function ChartCard({
  title,
  subtitle,
  why,
  children,
}: {
  title: string;
  subtitle?: string;
  why?: string;
  children: ReactNode;
}) {
  const { t } = useTranslations();
  const [width, setWidth] = useState(0);
  const [explaining, setExplaining] = useState(false);

  return (
    <Card>
      <XStack items="flex-start" gap={SPACING.group}>
        <YStack flex={1} minW={0} gap={SPACING.text}>
          <SizableText
            size={TEXT.subheading}
            fontWeight="700"
            color="$cardForeground"
          >
            {title}
          </SizableText>

          {subtitle !== undefined && (
            <SizableText size={TEXT.caption} color="$mutedForeground">
              {subtitle}
            </SizableText>
          )}
        </YStack>

        {why !== undefined && (
          <Button
            size={BUTTON.compact}
            circular
            chromeless
            mt={-4}
            mr={-8}
            onPress={() => setExplaining((open) => !open)}
            icon={
              explaining ? (
                <X size={ICON.row} color="$mutedForeground" />
              ) : (
                <Info size={ICON.row} color="$mutedForeground" />
              )
            }
            accessibilityLabel={t('analysis.why')}
            accessibilityState={{ expanded: explaining }}
          />
        )}
      </XStack>

      {why !== undefined && explaining && (
        <YStack bg="$accentSurface" rounded="$xl" p={SPACING.cardTight}>
          <SizableText size={TEXT.caption} color="$accentSurfaceForeground">
            {why}
          </SizableText>
        </YStack>
      )}

      <YStack
        gap={SPACING.items}
        onLayout={(event) => {
          const measured = Math.floor(event.nativeEvent.layout.width);
          setWidth((current) => (current === measured ? current : measured));
        }}
      >
        {width > 0 && (
          <ChartWidthContext value={width}>{children}</ChartWidthContext>
        )}
      </YStack>
    </Card>
  );
}
