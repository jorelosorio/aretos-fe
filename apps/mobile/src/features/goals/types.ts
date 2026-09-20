/**
 * A goal is a life area the user tracks ("Health"); the habits inside it are
 * what make it concrete.
 *
 * The wire types mirror `internal/api/v1/goal_service.go` field for field,
 * snake_case included, so a change on the server shows up here as a type error
 * rather than as a value that silently reads `undefined`.
 */

export type TrackingFrequency = 'daily' | 'weekly' | 'flexible';
export type StreakRule = 'logged' | 'threshold';

export type WireGoal = {
  id: string;
  name: string;
  description: string;
  tracking_frequency: TrackingFrequency;
  streak_rule: StreakRule;
  streak_threshold: number;
  color_slot: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  /** Active habits only — what the goal offers to open, not what it owns. */
  habit_count: number;
};

export type WireGoals = { goals: WireGoal[] };

/** A goal as the rest of the app uses it. */
export type Goal = {
  id: string;
  name: string;
  description: string;
  trackingFrequency: TrackingFrequency;
  streakRule: StreakRule;
  /** 0–100, and only meaningful when `streakRule` is `'threshold'`. */
  streakThreshold: number;
  /** The server's colour assignment — an index into the chart palette. */
  colorSlot: number;
  archived: boolean;
  /** ISO 8601, as the server sent it. */
  createdAt: string;
  updatedAt: string;
  /**
   * The goal's active habits, counted by the server and sent with the goal.
   * Every card shows it, so it rides along rather than costing a request per
   * row.
   */
  habitCount: number;
};

/**
 * Everything the form decides: not identity, and not colour. `color_slot` is
 * the server's to assign, since two devices creating at once would otherwise
 * both pick the same one.
 */
export type GoalDraft = {
  name: string;
  description: string;
  trackingFrequency: TrackingFrequency;
  streakRule: StreakRule;
  streakThreshold: number;
};

/** A patch sends only what changed; archiving is just `{ archived: true }`. */
export type GoalPatch = Partial<GoalDraft> & { archived?: boolean };

/** What a goal starts as, matching the column defaults the server applies. */
export const EMPTY_DRAFT: GoalDraft = {
  name: '',
  description: '',
  trackingFrequency: 'daily',
  streakRule: 'logged',
  streakThreshold: 60,
};

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const GoalErrorCode = {
  /** The tier's allowance is spent — the `p2` rows in `internal/casbin/policy.csv`. */
  LimitReached: 'GOAL_LIMIT_REACHED',
  /** Also the answer for a goal owned by someone else: ids are never confirmed. */
  NotFound: 'NOT_FOUND',
} as const;
