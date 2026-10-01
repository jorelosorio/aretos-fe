import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye } from '@tamagui/lucide-icons-2/icons/Eye';
import { EyeOff } from '@tamagui/lucide-icons-2/icons/EyeOff';
import { Pencil } from '@tamagui/lucide-icons-2/icons/Pencil';
import { Trash2 } from '@tamagui/lucide-icons-2/icons/Trash2';

import { ActionsMenu, type MenuAction } from '@/components/common/actions-menu';
import {
  useDeleteTemplate,
  useTemplateErrorMessage,
  useUpdateTemplate,
} from '@/features/templates/hooks';
import { useTranslations } from '@/lib/i18n';

export function TemplateActionsMenu({
  templateId,
  active,
}: {
  templateId: string;
  active: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useTemplateErrorMessage();

  const { updateTemplate, isUpdating } = useUpdateTemplate();
  const { deleteTemplate, isDeleting } = useDeleteTemplate();

  const report = (error: unknown) =>
    Alert.alert(t('templates.errors.title'), toMessage(error) ?? '');

  const edit = () =>
    router.push({
      pathname: '/templates/[id]/edit',
      params: { id: templateId },
    });

  const toggleShared = () =>
    void updateTemplate({
      id: templateId,
      patch: { active: !active },
    }).catch(report);

  const remove = () =>
    Alert.alert(
      t('templates.deleteConfirmTitle'),
      t('templates.deleteConfirmBody'),
      [
        { text: t('auth.cancel'), style: 'cancel' },
        {
          text: t('templates.delete'),
          style: 'destructive',
          onPress: () =>
            void deleteTemplate(templateId)
              .then(() => router.back())
              .catch(report),
        },
      ],
    );

  const actions: MenuAction[] = [
    { key: 'edit', label: t('templates.edit'), Icon: Pencil, onPress: edit },
    {
      key: 'share',
      label: t(active ? 'templates.unshare' : 'templates.share'),
      Icon: active ? EyeOff : Eye,
      onPress: toggleShared,
    },
    {
      key: 'delete',
      label: t('templates.delete'),
      Icon: Trash2,
      destructive: true,
      onPress: remove,
    },
  ];

  return (
    <ActionsMenu
      label={t('templates.actions')}
      actions={actions}
      disabled={isUpdating || isDeleting}
    />
  );
}
