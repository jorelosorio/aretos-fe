import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { Chip, type ChipBadge } from '@/components/common/chip';
import { TagChips } from '@/components/tags/tag-chips';
import { SPACING, TEXT } from '@/constants/layout';
import type { StreakRule, TrackingFrequency } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

import { FREQUENCY_LABELS } from './frequency-labels';
import { GoalHeading } from './goal-heading';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <YStack flex={1} gap={SPACING.text}>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {label}
      </SizableText>
      <SizableText size={TEXT.body} fontWeight="700" color="$cardForeground">
        {value}
      </SizableText>
    </YStack>
  );
}

export function GoalSummary({
  name,
  slot,
  badges = [],
  caption,
  description,
  tags = [],
  habitCount,
  trackingFrequency,
  streakRule,
  streakThreshold,
}: {
  name: string;
  slot?: number;
  badges?: readonly ChipBadge[];
  caption?: string;
  description: string;
  tags?: readonly string[];
  habitCount: number;
  trackingFrequency: TrackingFrequency;
  streakRule: StreakRule;
  streakThreshold: number;
}) {
  const { t } = useTranslations();

  const streak =
    streakRule === 'threshold'
      ? `${streakThreshold}%`
      : t('goals.streak.loggedShort');

  return (
    <Card gap={SPACING.group}>
      <GoalHeading name={name} slot={slot} description={description} />

      {(badges.length > 0 || caption !== undefined) && (
        <XStack items="center" gap="$1.5" flexWrap="wrap">
          {badges.map((badge) => (
            <Chip
              key={badge.label}
              label={badge.label}
              Icon={badge.Icon}
              highlighted={badge.highlighted}
            />
          ))}
          {caption !== undefined && (
            <SizableText size={TEXT.caption} color="$mutedForeground">
              {caption}
            </SizableText>
          )}
        </XStack>
      )}

      <TagChips tags={tags} />

      <Separator borderColor="$border" />

      <XStack gap={SPACING.items}>
        <Stat label={t('goals.stats.habits')} value={String(habitCount)} />
        <Stat
          label={t('goals.stats.frequency')}
          value={t(FREQUENCY_LABELS[trackingFrequency])}
        />
        <Stat label={t('goals.stats.streak')} value={streak} />
      </XStack>
    </Card>
  );
}
