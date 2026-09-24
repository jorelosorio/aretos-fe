import { useRouter } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons-2';

import { HeaderIconButton } from '@/components/common/header-actions';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

export function NewGoalButton() {
  const { t } = useTranslations();
  const router = useRouter();
  const { canCreate } = useAllowance('goal');

  return (
    <HeaderIconButton
      Icon={Plus}
      tone="$primary"
      label={t('goals.new')}
      disabled={!canCreate}
      onPress={() => router.push('/goals/new')}
    />
  );
}
