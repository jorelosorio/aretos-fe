import Svg, { Line } from 'react-native-svg';
import { getTokenValue, useTheme } from '@tamagui/core';
import { XStack, YStack } from 'tamagui';

import { resolveColor } from '@/components/common/theme-color';
import { SPACING } from '@/constants/layout';
import type { Outcome } from '@/features/logs/outcome';

import { OUTCOME_MARK_SIZE, OutcomeMark } from './outcome-mark';

const RAIL = 26;
const DOT = 2;
const DOT_SPACING = 6;

function Connector({ hidden }: { hidden: boolean }) {
  const theme = useTheme();

  return (
    <YStack flex={1} width={DOT}>
      {!hidden && (
        <Svg width={DOT} height="100%" pointerEvents="none">
          <Line
            x1={DOT / 2}
            y1={DOT / 2}
            x2={DOT / 2}
            y2="100%"
            stroke={resolveColor(theme, '$border')}
            strokeWidth={DOT}
            strokeLinecap="round"
            strokeDasharray={`0.01 ${DOT_SPACING}`}
          />
        </Svg>
      )}
    </YStack>
  );
}

export function OutcomeRail({
  outcome,
  label,
  isFirst,
  isLast,
  onPress,
}: {
  outcome: Outcome;
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onPress?: () => void;
}) {
  return (
    <YStack width={RAIL} items="center" minH={OUTCOME_MARK_SIZE}>
      <Connector hidden={isFirst} />
      <OutcomeMark outcome={outcome} onPress={onPress} label={label} />
      <Connector hidden={isLast} />
    </YStack>
  );
}

export function OutcomeRailGap() {
  return (
    <XStack height={getTokenValue(SPACING.items, 'space')}>
      <YStack width={RAIL} items="center">
        <Connector hidden={false} />
      </YStack>
    </XStack>
  );
}
