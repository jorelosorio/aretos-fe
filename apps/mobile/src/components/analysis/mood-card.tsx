import { SizableText } from 'tamagui';

import { BarChart, type BarDatum } from '@/components/viz/bar-chart';
import { ChartCard } from '@/components/viz/chart-card';
import { formatRate } from '@/components/viz/format';
import { TEXT } from '@/constants/layout';
import type { MoodDistribution } from '@/features/analysis';
import { MOOD_SCORES } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

export function MoodCard({ moods }: { moods: MoodDistribution }) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');

  const peak = Math.max(...moods.counts, 1);

  const bars: BarDatum[] = MOOD_SCORES.map((score) => ({
    key: String(score),
    label: t(`logs.mood.scale.${score}`),
    value: (moods.counts[score - 1] ?? 0) / peak,
  }));

  return (
    <ChartCard
      title={t('analysis.moods.title')}
      subtitle={t('analysis.moods.subtitle')}
      footnote={
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t('analysis.moods.summary', {
            answered: moods.answered,
            total: moods.total,
            rate: formatRate(moods.responseRate, empty),
          })}
        </SizableText>
      }
    >
      {(width) => <BarChart width={width} bars={bars} />}
    </ChartCard>
  );
}
