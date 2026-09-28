import { Button, YStack } from 'tamagui';

import { FormHint } from '@/components/common/form-section';
import { BUTTON, SPACING } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function ComingSoonSubmit({ label }: { label: string }) {
  const { t } = useTranslations();

  return (
    <YStack gap={SPACING.group}>
      <Button size={BUTTON.primary} theme="accent" disabled opacity={0.5}>
        {label}
      </Button>
      <FormHint text="center">{t('auth.sheet.comingSoon')}</FormHint>
    </YStack>
  );
}
