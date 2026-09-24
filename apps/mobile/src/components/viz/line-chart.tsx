import { useTheme } from '@tamagui/core';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { SizableText, XStack, YStack } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { SPACING, TEXT } from '@/constants/layout';

import { lineLayout } from './chart-layout';

export type LinePoint = { key: string; label: string; value: number };

const CHART_HEIGHT = 120;
const LABEL_WIDTH = 34;
const INSET = 6;
const SECTIONS = 2;

export function LineChart({
  width,
  points,
  min,
  max,
  yLabels,
  color = '$primary',
  area = false,
}: {
  width: number;
  points: readonly LinePoint[];
  min: number;
  max: number;
  yLabels: readonly [string, string, string];
  color?: string;
  area?: boolean;
}) {
  const theme = useTheme();

  if (points.length < 2) return null;

  const { plot, spacing, initialSpacing, endSpacing } = lineLayout(
    width,
    points.length,
    LABEL_WIDTH,
    INSET,
  );

  const stroke = resolveColor(theme, color);
  const muted = resolveColor(theme, '$mutedForeground');

  return (
    <YStack gap={SPACING.text}>
      <GiftedLineChart
        width={plot}
        height={CHART_HEIGHT}
        data={points.map((point) => ({ value: point.value - min }))}
        maxValue={max - min}
        noOfSections={SECTIONS}
        yAxisLabelTexts={[...yLabels]}
        yAxisLabelWidth={LABEL_WIDTH}
        yAxisTextStyle={{ color: muted, fontSize: 10 }}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={resolveColor(theme, '$vizBaseline')}
        rulesColor={resolveColor(theme, '$vizGrid')}
        rulesType="dashed"
        dashWidth={4}
        dashGap={4}
        spacing={spacing}
        initialSpacing={initialSpacing}
        endSpacing={endSpacing}
        disableScroll
        curved
        thickness={2.5}
        color={stroke}
        dataPointsColor={stroke}
        dataPointsRadius={points.length > 16 ? 0 : 3}
        areaChart={area}
        startFillColor={stroke}
        endFillColor={stroke}
        startOpacity={0.28}
        endOpacity={0.02}
      />

      <XStack justify="space-between" pl={LABEL_WIDTH}>
        <SizableText size={TEXT.micro} color="$mutedForeground">
          {points[0].label}
        </SizableText>
        <SizableText size={TEXT.micro} color="$mutedForeground">
          {points[points.length - 1].label}
        </SizableText>
      </XStack>
    </YStack>
  );
}
