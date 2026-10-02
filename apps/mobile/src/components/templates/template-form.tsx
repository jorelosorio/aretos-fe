import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ListChecks } from '@tamagui/lucide-icons-2/icons/ListChecks';
import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';
import { RotateCcw } from '@tamagui/lucide-icons-2/icons/RotateCcw';
import { XStack, YStack, type TamaguiElement } from 'tamagui';

import { AddFieldButton } from '@/components/common/add-field-button';
import { EmptySlot } from '@/components/common/empty-slot';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormInput, FormTextArea } from '@/components/common/form-field';
import { FormScreen } from '@/components/common/form-screen';
import { FormSection } from '@/components/common/form-section';
import { HeaderTextButton } from '@/components/common/header-actions';
import { Notice } from '@/components/common/notice';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { GoalSettingsFields } from '@/components/goals/goal-settings-fields';
import { PlanLimitNotice } from '@/components/goals/plan-limit-notice';
import { HabitCard } from '@/components/habits/habit-card';
import { SPACING } from '@/constants/layout';
import { useAllowance } from '@/features/limits/hooks';
import {
  useCreateTemplate,
  useTemplateErrorMessage,
  useUpdateTemplate,
} from '@/features/templates/hooks';
import { toTemplatePatch } from '@/features/templates/patch';
import {
  TEMPLATE_HABITS_MAX,
  TEMPLATE_LANGUAGES,
  type TemplateDraft,
  type TemplateHabit,
  type TemplateLanguage,
} from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

import { TemplateHabitEditor } from './template-habit-editor';
import { LANGUAGE_NAMES } from './template-labels';

const NAME_MAX = 120;
const DESCRIPTION_MAX = 1000;

type Editing = { session: number; index: number | null; open: boolean };

export function TemplateForm({
  templateId,
  initial,
  reviewed = false,
}: {
  templateId?: string;
  initial: TemplateDraft;
  reviewed?: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useTemplateErrorMessage();
  const allowance = useAllowance('template');

  const {
    createTemplate,
    isCreating,
    error: createError,
  } = useCreateTemplate();
  const {
    updateTemplate,
    isUpdating,
    error: updateError,
  } = useUpdateTemplate();

  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState<Editing>({
    session: 0,
    index: null,
    open: false,
  });
  const [showDescription, setShowDescription] = useState(
    initial.description !== '',
  );
  const [revealed, setRevealed] = useState(false);
  const descriptionRef = useRef<TamaguiElement>(null);

  useEffect(() => {
    if (revealed) descriptionRef.current?.focus();
  }, [revealed]);

  const patch = (change: Partial<TemplateDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const creating = templateId === undefined;
  const blocked = creating && !allowance.canCreate;
  const busy = isCreating || isUpdating;
  const name = draft.name.trim();
  const full = draft.habits.length >= TEMPLATE_HABITS_MAX;

  const languages: readonly Segment<TemplateLanguage>[] =
    TEMPLATE_LANGUAGES.map((code) => ({
      value: code,
      label: LANGUAGE_NAMES[code],
    }));

  const rows = draft.habits.map((habit, index) => ({ ...habit, index }));

  const openEditor = (index: number | null) =>
    setEditing((current) => ({
      session: current.session + 1,
      index,
      open: true,
    }));

  const closeEditor = () =>
    setEditing((current) => ({ ...current, open: false }));

  const saveHabit = (habit: TemplateHabit) => {
    const index = editing.index;
    patch({
      habits:
        index === null
          ? [...draft.habits, habit]
          : draft.habits.map((current, i) => (i === index ? habit : current)),
    });
    closeEditor();
  };

  const removeHabit = () => {
    const index = editing.index;
    if (index === null) return;
    patch({ habits: draft.habits.filter((_, i) => i !== index) });
    closeEditor();
  };

  const moveHabit = (direction: -1 | 1) => {
    const index = editing.index;
    if (index === null) return;
    const target = index + direction;
    const habits = [...draft.habits];
    [habits[index], habits[target]] = [habits[target], habits[index]];
    patch({ habits });
    closeEditor();
  };

  async function save() {
    if (!name || blocked) return;

    const value: TemplateDraft = { ...draft, name };

    if (templateId !== undefined) {
      const changes = toTemplatePatch(value, initial);
      if (Object.keys(changes).length === 0) {
        router.back();
        return;
      }
      await updateTemplate({ id: templateId, patch: changes })
        .then(() => router.back())
        .catch(() => undefined);
      return;
    }

    await createTemplate(value)
      .then((template) =>
        router.replace({
          pathname: '/templates/[id]',
          params: { id: template.id },
        }),
      )
      .catch(() => undefined);
  }

  const editingHabit =
    editing.index === null ? null : (draft.habits[editing.index] ?? null);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderTextButton
              label={t(
                creating ? 'templates.form.save' : 'templates.form.update',
              )}
              onPress={save}
              disabled={!name || blocked}
              busy={busy}
            />
          ),
        }}
      />

      <FormScreen>
        <ErrorNotice message={toMessage(createError ?? updateError)} />

        {creating && (
          <PlanLimitNotice allowance={allowance} resource="template" />
        )}

        {reviewed && (
          <Notice
            Icon={RotateCcw}
            title={t('templates.form.reviewAgainTitle')}
            body={t('templates.form.reviewAgainBody')}
          />
        )}

        <FormSection title={t('templates.form.name')}>
          <FormInput
            accessibilityLabel={t('templates.form.name')}
            value={draft.name}
            onChangeText={(value) => patch({ name: value })}
            placeholder={t('templates.form.namePlaceholder')}
            maxLength={NAME_MAX}
            autoFocus={creating}
          />
        </FormSection>

        <FormSection
          title={t('templates.language.title')}
          hint={t('templates.language.hint')}
        >
          <SegmentedControl
            segments={languages}
            value={draft.language}
            onChange={(language) => patch({ language })}
          />
        </FormSection>

        {showDescription && (
          <FormSection title={t('templates.form.description')}>
            <FormTextArea
              accessibilityLabel={t('templates.form.description')}
              value={draft.description}
              onChangeText={(value) => patch({ description: value })}
              placeholder={t('templates.form.descriptionPlaceholder')}
              maxLength={DESCRIPTION_MAX}
              ref={descriptionRef}
            />
          </FormSection>
        )}

        {!showDescription && (
          <XStack>
            <AddFieldButton
              label={t('goals.form.addDescription')}
              accessibilityLabel={t('goals.form.addDescriptionLabel')}
              onPress={() => {
                setShowDescription(true);
                setRevealed(true);
              }}
            />
          </XStack>
        )}

        <FormSection
          title={t('templates.form.habits')}
          action={{
            label: t('templates.form.addHabit'),
            Icon: Plus,
            onPress: () => openEditor(null),
            disabled: full,
          }}
          counter={
            draft.habits.length > 0
              ? { count: draft.habits.length, max: TEMPLATE_HABITS_MAX }
              : undefined
          }
        >
          {rows.length === 0 ? (
            <EmptySlot Icon={ListChecks} label={t('templates.form.noHabits')} />
          ) : (
            <YStack gap={SPACING.items}>
              {rows.map((row) => (
                <HabitCard
                  key={`${row.index}-${row.name}`}
                  habit={row}
                  onOpen={(habit) => openEditor(habit.index)}
                />
              ))}
            </YStack>
          )}
        </FormSection>

        <GoalSettingsFields
          value={draft}
          initialSkipLimit={initial.streakSkipLimit}
          onChange={patch}
        />
      </FormScreen>

      {editing.session > 0 && (
        <TemplateHabitEditor
          key={editing.session}
          open={editing.open}
          initial={editingHabit}
          canMoveUp={editing.index !== null && editing.index > 0}
          canMoveDown={
            editing.index !== null && editing.index < draft.habits.length - 1
          }
          onSave={saveHabit}
          onMove={editing.index === null ? undefined : moveHabit}
          onRemove={editing.index === null ? undefined : removeHabit}
          onDismiss={closeEditor}
        />
      )}
    </>
  );
}
