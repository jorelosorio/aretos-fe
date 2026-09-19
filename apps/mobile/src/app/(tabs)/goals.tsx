import { H1, YStack } from 'tamagui';

import { useTranslations } from '@/lib/i18n';

export default function MisMetas() {
  const { t } = useTranslations();

  return (
    <YStack flex={1} p="$4" gap="$2">
      <H1>{t('goals.title')}</H1>
    </YStack>
  );
}
