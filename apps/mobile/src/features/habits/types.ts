/**
 * A habit is a concrete, observable behaviour tracked against a goal — the
 * thing that makes an abstract goal ("work with excellence") checkable.
 *
 * Wire shapes mirror `internal/api/v1/habit_service.go` field for field.
 */

export type TrackingMode = 'binary' | 'count' | 'duration' | 'rating';

/**
 * A habit's bar, exactly as the server applies it (`progress.CriterionOf`).
 *
 * The check-in shows "done" while an answer is still being typed, before
 * anything is saved for the server to judge. Rather than keep its own copy of
 * the rule — which had already drifted: it counted a 0 as done for a measured
 * habit with no threshold, where the server does not — it compares against
 * the criterion the server sends with every habit.
 */
export type WireAchievedWhen = {
  compare: 'true' | 'at_least' | 'above';
  /** `null` for `true`. */
  value: number | null;
};

export type AchievedWhen = WireAchievedWhen;

export type WireHabit = {
  id: string;
  goal_id: string;
  name: string;
  tracking_mode: TrackingMode;
  weight: number;
  /** `null` when no target is set. Decimal with two places. */
  success_threshold: number | null;
  achieved_when: WireAchievedWhen;
  if_then_plan: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type WireHabits = { habits: WireHabit[] };

export type Habit = {
  id: string;
  goalId: string;
  name: string;
  trackingMode: TrackingMode;
  /** How much this habit counts toward its goal. 1 or more. */
  weight: number;
  successThreshold: number | null;
  /** The bar an unsaved answer is compared against. Server-decided. */
  achievedWhen: AchievedWhen;
  ifThenPlan: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Everything the form decides. The goal it belongs to is not editable. */
export type HabitDraft = {
  name: string;
  trackingMode: TrackingMode;
  weight: number;
  successThreshold: number | null;
  ifThenPlan: string;
};

export type HabitPatch = Partial<HabitDraft> & { archived?: boolean };

export const EMPTY_DRAFT: HabitDraft = {
  name: '',
  trackingMode: 'binary',
  weight: 1,
  successThreshold: null,
  ifThenPlan: '',
};

/** A `binary` habit is done or not; the rest measure something. */
export const hasThreshold = (mode: TrackingMode) => mode !== 'binary';

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const HabitErrorCode = {
  LimitReached: 'HABIT_LIMIT_REACHED',
  /** Also the answer for a habit, or a goal, owned by someone else. */
  NotFound: 'NOT_FOUND',
  /**
   * The habit's goal is archived, which refuses every write to the habit —
   * creating, editing, archiving, restoring and deleting alike. The app keeps
   * those out of reach, so this is the race: archived on another device.
   */
  GoalArchived: 'GOAL_ARCHIVED',
} as const;
