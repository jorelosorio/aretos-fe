import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { HeaderActions } from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import { GoalActionsMenu } from '@/components/goals/goal-actions-menu';
import { GoalDetail } from '@/components/goals/goal-detail';
import { NewHabitButton } from '@/components/habits/new-habit-button';
import { useGoal, useGoalErrorMessage } from '@/features/goals';

export default function GoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: goal, error } = useGoal(id);
  const toMessage = useGoalErrorMessage();

  if (error) return <ErrorNotice message={toMessage(error)} />;
  if (!goal) return <ScreenLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          title: goal.name,
          headerRight: () => (
            <HeaderActions>
              {!goal.archived && <NewHabitButton goalId={goal.id} />}
              <GoalActionsMenu goalId={goal.id} archived={goal.archived} />
            </HeaderActions>
          ),
        }}
      />

      <GoalDetail goal={goal} />
    </>
  );
}
