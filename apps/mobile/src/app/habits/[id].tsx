import { useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { HabitForm } from '@/components/habits/habit-form';
import { useHabit, useHabitErrorMessage } from '@/features/habits';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: habit, error } = useHabit(id);
  const toMessage = useHabitErrorMessage();

  if (error) return <ErrorNotice message={toMessage(error)} />;
  if (!habit) return <ScreenLoader />;

  return (
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
      archived={habit.archived}
    />
  );
}
