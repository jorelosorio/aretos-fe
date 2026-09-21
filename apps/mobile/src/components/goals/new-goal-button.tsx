import { useRouter } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons-2';
import { Button } from 'tamagui';

import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

export function NewGoalButton() {
  const router = useRouter();
  const { t } = useTranslations();
  const canCreate = useAllowance('goal').canCreate;

  return (
    <Button
      size="$3"
      chromeless
      disabled={!canCreate}
      opacity={canCreate ? 1 : 0.5}
      onPress={() => router.push('/goals/new')}
      icon={<Plus size={22} color="$primary" />}
      accessibilityLabel={t('goals.new')}
    />
  );
}
