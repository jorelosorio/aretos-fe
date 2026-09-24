import { useRouter } from 'expo-router';
import { X } from '@tamagui/lucide-icons-2';

import { useTranslations } from '@/lib/i18n';

import { HeaderIconButton } from './header-actions';

export function CloseButton({ label }: { label?: string }) {
  const router = useRouter();
  const { t } = useTranslations();

  return (
    <HeaderIconButton
      Icon={X}
      label={label ?? t('logs.close')}
      onPress={() => router.back()}
    />
  );
}
