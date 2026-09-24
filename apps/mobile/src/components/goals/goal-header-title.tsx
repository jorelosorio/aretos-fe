import { Text, type ColorValue } from 'react-native';
import { XStack } from 'tamagui';

import { HEADER_TITLE } from '@/constants/layout';

import { GoalDot } from './goal-dot';

export function GoalHeaderTitle({
  slot,
  title,
  color,
}: {
  slot: number;
  title: string;
  color?: ColorValue;
}) {
  return (
    <XStack items="center" gap="$2" shrink={1}>
      <GoalDot slot={slot} />
      <Text
        numberOfLines={1}
        accessibilityRole="header"
        style={{
          flexShrink: 1,
          color,
          fontFamily: HEADER_TITLE.fontFamily,
          fontSize: HEADER_TITLE.fontSize,
          lineHeight: HEADER_TITLE.lineHeight,
        }}
      >
        {title}
      </Text>
    </XStack>
  );
}
