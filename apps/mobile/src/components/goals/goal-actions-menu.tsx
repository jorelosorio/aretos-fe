import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
} from '@tamagui/lucide-icons-2';

import { ActionsMenu, type MenuAction } from '@/components/common/actions-menu';
import {
  useDeleteGoal,
  useGoalErrorMessage,
  useUpdateGoal,
} from '@/features/goals';
import { useTranslations } from '@/lib/i18n';

export function GoalActionsMenu({
  goalId,
  archived,
}: {
  goalId: string;
  archived: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

  const { updateGoal, isUpdating } = useUpdateGoal();
  const { deleteGoal, isDeleting } = useDeleteGoal();

  const report = (error: unknown) =>
    Alert.alert(t('goals.errors.title'), toMessage(error) ?? '');

  const edit = () =>
    router.push({ pathname: '/goals/[id]/edit', params: { id: goalId } });

  const toggleArchived = () =>
    void updateGoal({ id: goalId, patch: { archived: !archived } })
      .then(() => router.back())
      .catch(report);

  const remove = () =>
    Alert.alert(t('goals.deleteConfirmTitle'), t('goals.deleteConfirmBody'), [
      { text: t('auth.cancel'), style: 'cancel' },
      {
        text: t('goals.delete'),
        style: 'destructive',
        onPress: () =>
          void deleteGoal(goalId)
            .then(() => router.back())
            .catch(report),
      },
    ]);

  const actions: MenuAction[] = [
    ...(archived
      ? []
      : [{ key: 'edit', label: t('goals.edit'), Icon: Pencil, onPress: edit }]),
    {
      key: 'archive',
      label: t(archived ? 'goals.restore' : 'goals.archive'),
      Icon: archived ? ArchiveRestore : Archive,
      onPress: toggleArchived,
    },
    {
      key: 'delete',
      label: t('goals.delete'),
      Icon: Trash2,
      destructive: true,
      onPress: remove,
    },
  ];

  return (
    <ActionsMenu
      label={t('goals.actions')}
      actions={actions}
      disabled={isUpdating || isDeleting}
    />
  );
}
