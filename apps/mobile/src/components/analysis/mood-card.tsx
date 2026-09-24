import { useTheme } from '@tamagui/core';
import { SizableText, XStack, YStack } from 'tamagui';

import { MoodFace } from '@/components/logs/mood-face';
import { MOOD_LABELS } from '@/components/logs/mood-labels';
import { BarChart, type BarDatum } from '@/components/viz/bar-chart';
import { ChartCard } from '@/components/viz/chart-card';
import { formatMood, formatRate } from '@/components/viz/format';
import { LineChart } from '@/components/viz/line-chart';
import { SPACING, TEXT } from '@/constants/layout';
import type { MoodDistribution, Series } from '@/features/analysis';
import { MOOD_SCORES, type MoodScore } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

import { seriesPoints } from './series-points';

const AVERAGE_FACE = 36;

export function MoodCard({
  moods,
  series,
}: {
  moods: MoodDistribution;
  series: Series;
}) {
  const { t, locale } = useTranslations();
  const theme = useTheme();
  const empty = t('analysis.empty');

  const peak = Math.max(...moods.counts, 1);

  const bars: BarDatum[] = MOOD_SCORES.map((score) => {
    const count = moods.counts[score - 1] ?? 0;

    return {
      key: String(score),
      label: t(`logs.mood.scale.${score}`),
      value: count / peak,
      caption: String(count),
    };
  });

  const points = seriesPoints(series, (point) => point.mood, locale);

  const rounded =
    moods.mean === null
      ? null
      : (Math.min(5, Math.max(1, Math.round(moods.mean))) as MoodScore);

  return (
    <ChartCard
      title={t('analysis.moods.title')}
      subtitle={t('analysis.moods.subtitle')}
      why={t('analysis.moods.why')}
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
      {(width) => (
        <YStack gap={SPACING.section}>
          {moods.mean !== null && rounded !== null && (
            <XStack items="center" gap={SPACING.items}>
              <MoodFace
                score={rounded}
                size={AVERAGE_FACE}
                color={theme.primary.val}
              />
              <YStack gap={SPACING.text}>
                <SizableText size={TEXT.caption} color="$mutedForeground">
                  {t('analysis.moods.average')}
                </SizableText>
                <SizableText
                  size={TEXT.heading}
                  fontWeight="700"
                  color="$cardForeground"
                >
                  {`${formatMood(moods.mean)} · ${t(MOOD_LABELS[rounded])}`}
                </SizableText>
              </YStack>
            </XStack>
          )}

          {points.length > 1 && (
            <YStack gap={SPACING.group}>
              <SizableText size={TEXT.caption} color="$mutedForeground">
                {t('analysis.overTime')}
              </SizableText>
              <LineChart
                width={width}
                points={points}
                min={1}
                max={5}
                yLabels={['1', '3', '5']}
              />
            </YStack>
          )}

          <YStack gap={SPACING.group}>
            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t('analysis.moods.distribution')}
            </SizableText>
            <BarChart width={width} bars={bars} />
          </YStack>
        </YStack>
      )}
    </ChartCard>
  );
}
