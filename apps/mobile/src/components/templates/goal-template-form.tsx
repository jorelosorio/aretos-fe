import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Copy } from '@tamagui/lucide-icons-2/icons/Copy';

import { ErrorNotice } from '@/components/common/error-notice';
import { FormInput } from '@/components/common/form-field';
import { FormScreen } from '@/components/common/form-screen';
import { FormSection } from '@/components/common/form-section';
import { HeaderTextButton } from '@/components/common/header-actions';
import { Notice } from '@/components/common/notice';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { PlanLimitNotice } from '@/components/goals/plan-limit-notice';
import { useAllowance } from '@/features/limits/hooks';
import {
  useTemplateErrorMessage,
  useTemplateFromGoal,
} from '@/features/templates/hooks';
import {
  TEMPLATE_LANGUAGES,
  type TemplateLanguage,
} from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

import { LANGUAGE_NAMES } from './template-labels';

const NAME_MAX = 120;

export function GoalTemplateForm({
  goalId,
  goalName,
}: {
  goalId: string;
  goalName: string;
}) {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const toMessage = useTemplateErrorMessage();
  const allowance = useAllowance('template');

  const { templateFromGoal, isExporting, error } = useTemplateFromGoal();

  const [name, setName] = useState(goalName);
  const [language, setLanguage] = useState<TemplateLanguage>(locale);

  const languages: readonly Segment<TemplateLanguage>[] =
    TEMPLATE_LANGUAGES.map((code) => ({
      value: code,
      label: LANGUAGE_NAMES[code],
    }));

  const blocked = !allowance.canCreate;
  const trimmed = name.trim();

  const save = () => {
    if (trimmed === '' || blocked) return;

    void templateFromGoal({ goalId, value: { language, name: trimmed } })
      .then((template) =>
        router.replace({
          pathname: '/templates/[id]',
          params: { id: template.id },
        }),
      )
      .catch(() => undefined);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderTextButton
              label={t('templates.form.save')}
              onPress={save}
              disabled={trimmed === '' || blocked}
              busy={isExporting}
            />
          ),
        }}
      />

      <FormScreen>
        <ErrorNotice message={toMessage(error)} />

        <PlanLimitNotice allowance={allowance} resource="template" />

        <Notice
          Icon={Copy}
          title={t('templates.form.fromGoalNoticeTitle')}
          body={t('templates.form.fromGoalNoticeBody')}
        />

        <FormSection title={t('templates.form.name')}>
          <FormInput
            accessibilityLabel={t('templates.form.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('templates.form.namePlaceholder')}
            maxLength={NAME_MAX}
          />
        </FormSection>

        <FormSection
          title={t('templates.language.title')}
          hint={t('templates.language.hint')}
        >
          <SegmentedControl
            segments={languages}
            value={language}
            onChange={setLanguage}
          />
        </FormSection>
      </FormScreen>
    </>
  );
}
