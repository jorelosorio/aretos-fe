import { H1, YStack } from 'tamagui';

import { useTranslations } from '@/i18n';

export default function Diario() {
  const { t } = useTranslations();

  return (
    <YStack flex={1} p="$4" gap="$2">
      <H1>{t('diary.title')}</H1>
    </YStack>
  );
}
