/** Public surface of the goals feature — nothing outside it should reach deeper. */
export { goalKeys, type GoalReadOptions, type ListGoalsOptions } from './api';
export {
  useCreateGoal,
  useDeleteGoal,
  useGoal,
  useGoalCheckIn,
  useGoalErrorMessage,
  useGoals,
  useUpdateGoal,
} from './hooks';
export { toGoalPatch } from './patch';
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
