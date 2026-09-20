/** Public surface of the habits feature — nothing outside it should reach deeper. */
export {
  useCreateHabit,
  useDeleteHabit,
  useHabit,
  useHabitErrorMessage,
  useHabits,
  useUpdateHabit,
} from './hooks';
export { EMPTY_DRAFT, hasThreshold } from './types';
export type { Habit, HabitDraft, HabitPatch, TrackingMode } from './types';
