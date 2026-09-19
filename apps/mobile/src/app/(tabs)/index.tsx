import { Button, XStack, YStack } from 'tamagui';
import { ChartNoAxesColumn, Plus } from '@tamagui/lucide-icons-2';

import { useTranslations } from '@/lib/i18n';

export default function Inicio() {
  const { t } = useTranslations();

  return (
    <YStack flex={1} p="$4" gap="$2">
      <XStack gap="$3">
        <Button theme="accent" icon={Plus}>
          {t('home.logEntry')}
        </Button>
        <Button icon={ChartNoAxesColumn}>{t('home.viewProgress')}</Button>
      </XStack>
    </YStack>
  );
}
