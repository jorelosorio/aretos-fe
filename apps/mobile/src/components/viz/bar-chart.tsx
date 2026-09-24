import { useTheme } from '@tamagui/core';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { SizableText } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { TEXT } from '@/constants/layout';

import { percentOf } from './format';

export type BarDatum = {
  key: string;
  label: string;
  value: number | null;
  color?: string;
};

const CHART_HEIGHT = 140;

export function BarChart({
  width,
  bars,
  color = '$primary',
}: {
  width: number;
  bars: readonly BarDatum[];
  color?: string;
}) {
  const theme = useTheme();

  const slot = width / Math.max(bars.length, 1);
  const barWidth = Math.max(8, Math.round(slot * 0.52));
  const spacing = Math.max(4, Math.round(slot - barWidth));

  return (
    <GiftedBarChart
      width={width}
      height={CHART_HEIGHT}
      barWidth={barWidth}
      spacing={spacing}
      initialSpacing={Math.round(spacing / 2)}
      endSpacing={0}
      maxValue={100}
      noOfSections={2}
      hideRules
      hideYAxisText
      yAxisThickness={0}
      xAxisColor={resolveColor(theme, '$vizBaseline')}
      barBorderRadius={3}
      disableScroll
      data={bars.map((bar) => {
        const percent = percentOf(bar.value);

        return {
          value: percent ?? 100,
          frontColor: resolveColor(
            theme,
            percent === null ? '$vizTrack' : (bar.color ?? color),
          ),
          labelComponent: () => (
            <SizableText
              size={TEXT.caption}
              color="$mutedForeground"
              text="center"
            >
              {bar.label}
            </SizableText>
          ),
          topLabelComponent: () =>
            percent === null ? (
              <SizableText size={TEXT.caption} color="$mutedForeground">
                —
              </SizableText>
            ) : null,
        };
      })}
    />
  );
}
