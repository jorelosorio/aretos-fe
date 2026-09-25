import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Pencil, Trash2 } from '@tamagui/lucide-icons-2';

import { ActionsMenu, type MenuAction } from '@/components/common/actions-menu';
import {
  useNoteErrorMessage,
  useRemoveNote,
  type DiaryNote,
} from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

export function NoteActionsMenu({
  note,
  onEdit,
}: {
  note: DiaryNote;
  onEdit: () => void;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useNoteErrorMessage();
  const { removeNote, isRemoving } = useRemoveNote();

  const remove = () =>
    Alert.alert(t('diary.deleteConfirm.title'), t('diary.deleteConfirm.body'), [
      { text: t('diary.deleteConfirm.cancel'), style: 'cancel' },
      {
        text: t('diary.deleteConfirm.confirm'),
        style: 'destructive',
        onPress: () =>
          void removeNote(note)
            .then(() => router.back())
            .catch((failure: unknown) =>
              Alert.alert(t('diary.errors.title'), toMessage(failure) ?? ''),
            ),
      },
    ]);

  const actions: MenuAction[] = [
    {
      key: 'edit',
      label: t('diary.viewer.edit'),
      Icon: Pencil,
      onPress: onEdit,
    },
    {
      key: 'delete',
      label: t('diary.viewer.delete'),
      Icon: Trash2,
      destructive: true,
      onPress: remove,
    },
  ];

  return (
    <ActionsMenu
      label={t('diary.viewer.actions')}
      actions={actions}
      disabled={isRemoving}
    />
  );
}
