import { Archive } from '@tamagui/lucide-icons-2';
import { SizableText, XStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';

import { GoalDot } from './goal-dot';

const VARIANTS = {
  title: {
    dot: 10,
    gap: '$2',
    size: TEXT.subheading,
    color: '$cardForeground',
  },
  inline: { dot: 8, gap: '$1.5', size: TEXT.body, color: '$cardForeground' },
  caption: {
    dot: 8,
    gap: '$2',
    size: TEXT.caption,
    color: '$mutedForeground',
  },
} as const;

export function GoalName({
  slot,
  name,
  variant = 'title',
  lines,
  archived = false,
}: {
  slot: number;
  name: string;
  variant?: keyof typeof VARIANTS;
  lines?: number;
  archived?: boolean;
}) {
  const style = VARIANTS[variant];

  return (
    <XStack grow={1} shrink={1} minW={0} items="center" gap={style.gap}>
      <GoalDot slot={slot} size={style.dot} />
      <SizableText
        shrink={1}
        size={style.size}
        fontWeight="700"
        color={style.color}
        numberOfLines={lines}
      >
        {name}
      </SizableText>
      {archived && <Archive size={ICON.inline} color="$mutedForeground" />}
    </XStack>
  );
}
