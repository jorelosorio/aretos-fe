import { SizableText, XStack } from 'tamagui';

import { TEXT } from '@/constants/layout';
import type { TrackingFrequency } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

import { FREQUENCY_LABELS } from './frequency-labels';

export function GoalMeta({
  habitCount,
  trackingFrequency,
}: {
  habitCount: number;
  trackingFrequency: TrackingFrequency;
}) {
  const { t } = useTranslations();

  return (
    <XStack items="center" gap="$2">
      <SizableText size={TEXT.caption} color="$primary" fontWeight="600">
        {t(habitCount === 1 ? 'habits.countOne' : 'habits.countMany', {
          count: habitCount,
        })}
      </SizableText>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        ·
      </SizableText>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {t(FREQUENCY_LABELS[trackingFrequency])}
      </SizableText>
    </XStack>
  );
}
