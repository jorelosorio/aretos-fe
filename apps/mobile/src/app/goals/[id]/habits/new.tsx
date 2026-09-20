import { useLocalSearchParams } from 'expo-router';

import { HabitForm } from '@/components/habits/habit-form';
import { EMPTY_DRAFT } from '@/features/habits';

export default function NewHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <HabitForm goalId={id} initial={EMPTY_DRAFT} />;
}
