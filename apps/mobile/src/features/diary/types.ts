/**
 * The diary is what the person wrote: notes, newest first, across every goal
 * — written on their own or on a check-in.
 *
 * Wire shapes mirror `internal/api/v1/diary_note_service.go` and
 * `habit_log_note_service.go` field for field, snake_case included, so a
 * change on the server shows up here as a type error rather than as a value
 * that silently reads `undefined`.
 *
 * A note is one resource with two sets of routes. `/v1/diary-notes` lists,
 * writes and reads every note; `/v1/habit-logs/:id/notes` writes the notes
 * of one check-in. The same row answers both, and this feature owns both
 * so the rest of the app has one place to write a note from.
 *
 * A check-in's note carries its check-in beside it — the goal, the mood and
 * how the period scored — the same block `/v1/goals?include=progress`
 * returns per period. The device never recomputes any of it: the weights and
 * thresholds that decide it live on the server (`docs/progress.md`).
 *
 * The diary a note is filed under (`diary`) is not mapped. Every user has
 * exactly one and there are no routes for diaries, so nothing reads it.
 */

import type {
  PeriodStatus,
  StreakRule,
  TrackingFrequency,
} from '@/features/goals';
import type { MoodScore } from '@/features/logs';

/** `validate:"max=2000"` on every body the API accepts. */
export const NOTE_BODY_MAX = 2000;

export type WireDiaryGoal = {
  id: string;
  name: string;
  color_slot: number;
  archived: boolean;
  tracking_frequency: TrackingFrequency;
  streak_rule: StreakRule;
  streak_threshold: number;
};

export type WireDiaryCheckIn = {
  habit_log_id: string;
  goal: WireDiaryGoal;
  /** `null` when the period was saved without one. */
  mood: number | null;
  answered: number;
  skipped: number;
  total: number;
  /** `null` when there was nothing to measure, which is not zero. */
  completion: number | null;
  status: PeriodStatus;
  counts_for_streak: boolean;
  /** The period's last day: the Sunday of a weekly goal's week. */
  end_date: string;
};

export type WireDiaryNote = {
  id: string;
  diary: {
    id: string;
    name: string | null;
    color_slot: number;
    default: boolean;
  };
  /** For a check-in's note, the period's first day. */
  entry_date: string;
  /** Never empty. */
  body: string;
  /** Never null. */
  tags: string[];
  /** `null` for a note written on its own. */
  check_in: WireDiaryCheckIn | null;
  created_at: string;
  updated_at: string;
};

export type WireDiaryNotes = {
  notes: WireDiaryNote[];
  total: number;
  /** `""` on the last page — not null. */
  next_cursor: string;
  from: string;
  to: string;
  timezone: string;
  /** `""` when the plan reads the whole history. */
  history_cutoff: string;
  /** Whether anything is actually behind `history_cutoff`. */
  has_more_history: boolean;
};

/** One of a check-in's notes, as `/v1/habit-logs` carries it. */
export type WireCheckInNote = {
  id: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

/**
 * The goal a check-in's note was written under, carried on the note itself.
 *
 * `archived` is reported rather than filtered on by the caller: the server
 * already leaves an archived goal's notes out of an unfiltered list, and a
 * note opened some other way still has to say it cannot be edited.
 */
export type DiaryGoal = {
  id: string;
  name: string;
  /** The server's colour assignment — an index into the chart palette. */
  colorSlot: number;
  archived: boolean;
  trackingFrequency: TrackingFrequency;
  streakRule: StreakRule;
  /** 0–100, and only meaningful when `streakRule` is `'threshold'`. */
  streakThreshold: number;
};

/** The check-in a note was written on, scored by the server. */
export type DiaryCheckIn = {
  /** The log, so a write goes to `/v1/habit-logs/:id/notes` with no lookup. */
  habitLogId: string;
  goal: DiaryGoal;
  mood: MoodScore | null;
  /** How many of the period's habits were answered, a skip included. */
  answered: number;
  skipped: number;
  total: number;
  completion: number | null;
  /** The server's verdict on the period, scored by the goal's own rules. */
  status: PeriodStatus;
  countsForStreak: boolean;
  /** The period's last day, from the server. */
  endDate: string;
};

export type DiaryNote = {
  id: string;
  /**
   * `YYYY-MM-DD`. For a check-in's note, the period's first day as the save
   * snapped it — and fixed: the server refuses to move it.
   */
  entryDate: string;
  /** The whole note, unwrapped. */
  body: string;
  tags: string[];
  checkIn: DiaryCheckIn | null;
  /** ISO 8601, as the server sent it. */
  createdAt: string;
  updatedAt: string;
};

/** A check-in's note, as the check-in reads it back. */
export type CheckInNote = {
  id: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type DiaryPage = {
  notes: DiaryNote[];
  /**
   * How many notes the filters match, which is more than one page holds.
   * Counted over the whole filtered range, so it does not move as the pages
   * are walked.
   */
  total: number;
  /** What to send as the next `cursor`, or `null` on the last page. */
  nextCursor: string | null;
  /** The window and zone the notes were read in, all three defaulted. */
  from: string;
  to: string;
  timezone: string;
  /**
   * The earliest date this plan reads, or `null` when it reads everything.
   * Nothing is deleted to enforce it, so this is what a screen shows at the
   * end of the list instead of implying the history stops there.
   */
  historyCutoff: string | null;
  /**
   * Whether anything is actually behind `historyCutoff`, and the flag a
   * screen gates that notice on — the cutoff alone arrives for everyone on
   * a bounded plan, including somebody with nothing older.
   */
  hasMoreHistory: boolean;
};

/**
 * How the diary is filtered. Every field is optional and they combine.
 *
 * Leaving `from` and `to` out is not the same as naming the last 90 days: the
 * server resolves its own window in the user's zone, and it is the authority
 * on which day "today" is.
 */
export type DiaryFilter = {
  /** Narrows to one goal — and is the only way an archived goal's notes list. */
  goalId?: string;
  /** One tag, matched ignoring case, against notes only (not goals). */
  tag?: string;
  /** `YYYY-MM-DD`, inclusive. Either bound alone keeps the other's default. */
  from?: string;
  /** `YYYY-MM-DD`, inclusive. */
  to?: string;
  /** 1–100. Default 20, which is the server's own. */
  limit?: number;
};

/** A note written on its own. */
export type NoteDraft = {
  entryDate: string;
  body: string;
  tags: string[];
};

/**
 * A patch. An omitted key keeps its value; `tags`, when sent, replaces the
 * list whole and `[]` clears it.
 */
export type NotePatch = Partial<NoteDraft>;

/** A note written on a check-in: its day is the period's, never sent. */
export type CheckInNoteDraft = {
  body: string;
  tags: string[];
};

export type CheckInNotePatch = Partial<CheckInNoteDraft>;

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const DiaryErrorCode = {
  /**
   * On a read: a bad window, `limit` or cursor. On a write: a blank body or
   * a tag the server refused — empty, over 50 characters, or more than 20.
   */
  BadRequest: 'BAD_REQUEST',
  LimitReached: 'DIARY_NOTE_LIMIT_REACHED',
  NotFound: 'NOT_FOUND',
  /** A check-in's note under an archived goal: readable, not writable. */
  GoalArchived: 'GOAL_ARCHIVED',
} as const;
