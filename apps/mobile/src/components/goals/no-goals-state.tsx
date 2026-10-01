import { useRouter } from 'expo-router';
import { BookOpen } from '@tamagui/lucide-icons-2/icons/BookOpen';
import { Target } from '@tamagui/lucide-icons-2/icons/Target';

import { EmptyState } from '@/components/common/empty-state';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { useTranslations } from '@/lib/i18n';

export function NoGoalsState({ canCreate }: { canCreate: boolean }) {
  const { t } = useTranslations();
  const router = useRouter();

  return (
    <EmptyState
      Icon={Target}
      illustration={ILLUSTRATIONS.noGoals}
      title={t('goals.empty.title')}
      body={t('goals.empty.body')}
      action={
        canCreate
          ? {
              label: t('guide.start'),
              Icon: BookOpen,
              onPress: () => router.push('/guide'),
            }
          : undefined
      }
    />
  );
}
