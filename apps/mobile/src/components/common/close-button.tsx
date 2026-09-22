import { useRouter } from 'expo-router';
import { X } from '@tamagui/lucide-icons-2';
import { Button } from 'tamagui';

import { ICON } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function CloseButton({ label }: { label?: string }) {
  const router = useRouter();
  const { t } = useTranslations();

  return (
    <Button
      size="$3"
      circular
      chromeless
      onPress={() => router.back()}
      icon={<X size={ICON.row} color="$color" />}
      accessibilityLabel={label ?? t('logs.close')}
    />
  );
}
