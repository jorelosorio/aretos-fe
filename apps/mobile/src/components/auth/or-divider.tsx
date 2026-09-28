import { Separator, SizableText, XStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function OrDivider() {
  const { t } = useTranslations();

  return (
    <XStack items="center" gap={SPACING.items}>
      <Separator flex={1} borderColor="$border" />
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {t('auth.sheet.or')}
      </SizableText>
      <Separator flex={1} borderColor="$border" />
    </XStack>
  );
}
