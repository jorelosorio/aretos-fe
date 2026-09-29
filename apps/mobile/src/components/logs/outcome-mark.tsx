import { Check } from '@tamagui/lucide-icons-2/icons/Check';
import { Minus } from '@tamagui/lucide-icons-2/icons/Minus';
import { X } from '@tamagui/lucide-icons-2/icons/X';
import { Circle } from 'tamagui';

import { ICON } from '@/constants/layout';
import { OUTCOME_COLORS, type Outcome } from '@/features/logs/outcome';

export const OUTCOME_MARK_SIZE = 26;

export function OutcomeMark({
  outcome,
  onPress,
  label,
}: {
  outcome: Outcome;
  onPress?: () => void;
  label: string;
}) {
  const color = OUTCOME_COLORS[outcome];
  const done = outcome === 'done';

  return (
    <Circle
      size={OUTCOME_MARK_SIZE}
      bg={done ? color : '$background'}
      borderWidth={done ? 0 : 2}
      borderColor={color}
      pressStyle={onPress === undefined ? undefined : { opacity: 0.6 }}
      onPress={onPress}
      accessibilityRole={onPress === undefined ? undefined : 'button'}
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
    >
      {done && (
        <Check size={ICON.inline} color="$statusForeground" strokeWidth={3} />
      )}
      {outcome === 'missed' && (
        <X size={ICON.inline} color={color} strokeWidth={3} />
      )}
      {outcome === 'skipped' && (
        <Minus size={ICON.inline} color={color} strokeWidth={3} />
      )}
    </Circle>
  );
}
