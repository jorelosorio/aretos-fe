import { useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { GoalForm } from '@/components/goals/goal-form';
import { useGoal, useGoalErrorMessage } from '@/features/goals';

export default function EditGoal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: goal, error } = useGoal(id);
  const toMessage = useGoalErrorMessage();

  if (error) return <ErrorNotice message={toMessage(error)} />;
  if (!goal) return <ScreenLoader />;

  return (
    <GoalForm
      goalId={goal.id}
      initial={{
        name: goal.name,
        description: goal.description,
        trackingFrequency: goal.trackingFrequency,
        streakRule: goal.streakRule,
        streakThreshold: goal.streakThreshold,
        colorSlot: goal.colorSlot,
      }}
    />
  );
}
