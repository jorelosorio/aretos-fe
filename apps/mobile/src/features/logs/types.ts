/**
 * A log is one goal's record of one period: the note and the mood for that
 * period, plus one entry per habit.
 *
 * Wire shapes mirror `internal/api/v1/habit_log_service.go` field for field,
 * snake_case included, so a change on the server shows up here as a type error
 * rather than as a value that silently reads `undefined`.
 *
 * The server calls the resource `habit-logs`; the app says "log" because a log
 * is already about habits and the longer name only repeats it.
 */

import type { TrackingMode } from '@/features/habits';

/** The scale `mood` is validated against: `min=1,max=5`, and optional. */
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export const MOOD_SCORES = [
  1, 2, 3, 4, 5,
] as const satisfies readonly MoodScore[];

export type WireLogEntry = {
  habit_id: string;
  skipped: boolean;
  /** `null` when unanswered — for a binary habit, not the same as a no. */
  bool_value: boolean | null;
  /** `null` when unanswered. Decimal with two places. */
  num_value: number | null;
};

export type WireLog = {
  id: string;
  goal_id: string;
  /** `YYYY-MM-DD`, already snapped to the period's first day. */
  entry_date: string;
  note: string;
  mood: number | null;
  entries: WireLogEntry[];
  created_at: string;
  updated_at: string;
};

export type WireLogs = { habit_logs: WireLog[] };

/**
 * What one habit did in a period.
 *
 * Which field carries the answer is the habit's `trackingMode`: `done` for
 * `binary`, `amount` for the rest — `count` in repetitions, `duration` in
 * minutes, `rating` on its own 1-5 scale. The other is simply not read.
 *
 * Both `null` with `skipped` false is an entry that records the habit as
 * *unanswered*, which is a third state next to done and not done. The web app
 * stored a binary blank as `false` and had to carry an `answered` flag beside
 * every result to tell the two apart; keeping the null is what removes that.
 */
export type LogEntry = {
  habitId: string;
  /** A period consciously passed. An answer in its own right, not a blank. */
  skipped: boolean;
  done: boolean | null;
  amount: number | null;
};

export type Log = {
  id: string;
  goalId: string;
  /** `YYYY-MM-DD`. The period's first day, as the server snapped it. */
  entryDate: string;
  note: string;
  mood: MoodScore | null;
  entries: LogEntry[];
  /** ISO 8601, as the server sent it. */
  createdAt: string;
  updatedAt: string;
};

/**
 * One whole period, as Save writes it.
 *
 * There is no separate create and update: `POST /v1/habit-logs` upserts on
 * `(goal_id, entry_date)`, and every column is overwritten from what was sent.
 * So a draft says what the period *is*, never what to add to it — a habit left
 * out of `entries` is deleted from the log.
 */
export type LogDraft = {
  goalId: string;
  entryDate: string;
  note: string;
  mood: MoodScore | null;
  entries: LogEntry[];
};

/**
 * What `PATCH /v1/habit-logs/:id` amends, for a note or mood fixed without
 * reopening the check-in.
 *
 * Narrower than it looks: the query is `COALESCE(narg, column)`, so an omitted
 * field keeps its value and there is no way to *clear* one. Emptying a note or
 * taking back a mood is a Save.
 */
export type LogPatch = {
  note?: string;
  mood?: MoodScore;
};

/** How the journal is filtered. Every bound is optional and they combine. */
export type LogFilter = {
  goalId?: string;
  /** `YYYY-MM-DD`, inclusive. */
  from?: string;
  /** `YYYY-MM-DD`, inclusive. */
  to?: string;
};

/** An entry with nothing said about it yet. */
export const emptyEntry = (habitId: string): LogEntry => ({
  habitId,
  skipped: false,
  done: null,
  amount: null,
});

/**
 * Whether the person said anything about this habit.
 *
 * Skipping counts: it is a decision about the period, and it is what keeps the
 * habit out of the period's rates rather than counting as a failure.
 */
export const isAnswered = (entry: LogEntry): boolean =>
  entry.skipped || entry.done !== null || entry.amount !== null;

/** `binary` habits answer with `done`; every other mode measures an `amount`. */
export const answersWithAmount = (mode: TrackingMode) => mode !== 'binary';

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const LogErrorCode = {
  LimitReached: 'HABIT_LOG_LIMIT_REACHED',
  /** Also the answer for a log, goal or habit owned by someone else. */
  NotFound: 'NOT_FOUND',
} as const;
