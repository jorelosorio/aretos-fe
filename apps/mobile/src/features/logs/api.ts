import { api } from '@/lib/api';

import {
  isAnswered,
  type Log,
  type LogDraft,
  type LogEntry,
  type LogFilter,
  type LogPatch,
  type MoodScore,
  type WireLog,
  type WireLogEntry,
  type WireLogs,
} from './types';

import type { CheckInNote, WireCheckInNote } from '@/features/diary';

const paths = {
  logs: '/v1/habit-logs',
  log: (id: string) => `/v1/habit-logs/${id}`,
};

export const logKeys = {
  all: ['logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
  list: (filter: LogFilter) =>
    [
      ...logKeys.lists(),
      filter.goalId ?? 'all',
      filter.from ?? null,
      filter.to ?? null,
    ] as const,
  details: () => [...logKeys.all, 'detail'] as const,
  detail: (id: string) => [...logKeys.details(), id] as const,
};

/**
 * Anything outside 1-5 reads as no answer.
 *
 * The column is a `smallint` the API validates on the way in, so this only
 * fires for data written before a rule existed — and a mood the app cannot
 * place on its scale is better dropped than drawn as a face it does not have.
 */
function toMood(value: number | null): MoodScore | null {
  if (value === null) return null;
  return value >= 1 && value <= 5 ? (value as MoodScore) : null;
}

const toEntry = (wire: WireLogEntry): LogEntry => ({
  habitId: wire.habit_id,
  skipped: wire.skipped,
  done: wire.bool_value,
  amount: wire.num_value,
});

/**
 * Spelled out rather than imported from `features/diary` for the reason
 * `toHabit` is in `features/goals/api.ts`: a helper pulled through another
 * feature's barrel is how the require cycles Metro half-resolves get built.
 */
const toNote = (wire: WireCheckInNote): CheckInNote => ({
  id: wire.id,
  body: wire.body,
  tags: wire.tags,
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

const toLog = (wire: WireLog): Log => ({
  id: wire.id,
  goalId: wire.goal_id,
  entryDate: wire.entry_date,
  mood: toMood(wire.mood),
  notes: wire.notes.map(toNote),
  entries: wire.entries.map(toEntry),
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

/**
 * Only what the person actually answered.
 *
 * A habit with nothing said about it is left out rather than sent as a row of
 * nulls: the save deletes what it does not mention, so both spellings read
 * back as unanswered, and the shorter one keeps the log to what happened.
 */
const toWireEntries = (entries: readonly LogEntry[]): WireLogEntry[] =>
  entries.filter(isAnswered).map((entry) => ({
    habit_id: entry.habitId,
    skipped: entry.skipped,
    bool_value: entry.done,
    num_value: entry.amount,
  }));

/**
 * The journal: every log, newest period first, each with its entries.
 *
 * One log per goal per period, so a person keeping three goals has three logs
 * for one date. Dropping `goalId` spans every goal, which is what the diary
 * wants and the check-in does not.
 */
export async function listLogs(filter: LogFilter = {}): Promise<Log[]> {
  const { data } = await api.get<WireLogs>(paths.logs, {
    params: {
      ...(filter.goalId === undefined ? {} : { goal_id: filter.goalId }),
      ...(filter.from === undefined ? {} : { from: filter.from }),
      ...(filter.to === undefined ? {} : { to: filter.to }),
    },
  });
  return data.habit_logs.map(toLog);
}

export async function getLog(id: string): Promise<Log> {
  const { data } = await api.get<WireLog>(paths.log(id));
  return toLog(data);
}

/**
 * Writes one goal's whole period and answers with it.
 *
 * Idempotent, and that is the point: the endpoint upserts on
 * `(goal_id, entry_date)`, so a check-in screen has one button and may be
 * pressed twice. `entryDate` is sent as the person's own date — for a weekly
 * goal any day of the week works, and the log comes back on that week's
 * Monday.
 *
 * The whole period is one transaction: a habit that is not under this goal
 * answers `404` and nothing at all is written.
 */
export async function saveLog(draft: LogDraft): Promise<Log> {
  const { data } = await api.post<WireLog>(paths.logs, {
    goal_id: draft.goalId,
    entry_date: draft.entryDate,
    mood: draft.mood,
    entries: toWireEntries(draft.entries),
  });
  return toLog(data);
}

/** Amends the mood without resending the entries. */
export async function updateLog(id: string, patch: LogPatch): Promise<Log> {
  const body: Record<string, unknown> = {};
  if (patch.mood !== undefined) body.mood = patch.mood;

  const { data } = await api.patch<WireLog>(paths.log(id), body);
  return toLog(data);
}

/** Removes the mood, every entry and every note, freeing the period again. */
export async function deleteLog(id: string): Promise<void> {
  await api.delete(paths.log(id));
}
