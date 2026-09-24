import type { Habit, WireHabit } from '@/features/habits';
import type { MoodScore } from '@/features/logs';

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
  /** Active habits, present only when `?include=habits` asked for them. */
  habits?: WireHabit[];
  /** Present only when `?include=progress` asked for it. */
  progress?: WireGoalProgress;
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
  /** The user's colour for the goal — an index into the goal palette, 0–7. */
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
  /**
   * The goal's active habits, or `undefined` when they were not asked for.
   *
   * The same rows `/v1/habits?goal_id=` returns and the same set
   * `habitCount` counts, mapped by the habits feature's own `toHabit`.
   */
  habits?: Habit[];
  /**
   * The scored calendar, or `undefined` when it was not asked for.
   *
   * Undefined and empty are different answers: a screen that did not request
   * progress must not read a missing block as a goal with no history.
   */
  progress?: GoalProgress;
};

/**
 * Everything the form decides, colour included; not identity.
 *
 * `colorSlot: null` leaves the colour to the server, which gives a new goal
 * one no active goal is wearing. Picking the free one here would mean
 * working out from a possibly stale list what the server already knows, so
 * a create the user did not colour sends nothing and lets it choose.
 */
export type GoalDraft = {
  name: string;
  description: string;
  trackingFrequency: TrackingFrequency;
  streakRule: StreakRule;
  streakThreshold: number;
  colorSlot: number | null;
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
  colorSlot: null,
};

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const GoalErrorCode = {
  /** The tier's allowance is spent — the `p2` rows in `internal/casbin/policy.csv`. */
  LimitReached: 'GOAL_LIMIT_REACHED',
  /** Also the answer for a goal owned by someone else: ids are never confirmed. */
  NotFound: 'NOT_FOUND',
  /**
   * The goal is archived, so the patch was refused — `openGoal` in
   * `internal/api/v1/service.go`, answered 409. An archived goal accepts only
   * `{ archived }` and its own deletion, so the way out is to restore it.
   */
  Archived: 'GOAL_ARCHIVED',
} as const;

/**
 * A goal's scored calendar, from `?include=progress`
 * (`internal/api/v1/goal_progress.go`, rules in `internal/progress`).
 *
 * Every number here is the server's. The scoring turns on each habit's
 * `weight`, `tracking_mode` and `success_threshold` and on the goal's
 * `streak_rule`, so computing any of it again on the device would be a second
 * implementation of those rules with nothing to catch it drifting — which is
 * exactly what `docs/progress.md` says the block exists to prevent.
 */

/**
 * How a period reads on a calendar, on its own terms.
 *
 * Independent of the streak: a goal on the `logged` rule counts a period it
 * achieved nothing in, so `missed` and `countsForStreak` can both be true.
 */
export type PeriodStatus =
  'empty' | 'missed' | 'partial' | 'complete' | 'skipped';

export type WirePeriodEntry = {
  habit_id: string;
  skipped: boolean;
  bool_value: boolean | null;
  num_value: number | null;
  /** The habit's own bar applied to this answer, by the server. */
  achieved: boolean;
};

export type WireGoalPeriod = {
  entry_date: string;
  /** `""` when nothing was saved — not null. */
  log_id: string;
  logged: boolean;
  answered: number;
  skipped: number;
  total: number;
  /** `null` when there was nothing to measure, which is not zero. */
  completion: number | null;
  status: PeriodStatus;
  counts_for_streak: boolean;
  /** The period's last day: the Sunday of a weekly goal's week. */
  end_date: string;
  note: string;
  mood: number | null;
  entries: WirePeriodEntry[];
};

export type WireGoalProgress = {
  timezone: string;
  today: string;
  from: string;
  to: string;
  current_streak: number;
  longest_streak: number;
  pending: boolean;
  /** Pending with a live streak to lose. */
  at_risk: boolean;
  /** Today through the current period's end, inclusive. */
  days_left: number;
  /** `""` when the goal has never been logged. */
  last_entry_date: string;
  current_period: WireGoalPeriod;
  periods: WireGoalPeriod[];
};

export type PeriodEntry = {
  habitId: string;
  skipped: boolean;
  done: boolean | null;
  amount: number | null;
  achieved: boolean;
};

export type GoalPeriod = {
  /** The period's first day, and the date a save for it would carry. */
  entryDate: string;
  /** The log to amend, or `null` when nothing was saved. */
  logId: string | null;
  logged: boolean;
  answered: number;
  skipped: number;
  total: number;
  completion: number | null;
  status: PeriodStatus;
  countsForStreak: boolean;
  /** The period's last day, from the server. */
  endDate: string;
  note: string;
  mood: MoodScore | null;
  entries: PeriodEntry[];
};

export type GoalProgress = {
  /** The zone this was resolved in — what the dates below mean. */
  timezone: string;
  today: string;
  from: string;
  to: string;
  currentStreak: number;
  longestStreak: number;
  /** The run reached the previous period and this one is still open. */
  pending: boolean;
  /**
   * The streak depends on the current period: pending, with a streak to
   * lose. The server's judgement — the home card only shows it.
   */
  atRisk: boolean;
  /** Today through the current period's end, inclusive. */
  daysLeft: number;
  lastEntryDate: string | null;
  currentPeriod: GoalPeriod;
  /** One per period of the window, logged or not. */
  periods: GoalPeriod[];
};

/** What `?include=` asks for; sent as a comma-separated list. */
export type GoalInclude = 'habits' | 'progress';
