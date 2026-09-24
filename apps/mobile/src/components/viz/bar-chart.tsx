import { useTheme } from '@tamagui/core';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { SizableText } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { TEXT } from '@/constants/layout';

import { percentOf } from './format';
import { barLayout } from './chart-layout';

export type BarDatum = {
  key: string;
  label: string;
  value: number | null;
  color?: string;
  caption?: string;
};

const CHART_HEIGHT = 140;
const TOP_LABEL_ROOM = 20;

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

  const { barWidth, spacing, initialSpacing } = barLayout(width, bars.length);

  return (
    <GiftedBarChart
      width={width}
      height={CHART_HEIGHT}
      barWidth={barWidth}
      spacing={spacing}
      initialSpacing={initialSpacing}
      endSpacing={0}
      yAxisLabelWidth={0}
      xAxisLength={width}
      overflowTop={TOP_LABEL_ROOM}
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
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {bar.label}
            </SizableText>
          ),
          topLabelComponent: () =>
            percent === null ? (
              <SizableText size={TEXT.caption} color="$mutedForeground">
                —
              </SizableText>
            ) : bar.caption !== undefined ? (
              <SizableText
                size={TEXT.micro}
                fontWeight="700"
                color="$mutedForeground"
                text="center"
                numberOfLines={1}
              >
                {bar.caption}
              </SizableText>
            ) : null,
        };
      })}
    />
  );
}
