import { memo } from 'react';

import type { Goal } from '@/features/goals/types';
import { useTranslations } from '@/lib/i18n';

import { GoalCell } from './goal-cell';

export const GoalCard = memo(function GoalCard({
  goal,
  habitCount,
  onOpen,
}: {
  goal: Goal;
  habitCount: number;
  onOpen: (goal: Goal) => void;
}) {
  const { t } = useTranslations();

  const habits = t(habitCount === 1 ? 'habits.countOne' : 'habits.countMany', {
    count: habitCount,
  });

  return (
    <GoalCell
      name={goal.name}
      slot={goal.colorSlot}
      description={goal.description}
      habitCount={habitCount}
      trackingFrequency={goal.trackingFrequency}
      onPress={() => onOpen(goal)}
      accessibilityLabel={`${goal.name}. ${habits}`}
    />
  );
});
