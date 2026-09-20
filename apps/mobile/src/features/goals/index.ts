/** Public surface of the goals feature — nothing outside it should reach deeper. */
export { goalKeys, type ListGoalsOptions } from './api';
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
  GoalInclude,
  GoalPatch,
  GoalPeriod,
  GoalProgress,
  PeriodEntry,
  PeriodStatus,
  StreakRule,
  TrackingFrequency,
} from './types';
