import { SizableText, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function NotEnoughData({ need }: { need: string }) {
  const { t } = useTranslations();

  return (
    <YStack
      bg="$muted"
      rounded="$xl"
      p={SPACING.cardTight}
      gap={SPACING.text}
      justify="center"
    >
      <SizableText
        size={TEXT.caption}
        fontWeight="600"
        color="$mutedForeground"
      >
        {t('analysis.notEnough.title')}
      </SizableText>

      <SizableText size={TEXT.caption} color="$mutedForeground">
        {t('analysis.notEnough.body', { need })}
      </SizableText>
    </YStack>
  );
}
