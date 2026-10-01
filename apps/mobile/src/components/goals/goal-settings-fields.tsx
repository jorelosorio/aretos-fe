import { useState } from 'react';
import { CalendarDays } from '@tamagui/lucide-icons-2/icons/CalendarDays';
import { CalendarRange } from '@tamagui/lucide-icons-2/icons/CalendarRange';
import { CircleCheck } from '@tamagui/lucide-icons-2/icons/CircleCheck';
import { Gauge } from '@tamagui/lucide-icons-2/icons/Gauge';
import { Info } from '@tamagui/lucide-icons-2/icons/Info';
import { Shuffle } from '@tamagui/lucide-icons-2/icons/Shuffle';

import { FormSection } from '@/components/common/form-section';
import { OptionGroup, type Option } from '@/components/common/option-group';
import { SliderCard } from '@/components/common/slider-card';
import { Stepper } from '@/components/common/stepper';
import type {
  GoalDraft,
  StreakRule,
  TrackingFrequency,
} from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

import { SKIP_LIMIT_COPY, skipUnit } from './skip-limit-copy';
import { SkipLimitInfo } from './skip-limit-info';

const THRESHOLD_MIN = 5;
const THRESHOLD_MAX = 100;
const THRESHOLD_STEP = 5;

const SKIP_LIMIT_MIN = 0;
const SKIP_LIMIT_MAX = 7;

export type GoalSettings = Pick<
  GoalDraft,
  'trackingFrequency' | 'streakRule' | 'streakThreshold' | 'streakSkipLimit'
>;

export function GoalSettingsFields({
  value,
  initialSkipLimit,
  onChange,
}: {
  value: GoalSettings;
  initialSkipLimit: number;
  onChange: (change: Partial<GoalSettings>) => void;
}) {
  const { t } = useTranslations();
  const [explainingSkips, setExplainingSkips] = useState(false);

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

  return (
    <>
      <OptionGroup
        title={t('goals.form.frequency')}
        options={frequencies}
        value={value.trackingFrequency}
        onChange={(frequency) => onChange({ trackingFrequency: frequency })}
      />

      <OptionGroup
        title={t('goals.form.streakRule')}
        options={streakRules}
        value={value.streakRule}
        onChange={(rule) => onChange({ streakRule: rule })}
      />

      {value.streakRule === 'threshold' && (
        <FormSection title={t('goals.form.threshold')}>
          <SliderCard
            format={(percent) => `${percent}%`}
            value={value.streakThreshold}
            min={THRESHOLD_MIN}
            max={THRESHOLD_MAX}
            step={THRESHOLD_STEP}
            onChange={(threshold) => onChange({ streakThreshold: threshold })}
            label={t('goals.form.threshold')}
          />
        </FormSection>
      )}

      <FormSection
        title={t('goals.form.skipLimit')}
        hint={t(SKIP_LIMIT_COPY[value.trackingFrequency].hint)}
        action={{
          label: t('goals.skipLimit.howItWorks'),
          Icon: Info,
          onPress: () => setExplainingSkips(true),
        }}
      >
        <Stepper
          value={value.streakSkipLimit}
          min={SKIP_LIMIT_MIN}
          max={Math.max(SKIP_LIMIT_MAX, initialSkipLimit)}
          suffix={skipUnit(t, value.trackingFrequency, value.streakSkipLimit)}
          onChange={(limit) => onChange({ streakSkipLimit: limit })}
          label={t('goals.form.skipLimit')}
        />
      </FormSection>

      <SkipLimitInfo
        open={explainingSkips}
        limit={value.streakSkipLimit}
        frequency={value.trackingFrequency}
        onDismiss={() => setExplainingSkips(false)}
      />
    </>
  );
}
