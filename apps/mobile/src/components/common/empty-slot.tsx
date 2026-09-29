import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { getTokenValue, useTheme } from '@tamagui/core';
import { SizableText, XStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';

import type { IconComponent } from './icon-component';
import { resolveColor } from './theme-color';

const RADIUS = '$xl2';
const DOT = 2;
const DOT_SPACING = 6;

export function EmptySlot({
  Icon,
  label,
  onPress,
}: {
  Icon: IconComponent;
  label: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const radius = getTokenValue(RADIUS, 'radius');

  return (
    <XStack
      items="center"
      justify="center"
      gap="$2"
      p={SPACING.card}
      rounded={RADIUS}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((current) =>
          current.width === width && current.height === height
            ? current
            : { width, height },
        );
      }}
      onPress={onPress}
      pressStyle={onPress === undefined ? undefined : { opacity: 0.6 }}
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
      accessibilityLabel={label}
    >
      {box.width > 0 && (
        <Svg
          style={StyleSheet.absoluteFill}
          width={box.width}
          height={box.height}
          pointerEvents="none"
        >
          <Rect
            x={DOT / 2}
            y={DOT / 2}
            width={box.width - DOT}
            height={box.height - DOT}
            rx={radius - DOT / 2}
            fill="none"
            stroke={resolveColor(theme, '$border')}
            strokeWidth={DOT}
            strokeLinecap="round"
            strokeDasharray={`0.01 ${DOT_SPACING}`}
          />
        </Svg>
      )}

      <Icon size={ICON.row} color="$mutedForeground" />
      <SizableText size={TEXT.body} color="$mutedForeground">
        {label}
      </SizableText>
    </XStack>
  );
}
