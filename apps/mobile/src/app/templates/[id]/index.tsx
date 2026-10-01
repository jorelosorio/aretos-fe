import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TemplateActionsMenu } from '@/components/templates/template-actions-menu';
import { TemplateDetail } from '@/components/templates/template-detail';
import {
  useTemplate,
  useTemplateErrorMessage,
} from '@/features/templates/hooks';

export default function TemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: template, error } = useTemplate(id);
  const toMessage = useTemplateErrorMessage();

  if (error) return <ErrorNotice message={toMessage(error)} />;
  if (!template) return <ScreenLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: template.owned
            ? () => (
                <TemplateActionsMenu
                  templateId={template.id}
                  active={template.active}
                />
              )
            : undefined,
        }}
      />

      <TemplateDetail template={template} />
    </>
  );
}
