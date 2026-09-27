import { FormSection } from '@/components/common/form-section';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { SliderCard } from '@/components/common/slider-card';
import { Stepper } from '@/components/common/stepper';
import type { TrackingMode } from '@/features/habits/types';
import { useTranslations } from '@/lib/i18n';

const COUNT_MIN = 1;
const COUNT_MAX = 99;

const DURATION_MIN = 5;
const DURATION_MAX = 180;
const DURATION_STEP = 5;

const RATINGS = ['1', '2', '3', '4', '5'] as const;

export const DEFAULT_TARGET: Record<TrackingMode, number | null> = {
  binary: null,
  count: 3,
  duration: 60,
  rating: 3,
};

export function HabitTarget({
  mode,
  value,
  onChange,
}: {
  mode: TrackingMode;
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslations();

  if (mode === 'binary') return null;

  return (
    <FormSection
      title={t('habits.form.target')}
      hint={t('habits.form.targetHint')}
    >
      {mode === 'count' && (
        <Stepper
          value={value}
          min={COUNT_MIN}
          max={COUNT_MAX}
          suffix={t('habits.unit.count')}
          onChange={onChange}
          label={t('habits.form.target')}
        />
      )}

      {mode === 'duration' && (
        <SliderCard
          format={(minutes) => `${minutes} ${t('habits.unit.duration')}`}
          value={value}
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={DURATION_STEP}
          onChange={onChange}
          label={t('habits.form.target')}
        />
      )}

      {mode === 'rating' && (
        <SegmentedControl
          segments={
            RATINGS.map((rating) => ({
              value: rating,
              label: rating,
            })) as readonly Segment<(typeof RATINGS)[number]>[]
          }
          value={String(value) as (typeof RATINGS)[number]}
          onChange={(next) => onChange(Number(next))}
        />
      )}
    </FormSection>
  );
}
