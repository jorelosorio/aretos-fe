import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { XStack, type TamaguiElement } from 'tamagui';

import { AddFieldButton } from '@/components/common/add-field-button';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormInput, FormTextArea } from '@/components/common/form-field';
import { FormScreen } from '@/components/common/form-screen';
import { FormSection } from '@/components/common/form-section';
import { HeaderTextButton } from '@/components/common/header-actions';
import { GoalColorPicker } from '@/components/goals/goal-color-picker';
import { GoalSettingsFields } from '@/components/goals/goal-settings-fields';
import { useTagDraft } from '@/components/tags/tag-draft';
import { TagField } from '@/components/tags/tag-field';
import {
  useCreateGoal,
  useGoalErrorMessage,
  useUpdateGoal,
} from '@/features/goals/hooks';
import { toGoalPatch } from '@/features/goals/patch';
import type { GoalDraft } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

const NAME_MAX = 120;
const DESCRIPTION_MAX = 1000;

export function GoalForm({
  goalId,
  initial,
}: {
  goalId?: string;
  initial: GoalDraft;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useGoalErrorMessage();

  const { createGoal, isCreating, error: createError } = useCreateGoal();
  const { updateGoal, isUpdating, error: updateError } = useUpdateGoal();

  const [draft, setDraft] = useState(initial);
  const tags = useTagDraft(initial.tags);
  const [showDescription, setShowDescription] = useState(
    initial.description !== '',
  );
  const [showTags, setShowTags] = useState(initial.tags.length > 0);
  const [revealed, setRevealed] = useState<'description' | 'tags' | null>(null);
  const descriptionRef = useRef<TamaguiElement>(null);

  useEffect(() => {
    if (revealed === 'description') descriptionRef.current?.focus();
  }, [revealed]);

  const patch = (change: Partial<GoalDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const busy = isCreating || isUpdating;
  const name = draft.name.trim();

  async function save() {
    if (!name) return;

    const value: GoalDraft = {
      ...draft,
      name,
      tags: tags.value,
    };

    if (goalId) {
      await updateGoal({ id: goalId, patch: toGoalPatch(value, initial) })
        .then(() => router.back())
        .catch(() => undefined);
      return;
    }

    await createGoal(value)
      .then((goal) =>
        router.replace({ pathname: '/goals/[id]', params: { id: goal.id } }),
      )
      .catch(() => undefined);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderTextButton
              label={goalId ? t('goals.form.update') : t('goals.form.save')}
              onPress={save}
              disabled={!name}
              busy={busy}
            />
          ),
        }}
      />

      <FormScreen>
        <ErrorNotice message={toMessage(createError ?? updateError)} />

        <FormSection title={t('goals.form.name')}>
          <FormInput
            accessibilityLabel={t('goals.form.name')}
            value={draft.name}
            onChangeText={(value) => patch({ name: value })}
            placeholder={t('goals.form.namePlaceholder')}
            maxLength={NAME_MAX}
            autoFocus={!goalId}
          />
        </FormSection>

        <GoalColorPicker
          value={draft.colorSlot}
          onChange={(slot) => patch({ colorSlot: slot })}
        />

        {showDescription && (
          <FormSection title={t('goals.form.description')}>
            <FormTextArea
              accessibilityLabel={t('goals.form.description')}
              value={draft.description}
              onChangeText={(value) => patch({ description: value })}
              placeholder={t('goals.form.descriptionPlaceholder')}
              maxLength={DESCRIPTION_MAX}
              ref={descriptionRef}
            />
          </FormSection>
        )}

        {showTags && (
          <TagField
            draft={tags}
            label={t('goals.form.tags')}
            autoFocus={revealed === 'tags'}
          />
        )}

        {(!showDescription || !showTags) && (
          <XStack gap="$2" flexWrap="wrap">
            {!showDescription && (
              <AddFieldButton
                label={t('goals.form.addDescription')}
                accessibilityLabel={t('goals.form.addDescriptionLabel')}
                onPress={() => {
                  setShowDescription(true);
                  setRevealed('description');
                }}
              />
            )}
            {!showTags && (
              <AddFieldButton
                label={t('goals.form.addTags')}
                accessibilityLabel={t('goals.form.addTagsLabel')}
                onPress={() => {
                  setShowTags(true);
                  setRevealed('tags');
                }}
              />
            )}
          </XStack>
        )}

        <GoalSettingsFields
          value={draft}
          initialSkipLimit={initial.streakSkipLimit}
          onChange={patch}
        />
      </FormScreen>
    </>
  );
}
