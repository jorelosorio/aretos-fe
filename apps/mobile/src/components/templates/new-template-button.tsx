import { useRouter } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';

import { HeaderIconButton } from '@/components/common/header-actions';
import { useAllowance } from '@/features/limits/hooks';
import { useTranslations } from '@/lib/i18n';

export function NewTemplateButton() {
  const { t } = useTranslations();
  const router = useRouter();
  const { canCreate } = useAllowance('template');

  return (
    <HeaderIconButton
      Icon={Plus}
      tone="$primary"
      label={t('templates.new')}
      disabled={!canCreate}
      onPress={() => router.push('/templates/new')}
    />
  );
}
