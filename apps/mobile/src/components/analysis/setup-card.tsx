import { SizableText, YStack } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { Meter } from '@/components/viz/meter';
import { SPACING, TEXT } from '@/constants/layout';
import type { Setup } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

export function SetupCard({ setup }: { setup: Setup }) {
  const { t } = useTranslations();

  return (
    <ChartCard
      title={t('analysis.setup.title')}
      subtitle={t('analysis.setup.subtitle')}
      footnote={
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t('analysis.setup.counts', {
            goals: setup.goals,
            habits: setup.habits,
          })}
        </SizableText>
      }
    >
      <YStack gap={SPACING.items}>
        <Meter
          label={t('analysis.setup.planned')}
          rate={setup.planned.rate}
          caption={`${setup.planned.count}/${setup.planned.of}`}
        />
        <Meter
          label={t('analysis.setup.thresholded')}
          rate={setup.thresholded.rate}
          caption={`${setup.thresholded.count}/${setup.thresholded.of}`}
        />
        <Meter
          label={t('analysis.setup.weighted')}
          rate={setup.weighted.rate}
          caption={`${setup.weighted.count}/${setup.weighted.of}`}
        />
      </YStack>
    </ChartCard>
  );
}
