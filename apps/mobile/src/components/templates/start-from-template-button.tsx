import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { HeaderTextButton } from '@/components/common/header-actions';
import { useAllowance } from '@/features/limits/hooks';
import {
  useStartFromTemplate,
  useTemplateErrorMessage,
} from '@/features/templates/hooks';
import { useTranslations } from '@/lib/i18n';

export function StartFromTemplateButton({
  templateId,
}: {
  templateId: string;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useTemplateErrorMessage();
  const { canCreate } = useAllowance('goal');
  const { startFromTemplate, isStarting } = useStartFromTemplate();

  const start = () =>
    void startFromTemplate(templateId)
      .then((goalId) =>
        router.replace({ pathname: '/goals/[id]', params: { id: goalId } }),
      )
      .catch((failure: unknown) =>
        Alert.alert(t('templates.errors.title'), toMessage(failure) ?? ''),
      );

  return (
    <HeaderTextButton
      label={t('templates.startShort')}
      onPress={start}
      disabled={!canCreate}
      busy={isStarting}
    />
  );
}
