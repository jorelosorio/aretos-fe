import { useState } from 'react';
import { SizableText, XStack, YStack } from 'tamagui';

import { longDateLabel } from '@/components/common/date-label';
import { ChartCard } from '@/components/viz/chart-card';
import { formatMood, formatRate } from '@/components/viz/format';
import { HEAT_LEGEND } from '@/components/viz/heat-level';
import { Heatmap } from '@/components/viz/heatmap';
import { SPACING, TEXT } from '@/constants/layout';
import type { CalendarTally, HeatCell } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

function DayDetail({ cell }: { cell: HeatCell }) {
  const { t, locale } = useTranslations();
  const empty = t('analysis.empty');

  let detail: string;
  if (cell.level === null) {
    detail = t('analysis.heatmap.dayFree');
  } else if (cell.logged === 0) {
    detail = t('analysis.heatmap.dayMissed');
  } else {
    const parts = [
      t('analysis.heatmap.dayLogged', {
        logged: cell.logged,
        periods: cell.periods,
      }),
    ];
    if (cell.rate !== null) {
      parts.push(
        t('analysis.heatmap.dayRate', { rate: formatRate(cell.rate, empty) }),
      );
    } else if (cell.skipped > 0) {
      parts.push(t('analysis.heatmap.daySkipped'));
    }
    if (cell.mood !== null) {
      parts.push(
        t('analysis.heatmap.dayMood', { mood: formatMood(cell.mood) }),
      );
    }
    detail = parts.join(' · ');
  }

  return (
    <YStack
      bg="$muted"
      rounded="$xl"
      p={SPACING.cardTight}
      gap={SPACING.text}
      accessibilityLiveRegion="polite"
    >
      <SizableText size={TEXT.caption} fontWeight="700" color="$cardForeground">
        {longDateLabel(cell.date, locale)}
      </SizableText>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {detail}
      </SizableText>
    </YStack>
  );
}

export function HeatmapCard({
  cells,
  calendar,
  pending = false,
}: {
  cells: readonly HeatCell[];
  calendar: CalendarTally;
  pending?: boolean;
}) {
  const { t } = useTranslations();
  const [selected, setSelected] = useState<HeatCell | null>(null);

  return (
    <ChartCard
      title={t('analysis.heatmap.title')}
      subtitle={t('analysis.heatmap.subtitle')}
      why={t('analysis.heatmap.why')}
      footnote={
        <YStack gap={SPACING.items}>
          {selected !== null && <DayDetail cell={selected} />}

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
            {t('analysis.heatmap.summary', {
              logged: calendar.logged,
              tracked: calendar.due,
            })}
          </SizableText>
        </YStack>
      }
    >
      {(width) => (
        <Heatmap
          width={width}
          cells={cells}
          pending={pending}
          selected={selected?.date ?? null}
          onSelect={(cell) =>
            setSelected((current) =>
              current?.date === cell.date ? null : cell,
            )
          }
        />
      )}
    </ChartCard>
  );
}
