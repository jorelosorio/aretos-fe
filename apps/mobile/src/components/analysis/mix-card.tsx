import { SizableText } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { DonutChart, type DonutSlice } from '@/components/viz/donut-chart';
import { formatRate } from '@/components/viz/format';
import { TEXT } from '@/constants/layout';
import type { OutcomeMix } from '@/features/analysis';
import { OUTCOME_COLORS } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

export function MixCard({ mix }: { mix: OutcomeMix }) {
  const { t } = useTranslations();

  const slices: DonutSlice[] = [
    {
      key: 'achieved',
      label: t('analysis.mix.achieved'),
      value: mix.achieved,
      color: OUTCOME_COLORS.done,
    },
    {
      key: 'missed',
      label: t('analysis.mix.missed'),
      value: mix.missed,
      color: OUTCOME_COLORS.missed,
    },
    {
      key: 'skipped',
      label: t('analysis.mix.skipped'),
      value: mix.skipped,
      color: OUTCOME_COLORS.skipped,
    },
    {
      key: 'blank',
      label: t('analysis.mix.blank'),
      value: mix.blank,
      color: OUTCOME_COLORS.pending,
    },
  ];

  const excluded = mix.skipped + mix.blank;

  return (
    <ChartCard
      title={t('analysis.mix.title')}
      subtitle={t('analysis.mix.subtitle')}
      footnote={
        excluded > 0 ? (
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('analysis.mix.excluded', {
              count: excluded,
              skipped: mix.skipped,
              blank: mix.blank,
            })}
          </SizableText>
        ) : undefined
      }
    >
      {(width) => (
        <DonutChart
          width={width}
          slices={slices}
          centerValue={formatRate(mix.rate, t('analysis.empty'))}
          centerLabel={t('analysis.mix.center', {
            achieved: mix.achieved,
            opportunities: mix.opportunities,
          })}
        />
      )}
    </ChartCard>
  );
}
