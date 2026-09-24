import { useRouter } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons-2';

import { HeaderIconButton } from '@/components/common/header-actions';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

export function NewHabitButton({ goalId }: { goalId: string }) {
  const { t } = useTranslations();
  const router = useRouter();
  const { canCreate } = useAllowance('habit');

  return (
    <HeaderIconButton
      Icon={Plus}
      tone="$primary"
      label={t('habits.new')}
      disabled={!canCreate}
      onPress={() =>
        router.push({
          pathname: '/goals/[id]/habits/new',
          params: { id: goalId },
        })
      }
    />
  );
}
