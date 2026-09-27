import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { CalendarDays } from '@tamagui/lucide-icons-2/icons/CalendarDays';
import { CalendarRange } from '@tamagui/lucide-icons-2/icons/CalendarRange';
import { CircleCheck } from '@tamagui/lucide-icons-2/icons/CircleCheck';
import { Gauge } from '@tamagui/lucide-icons-2/icons/Gauge';
import { Shuffle } from '@tamagui/lucide-icons-2/icons/Shuffle';

import { ErrorNotice } from '@/components/common/error-notice';
import { FormInput, FormTextArea } from '@/components/common/form-field';
import { FormScreen } from '@/components/common/form-screen';
import { FormSection } from '@/components/common/form-section';
import { HeaderTextButton } from '@/components/common/header-actions';
import { OptionGroup, type Option } from '@/components/common/option-group';
import { SliderCard } from '@/components/common/slider-card';
import { GoalColorPicker } from '@/components/goals/goal-color-picker';
import { useTagDraft } from '@/components/tags/tag-draft';
import { TagField } from '@/components/tags/tag-field';
import {
  useCreateGoal,
  useGoalErrorMessage,
  useUpdateGoal,
} from '@/features/goals/hooks';
import { toGoalPatch } from '@/features/goals/patch';
import type {
  GoalDraft,
  StreakRule,
  TrackingFrequency,
} from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

const NAME_MAX = 120;
const DESCRIPTION_MAX = 1000;

const THRESHOLD_MIN = 5;
const THRESHOLD_MAX = 100;
const THRESHOLD_STEP = 5;

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

  const patch = (change: Partial<GoalDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const busy = isCreating || isUpdating;
  const name = draft.name.trim();

  const frequencies: readonly Option<TrackingFrequency>[] = [
    {
      value: 'daily',
      label: t('goals.frequency.daily'),
      hint: t('goals.frequency.dailyHint'),
      Icon: CalendarDays,
    },
    {
      value: 'weekly',
      label: t('goals.frequency.weekly'),
      hint: t('goals.frequency.weeklyHint'),
      Icon: CalendarRange,
    },
    {
      value: 'flexible',
      label: t('goals.frequency.flexible'),
      hint: t('goals.frequency.flexibleHint'),
      Icon: Shuffle,
    },
  ];

  const streakRules: readonly Option<StreakRule>[] = [
    {
      value: 'logged',
      label: t('goals.streak.logged'),
      hint: t('goals.streak.loggedHint'),
      Icon: CircleCheck,
    },
    {
      value: 'threshold',
      label: t('goals.streak.threshold'),
      hint: t('goals.streak.thresholdHint'),
      Icon: Gauge,
    },
  ];

  async function save() {
    if (!name) return;

    const value: GoalDraft = {
      ...draft,
      name,
      tags: tags.value,
    };

    await (
      goalId
        ? updateGoal({ id: goalId, patch: toGoalPatch(value, initial) })
        : createGoal(value)
    )
      .then(() => router.back())
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

        <FormSection
          title={t('goals.form.name')}
          hint={t('goals.form.nameHint')}
        >
          <FormInput
            accessibilityLabel={t('goals.form.name')}
            value={draft.name}
            onChangeText={(value) => patch({ name: value })}
            placeholder={t('goals.form.namePlaceholder')}
            maxLength={NAME_MAX}
            autoFocus={!goalId}
          />
        </FormSection>

        <FormSection title={t('goals.form.description')}>
          <FormTextArea
            accessibilityLabel={t('goals.form.description')}
            value={draft.description}
            onChangeText={(value) => patch({ description: value })}
            placeholder={t('goals.form.descriptionPlaceholder')}
            maxLength={DESCRIPTION_MAX}
          />
        </FormSection>

        <TagField draft={tags} label={t('goals.form.tags')} />

        <GoalColorPicker
          value={draft.colorSlot}
          onChange={(slot) => patch({ colorSlot: slot })}
          hint={t(
            draft.colorSlot === null
              ? 'goals.form.colorAuto'
              : 'goals.form.colorHint',
          )}
        />

        <OptionGroup
          title={t('goals.form.frequency')}
          options={frequencies}
          value={draft.trackingFrequency}
          onChange={(value) => patch({ trackingFrequency: value })}
        />

        <OptionGroup
          title={t('goals.form.streakRule')}
          options={streakRules}
          value={draft.streakRule}
          onChange={(value) => patch({ streakRule: value })}
        />

        {draft.streakRule === 'threshold' && (
          <FormSection title={t('goals.form.threshold')}>
            <SliderCard
              format={(percent) => `${percent}%`}
              value={draft.streakThreshold}
              min={THRESHOLD_MIN}
              max={THRESHOLD_MAX}
              step={THRESHOLD_STEP}
              onChange={(value) => patch({ streakThreshold: value })}
              label={t('goals.form.threshold')}
            />
          </FormSection>
        )}
      </FormScreen>
    </>
  );
}
