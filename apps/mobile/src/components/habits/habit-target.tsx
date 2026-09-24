import { Paragraph, SizableText, Slider, YStack } from 'tamagui';

import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { SectionTitle } from '@/components/common/section-title';
import { Stepper } from '@/components/common/stepper';
import { SPACING, TEXT } from '@/constants/layout';
import type { TrackingMode } from '@/features/habits';
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
    <YStack gap={SPACING.group}>
      <SectionTitle>{t('habits.form.target')}</SectionTitle>

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
        <YStack
          gap={SPACING.items}
          p={SPACING.card}
          bg="$card"
          rounded="$xl2"
          borderWidth={1}
          borderColor="$border"
        >
          <SizableText
            size={TEXT.display}
            fontWeight="700"
            color="$primary"
            text="center"
          >
            {`${value} ${t('habits.unit.duration')}`}
          </SizableText>

          <Slider
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={DURATION_STEP}
            value={[value]}
            onValueChange={([next]) => onChange(next)}
            accessibilityLabel={t('habits.form.target')}
          >
            <Slider.Track bg="$muted" size="$1">
              <Slider.TrackActive bg="$primary" />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              circular
              size="$2"
              bg="$primary"
              borderColor="$background"
            />
          </Slider>
        </YStack>
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

      <Paragraph size={TEXT.caption} color="$mutedForeground" px="$2">
        {t('habits.form.targetHint')}
      </Paragraph>
    </YStack>
  );
}
