import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TemplateForm } from '@/components/templates/template-form';
import {
  useTemplate,
  useTemplateErrorMessage,
} from '@/features/templates/hooks';
import { useTranslations } from '@/lib/i18n';

export default function EditTemplate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: template, error } = useTemplate(id);
  const toMessage = useTemplateErrorMessage();
  const { t } = useTranslations();

  if (error) return <ErrorNotice message={toMessage(error)} />;
  if (!template) return <ScreenLoader />;
  if (!template.owned) {
    return <ErrorNotice message={t('templates.errors.notFound')} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: template.name }} />

      <TemplateForm
        templateId={template.id}
        reviewed={
          template.review?.status === 'approved' && !template.publisher.official
        }
        initial={{
          name: template.name,
          description: template.description,
          language: template.language,
          trackingFrequency: template.trackingFrequency,
          streakRule: template.streakRule,
          streakThreshold: template.streakThreshold,
          streakSkipLimit: template.streakSkipLimit,
          habits: template.habits,
        }}
      />
    </>
  );
}
