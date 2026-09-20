/** Public surface of the goals feature — nothing outside it should reach deeper. */
export { goalKeys } from './api';
export {
  useCreateGoal,
  useDeleteGoal,
  useGoal,
  useGoalErrorMessage,
  useGoals,
  useUpdateGoal,
} from './hooks';
export { EMPTY_DRAFT } from './types';
export type {
  Goal,
  GoalDraft,
  GoalPatch,
  StreakRule,
  TrackingFrequency,
} from './types';
