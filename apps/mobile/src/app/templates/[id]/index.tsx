import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { HeaderActions } from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TemplateActionsMenu } from '@/components/templates/template-actions-menu';
import { TemplateDetail } from '@/components/templates/template-detail';
import { StartFromTemplateButton } from '@/components/templates/start-from-template-button';
import { TemplateOwnerPill } from '@/components/templates/template-owner-pill';
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
          headerTitleAlign: 'center',
          headerTitle: () => <TemplateOwnerPill template={template} />,
          headerRight: () => (
            <HeaderActions>
              <StartFromTemplateButton templateId={template.id} />
              {template.owned && (
                <TemplateActionsMenu
                  templateId={template.id}
                  active={template.active}
                />
              )}
            </HeaderActions>
          ),
        }}
      />

      <TemplateDetail template={template} />
    </>
  );
}
