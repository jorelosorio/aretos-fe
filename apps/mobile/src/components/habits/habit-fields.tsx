import { FormInput, FormTextArea } from '@/components/common/form-field';
import { FormSection } from '@/components/common/form-section';
import { OptionGroup, type Option } from '@/components/common/option-group';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import {
  hasThreshold,
  type HabitDraft,
  type TrackingMode,
} from '@/features/habits/types';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import { DEFAULT_TARGET, HabitTarget } from './habit-target';
import { MODE_ICONS } from './mode-icons';

const NAME_MAX = 200;
const PLAN_MAX = 500;
const WEIGHTS = ['1', '2', '3'] as const;

const WEIGHT_LABELS: Record<(typeof WEIGHTS)[number], TranslationKey> = {
  '1': 'habits.weight.normal',
  '2': 'habits.weight.double',
  '3': 'habits.weight.triple',
};

export function HabitFields({
  value,
  onChange,
  autoFocus = false,
}: {
  value: HabitDraft;
  onChange: (change: Partial<HabitDraft>) => void;
  autoFocus?: boolean;
}) {
  const { t } = useTranslations();

  const selectMode = (mode: TrackingMode) =>
    onChange({
      trackingMode: mode,
      successThreshold: hasThreshold(mode) ? DEFAULT_TARGET[mode] : null,
    });

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

  return (
    <>
      <FormSection
        title={t('habits.form.name')}
        hint={t('habits.form.nameHint')}
      >
        <FormInput
          accessibilityLabel={t('habits.form.name')}
          value={value.name}
          onChangeText={(name) => onChange({ name })}
          placeholder={t('habits.form.namePlaceholder')}
          maxLength={NAME_MAX}
          autoFocus={autoFocus}
        />
      </FormSection>

      <OptionGroup
        title={t('habits.form.mode')}
        options={modes}
        value={value.trackingMode}
        onChange={selectMode}
      />

      <HabitTarget
        mode={value.trackingMode}
        value={
          value.successThreshold ?? DEFAULT_TARGET[value.trackingMode] ?? 1
        }
        onChange={(target) => onChange({ successThreshold: target })}
      />

      <FormSection
        title={t('habits.form.weight')}
        hint={t('habits.form.weightHint')}
      >
        <SegmentedControl
          segments={weights}
          value={String(value.weight) as (typeof WEIGHTS)[number]}
          onChange={(weight) => onChange({ weight: Number(weight) })}
        />
      </FormSection>

      <FormSection
        title={t('habits.form.plan')}
        hint={t('habits.form.planHint')}
      >
        <FormTextArea
          accessibilityLabel={t('habits.form.plan')}
          value={value.ifThenPlan}
          onChangeText={(plan) => onChange({ ifThenPlan: plan })}
          placeholder={t('habits.form.planPlaceholder')}
          maxLength={PLAN_MAX}
        />
      </FormSection>
    </>
  );
}
