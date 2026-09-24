import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Archive, ArchiveRestore, Trash2 } from '@tamagui/lucide-icons-2';

import { ActionsMenu } from '@/components/common/actions-menu';
import {
  useDeleteHabit,
  useHabitErrorMessage,
  useUpdateHabit,
} from '@/features/habits';
import { useTranslations } from '@/lib/i18n';

export function HabitActionsMenu({
  habitId,
  archived,
}: {
  habitId: string;
  archived: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useHabitErrorMessage();

  const { updateHabit, isUpdating } = useUpdateHabit();
  const { deleteHabit, isDeleting } = useDeleteHabit();

  const report = (error: unknown) =>
    Alert.alert(t('habits.errors.title'), toMessage(error) ?? '');

  const toggleArchived = () =>
    void updateHabit({ id: habitId, patch: { archived: !archived } })
      .then(() => router.back())
      .catch(report);

  const remove = () =>
    Alert.alert(t('habits.deleteConfirmTitle'), t('habits.deleteConfirmBody'), [
      { text: t('auth.cancel'), style: 'cancel' },
      {
        text: t('habits.delete'),
        style: 'destructive',
        onPress: () =>
          void deleteHabit(habitId)
            .then(() => router.back())
            .catch(report),
      },
    ]);

  return (
    <ActionsMenu
      label={t('habits.actions')}
      disabled={isUpdating || isDeleting}
      actions={[
        {
          key: 'archive',
          label: t(archived ? 'habits.restore' : 'habits.archive'),
          Icon: archived ? ArchiveRestore : Archive,
          onPress: toggleArchived,
        },
        {
          key: 'delete',
          label: t('habits.delete'),
          Icon: Trash2,
          destructive: true,
          onPress: remove,
        },
      ]}
    />
  );
}
