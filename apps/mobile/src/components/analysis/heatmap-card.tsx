import { SizableText, XStack, YStack } from 'tamagui';

import { ChartCard } from '@/components/viz/chart-card';
import { HEAT_LEGEND } from '@/components/viz/heat-level';
import { Heatmap } from '@/components/viz/heatmap';
import { SPACING, TEXT } from '@/constants/layout';
import type { HeatCell } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

export function HeatmapCard({ cells }: { cells: readonly HeatCell[] }) {
  const { t } = useTranslations();

  const tracked = cells.filter((cell) => cell.level !== null).length;
  const logged = cells.filter((cell) => cell.logged > 0).length;

  return (
    <ChartCard
      title={t('analysis.heatmap.title')}
      subtitle={t('analysis.heatmap.subtitle')}
      footnote={
        <YStack gap={SPACING.items}>
          <XStack items="center" gap="$1.5">
            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t('analysis.heatmap.less')}
            </SizableText>

            {HEAT_LEGEND.map((token) => (
              <YStack
                key={token}
                width={12}
                height={12}
                rounded={2}
                bg={token}
              />
            ))}

            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t('analysis.heatmap.more')}
            </SizableText>
          </XStack>

          <SizableText size={TEXT.caption} color="$mutedForeground">
            {t('analysis.heatmap.summary', { logged, tracked })}
          </SizableText>
        </YStack>
      }
    >
      {(width) => <Heatmap width={width} cells={cells} />}
    </ChartCard>
  );
}
