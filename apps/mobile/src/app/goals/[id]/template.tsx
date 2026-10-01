import { useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { GoalTemplateForm } from '@/components/templates/goal-template-form';
import { useGoal, useGoalErrorMessage } from '@/features/goals/hooks';

export default function SaveGoalAsTemplate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: goal, error } = useGoal(id);
  const toMessage = useGoalErrorMessage();

  if (error) return <ErrorNotice message={toMessage(error)} />;
  if (!goal) return <ScreenLoader />;

  return <GoalTemplateForm goalId={goal.id} goalName={goal.name} />;
}
