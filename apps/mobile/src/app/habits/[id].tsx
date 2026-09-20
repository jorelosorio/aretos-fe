import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { HabitActionsMenu } from '@/components/habits/habit-actions-menu';
import { HabitForm } from '@/components/habits/habit-form';
import { useHabit, useHabitErrorMessage } from '@/features/habits';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: habit, error } = useHabit(id);
  const toMessage = useHabitErrorMessage();

  if (error) return <ErrorNotice message={toMessage(error)} />;
  if (!habit) return <ScreenLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HabitActionsMenu habitId={habit.id} archived={habit.archived} />
          ),
        }}
      />

      <HabitForm
        goalId={habit.goalId}
        habitId={habit.id}
        initial={{
          name: habit.name,
          trackingMode: habit.trackingMode,
          weight: habit.weight,
          successThreshold: habit.successThreshold,
          ifThenPlan: habit.ifThenPlan,
        }}
      />
    </>
  );
}
