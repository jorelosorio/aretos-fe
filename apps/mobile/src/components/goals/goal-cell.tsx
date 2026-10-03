import { XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { Chip, type ChipBadge } from '@/components/common/chip';
import { SPACING } from '@/constants/layout';
import type { TrackingFrequency } from '@/features/goals/types';

import { GoalHeading } from './goal-heading';
import { GoalMeta } from './goal-meta';

const CELL_LINES = 2;

export function GoalCell({
  name,
  slot,
  author,
  description,
  badges = [],
  habitCount,
  trackingFrequency,
  onPress,
  accessibilityLabel,
}: {
  name: string;
  slot?: number;
  author?: { name: string; official: boolean };
  description: string;
  badges?: readonly ChipBadge[];
  habitCount: number;
  trackingFrequency: TrackingFrequency;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Card
      row
      pressable
      items="center"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <YStack flex={1} gap={SPACING.group}>
        <GoalHeading
          name={name}
          slot={slot}
          author={author}
          description={description}
          lines={CELL_LINES}
        />

        <XStack items="center" gap="$1.5" flexWrap="wrap">
          {badges.map((badge) => (
            <Chip
              key={badge.label}
              label={badge.label}
              Icon={badge.Icon}
              highlighted={badge.highlighted}
            />
          ))}
          <GoalMeta
            habitCount={habitCount}
            trackingFrequency={trackingFrequency}
          />
        </XStack>
      </YStack>
    </Card>
  );
}
