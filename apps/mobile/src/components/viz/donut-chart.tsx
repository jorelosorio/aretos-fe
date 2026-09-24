import { useTheme } from '@tamagui/core';
import { PieChart } from 'react-native-gifted-charts';
import { SizableText, XStack, YStack, type ColorTokens } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { SPACING, TEXT } from '@/constants/layout';

export type DonutSlice = {
  key: string;
  label: string;
  value: number;
  color: ColorTokens;
};

export function DonutChart({
  width,
  slices,
  centerValue,
  centerLabel,
}: {
  width: number;
  slices: readonly DonutSlice[];
  centerValue: string;
  centerLabel: string;
}) {
  const theme = useTheme();

  const radius = Math.min(Math.round(width / 2), 110);
  const drawn = slices.filter((slice) => slice.value > 0);

  return (
    <YStack gap={SPACING.items}>
      <XStack justify="center">
        <PieChart
          donut
          radius={radius}
          innerRadius={Math.round(radius * 0.62)}
          innerCircleColor={resolveColor(theme, '$card')}
          data={drawn.map((slice) => ({
            value: slice.value,
            color: resolveColor(theme, slice.color),
          }))}
          centerLabelComponent={() => (
            <YStack items="center" gap={SPACING.text}>
              <SizableText
                size={TEXT.display}
                fontWeight="700"
                color="$cardForeground"
              >
                {centerValue}
              </SizableText>

              <SizableText
                size={TEXT.caption}
                color="$mutedForeground"
                text="center"
              >
                {centerLabel}
              </SizableText>
            </YStack>
          )}
        />
      </XStack>

      <YStack gap={SPACING.text}>
        {slices.map((slice) => (
          <XStack key={slice.key} items="center" gap="$2">
            <YStack width={10} height={10} rounded={5} bg={slice.color} />

            <SizableText
              flex={1}
              minW={0}
              size={TEXT.caption}
              color="$mutedForeground"
            >
              {slice.label}
            </SizableText>

            <SizableText
              size={TEXT.caption}
              fontWeight="600"
              color="$cardForeground"
            >
              {slice.value}
            </SizableText>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
