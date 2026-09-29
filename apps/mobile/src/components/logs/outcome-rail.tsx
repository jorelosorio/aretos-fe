import { YStack } from 'tamagui';

import type { Outcome } from '@/features/logs/outcome';

import { OUTCOME_MARK_SIZE, OutcomeMark } from './outcome-mark';

const RAIL = 26;

function Connector({ hidden }: { hidden: boolean }) {
  return (
    <YStack
      flex={1}
      width={0}
      borderLeftWidth={1}
      borderStyle="dashed"
      borderColor={hidden ? 'transparent' : '$border'}
    />
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
