import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { FormInput, FormTextArea } from '@/components/common/form-field';
import { FormScreen } from '@/components/common/form-screen';
import { FormSection } from '@/components/common/form-section';
import {
  HeaderActions,
  HeaderTextButton,
} from '@/components/common/header-actions';
import { OptionGroup, type Option } from '@/components/common/option-group';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { HabitActionsMenu } from './habit-actions-menu';
import { DEFAULT_TARGET, HabitTarget } from './habit-target';
import { MODE_ICONS } from './mode-icons';
import {
  hasThreshold,
  useCreateHabit,
  useHabitErrorMessage,
  useUpdateHabit,
  type HabitDraft,
  type TrackingMode,
} from '@/features/habits';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

const NAME_MAX = 200;
const PLAN_MAX = 500;
const WEIGHTS = ['1', '2', '3'] as const;

const WEIGHT_LABELS: Record<(typeof WEIGHTS)[number], TranslationKey> = {
  '1': 'habits.weight.normal',
  '2': 'habits.weight.double',
  '3': 'habits.weight.triple',
};

export function HabitForm({
  goalId,
  habitId,
  initial,
  archived = false,
}: {
  goalId: string;
  habitId?: string;
  initial: HabitDraft;
  archived?: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useHabitErrorMessage();

  const {
    createHabit,
    isCreating,
    error: createError,
  } = useCreateHabit(goalId);
  const { updateHabit, isUpdating, error: updateError } = useUpdateHabit();

  const [draft, setDraft] = useState(initial);

  const patch = (change: Partial<HabitDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const selectMode = (mode: TrackingMode) =>
    patch({
      trackingMode: mode,
      successThreshold: hasThreshold(mode) ? DEFAULT_TARGET[mode] : null,
    });

  const busy = isCreating || isUpdating;
  const name = draft.name.trim();

  const modes: readonly Option<TrackingMode>[] = [
    {
      value: 'binary',
      label: t('habits.mode.binary'),
      hint: t('habits.mode.binaryHint'),
      Icon: MODE_ICONS.binary,
    },
    {
      value: 'count',
      label: t('habits.mode.count'),
      hint: t('habits.mode.countHint'),
      Icon: MODE_ICONS.count,
    },
    {
      value: 'duration',
      label: t('habits.mode.duration'),
      hint: t('habits.mode.durationHint'),
      Icon: MODE_ICONS.duration,
    },
    {
      value: 'rating',
      label: t('habits.mode.rating'),
      hint: t('habits.mode.ratingHint'),
      Icon: MODE_ICONS.rating,
    },
  ];

  const weights: readonly Segment<(typeof WEIGHTS)[number]>[] = WEIGHTS.map(
    (weight) => ({ value: weight, label: t(WEIGHT_LABELS[weight]) }),
  );

  async function save() {
    if (!name) return;

    const value: HabitDraft = { ...draft, name };

    await (
      habitId ? updateHabit({ id: habitId, patch: value }) : createHabit(value)
    )
      .then(() => router.back())
      .catch(() => undefined);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderActions>
              <HeaderTextButton
                label={
                  habitId ? t('habits.form.update') : t('habits.form.save')
                }
                onPress={save}
                disabled={!name}
                busy={busy}
              />
              {habitId !== undefined && (
                <HabitActionsMenu habitId={habitId} archived={archived} />
              )}
            </HeaderActions>
          ),
        }}
      />

      <FormScreen>
        <ErrorNotice message={toMessage(createError ?? updateError)} />

        <FormSection
          title={t('habits.form.name')}
          hint={t('habits.form.nameHint')}
        >
          <FormInput
            accessibilityLabel={t('habits.form.name')}
            value={draft.name}
            onChangeText={(value) => patch({ name: value })}
            placeholder={t('habits.form.namePlaceholder')}
            maxLength={NAME_MAX}
            autoFocus={!habitId}
          />
        </FormSection>

        <OptionGroup
          title={t('habits.form.mode')}
          options={modes}
          value={draft.trackingMode}
          onChange={selectMode}
        />

        <HabitTarget
          mode={draft.trackingMode}
          value={
            draft.successThreshold ?? DEFAULT_TARGET[draft.trackingMode] ?? 1
          }
          onChange={(value) => patch({ successThreshold: value })}
        />

        <FormSection
          title={t('habits.form.weight')}
          hint={t('habits.form.weightHint')}
        >
          <SegmentedControl
            segments={weights}
            value={String(draft.weight) as (typeof WEIGHTS)[number]}
            onChange={(value) => patch({ weight: Number(value) })}
          />
        </FormSection>

        <FormSection
          title={t('habits.form.plan')}
          hint={t('habits.form.planHint')}
        >
          <FormTextArea
            accessibilityLabel={t('habits.form.plan')}
            value={draft.ifThenPlan}
            onChangeText={(value) => patch({ ifThenPlan: value })}
            placeholder={t('habits.form.planPlaceholder')}
            maxLength={PLAN_MAX}
          />
        </FormSection>
      </FormScreen>
    </>
  );
}
