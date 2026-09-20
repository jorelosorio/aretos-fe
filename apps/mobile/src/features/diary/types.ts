/**
 * The diary is the written half of the journal: the periods the person said
 * something about, newest first and across every goal at once.
 *
 * Wire shapes mirror `internal/api/v1/diary_service.go` field for field,
 * snake_case included, so a change on the server shows up here as a type error
 * rather than as a value that silently reads `undefined`.
 *
 * A habit log holds two things read on different screens. Its *entries* are
 * the check-in, and `/v1/habit-logs` returns one goal's log whole —
 * `features/logs` is that side. Its *note* and *mood* are what was said about
 * the period, and that is what this lists, with each habit's answer beside it
 * so the writing can be read against what it was written about.
 *
 * Membership is the only distinction the endpoint draws: a period carrying a
 * note **or** a mood is an entry — a mood tapped with nothing written is still
 * something said — and one with neither is a check-in and is not listed. A
 * note of nothing but whitespace counts as no note, which matches the `trim()`
 * `saveLog` applies on the way in. There is no sub-filter; `notes_only` was
 * removed from the endpoint.
 *
 * What is *not* here is the score. Completion, status and the streak come from
 * the goal's own rules — its habits' weights and thresholds, its streak rule —
 * and `/v1/goals?include=progress` is what applies them. An entry carries what
 * was saved and nothing worked out from it, so anything derived (the month it
 * falls in, a preview of the note, how wide a span the date stands for) is the
 * caller's to compute.
 */

import type { TrackingFrequency } from '@/features/goals';
import type { TrackingMode } from '@/features/habits';
import type { MoodScore } from '@/features/logs';

export type WireDiaryGoal = {
  id: string;
  name: string;
  color_slot: number;
  archived: boolean;
  tracking_frequency: TrackingFrequency;
};

export type WireDiaryHabit = {
  habit_id: string;
  name: string;
  tracking_mode: TrackingMode;
  /** The habit has since been shelved; its answer still stands. */
  archived: boolean;
  skipped: boolean;
  /** `null` when unanswered — for a binary habit, not the same as a no. */
  bool_value: boolean | null;
  /** `null` when unanswered. Decimal with two places. */
  num_value: number | null;
};

export type WireDiaryEntry = {
  id: string;
  entry_date: string;
  goal: WireDiaryGoal;
  /** `""` when the period carries only a mood. */
  note: string;
  /** `null` when it carries only a note. */
  mood: number | null;
  /** `[]` when the period was saved with writing and nothing else. */
  habits: WireDiaryHabit[];
  created_at: string;
  updated_at: string;
};

export type WireDiary = {
  entries: WireDiaryEntry[];
  total: number;
  /** `""` on the last page — not null. */
  next_cursor: string;
  from: string;
  to: string;
  timezone: string;
  /** `""` when the plan reads the whole history. */
  history_cutoff: string;
};

/**
 * The goal an entry was written under, carried on the entry itself.
 *
 * The one thing on an entry the log does not hold. It rides along because a
 * diary spans every goal, and the alternative is joining each entry against a
 * goals list to learn its name. `archived` is reported rather than filtered
 * on: the diary is a record of what was written, not a view of what is still
 * tracked.
 *
 * `trackingFrequency` is also what says how wide a span `entryDate` stands
 * for — the day itself, or the Monday of a week.
 */
export type DiaryGoal = {
  id: string;
  name: string;
  /** The server's colour assignment — an index into the chart palette. */
  colorSlot: number;
  archived: boolean;
  trackingFrequency: TrackingFrequency;
};

/**
 * One habit's answer inside the period an entry was written about.
 *
 * Named `done`/`amount` rather than after the columns, matching `LogEntry`,
 * which this is the same answer as: `done` carries it for a `binary` habit and
 * `amount` for the measured ones. The habit's own `name` and `trackingMode`
 * come down with it because neither the value nor its meaning stands alone — a
 * bare `45` cannot be rendered without "Run" and "duration" beside it.
 *
 * `skipped` false with both values `null` is a habit that was not answered,
 * which for a binary habit is a third state and not a "no".
 *
 * What is missing on purpose is `weight` and `successThreshold`. Without them
 * a measured answer cannot be called met or missed, and that is the point: the
 * verdict is the goal's to give, not this endpoint's.
 */
export type DiaryHabitAnswer = {
  habitId: string;
  name: string;
  trackingMode: TrackingMode;
  /** Shelved since; the answer is kept, because the diary records what was. */
  archived: boolean;
  /** A period consciously passed. An answer in its own right, not a blank. */
  skipped: boolean;
  done: boolean | null;
  amount: number | null;
};

export type DiaryEntry = {
  /** The habit log, so an edit is `PATCH /v1/habit-logs/:id` with no lookup. */
  id: string;
  /**
   * `YYYY-MM-DD`, the period's first day as the save snapped it: the day
   * itself for a daily or flexible goal, the Monday for a weekly one.
   */
  entryDate: string;
  goal: DiaryGoal;
  /** The whole note, unwrapped. `''` when the period carries only a mood. */
  note: string;
  mood: MoodScore | null;
  /** In the order the goal lists its habits. Empty for a written-only period. */
  habits: DiaryHabitAnswer[];
  /** ISO 8601, as the server sent it. */
  createdAt: string;
  updatedAt: string;
};

export type DiaryPage = {
  entries: DiaryEntry[];
  /**
   * How many entries the filters match, which is more than one page holds.
   * Counted over the whole filtered range rather than what is left in it, so
   * it does not move as the pages are walked.
   */
  total: number;
  /** What to send as the next `cursor`, or `null` on the last page. */
  nextCursor: string | null;
  /** The window and zone the entries were read in, all three defaulted. */
  from: string;
  to: string;
  timezone: string;
  /**
   * The earliest date this plan reads, or `null` when it reads everything.
   *
   * Nothing is deleted to enforce it — every other endpoint still returns
   * those rows, and a plan without the rule returns them here too — so this is
   * what a screen shows at the end of the list instead of implying the history
   * stops there.
   */
  historyCutoff: string | null;
};

/**
 * How the diary is filtered. Every field is optional and they combine.
 *
 * Leaving `from` and `to` out is not the same as naming the last 90 days: the
 * server resolves its own window in the user's zone, and it is the authority
 * on which day "today" is.
 */
export type DiaryFilter = {
  /** Narrows to one goal. Omitted, the diary spans every goal. */
  goalId?: string;
  /** `YYYY-MM-DD`, inclusive. Either bound alone keeps the other's default. */
  from?: string;
  /** `YYYY-MM-DD`, inclusive. */
  to?: string;
  /** 1–100. Default 20, which is the server's own. */
  limit?: number;
};

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const DiaryErrorCode = {
  /**
   * A window that ends before it starts, a `limit` off the 1–100 scale, or a
   * cursor this endpoint did not mint.
   */
  BadRequest: 'BAD_REQUEST',
} as const;
