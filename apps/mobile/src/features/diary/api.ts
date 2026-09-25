import { api } from '@/lib/api';
import { deviceTimezone } from '@/lib/timezone';

import type { MoodScore } from '@/features/logs';

import type {
  CheckInNote,
  CheckInNoteDraft,
  CheckInNotePatch,
  DiaryCheckIn,
  DiaryFilter,
  DiaryGoal,
  DiaryNote,
  DiaryPage,
  NoteDraft,
  NotePatch,
  WireCheckInNote,
  WireDiaryCheckIn,
  WireDiaryGoal,
  WireDiaryNote,
  WireDiaryNotes,
} from './types';

/**
 * Requests for the diary feature, mirroring `aretos-be/bruno/DiaryNotes/`
 * and the `notes-*` requests in `aretos-be/bruno/HabitLogs/`.
 */
const paths = {
  notes: '/v1/diary-notes',
  note: (id: string) => `/v1/diary-notes/${id}`,
  checkInNotes: (logId: string) => `/v1/habit-logs/${logId}/notes`,
  checkInNote: (logId: string, noteId: string) =>
    `/v1/habit-logs/${logId}/notes/${noteId}`,
};

/**
 * The server's own default page, repeated here so a cache key names the size
 * it was filled at. A filter asking for 20 and one asking for nothing are the
 * same request, and they should not be two entries.
 */
export const DIARY_PAGE_SIZE = 20;

/**
 * The shape a filter takes in a cache key — built once so a key and the
 * request it stands for cannot describe different things.
 *
 * `zone` is part of it because it decides which 90 days the server defaults
 * to, so two zones are genuinely two answers. It is key-only: the request
 * carries the zone as the `X-Timezone` header, which React Query cannot see.
 */
function readParams(filter: DiaryFilter) {
  return {
    goalId: filter.goalId ?? null,
    tag: filter.tag ?? null,
    from: filter.from ?? null,
    to: filter.to ?? null,
    limit: filter.limit ?? DIARY_PAGE_SIZE,
    zone: deviceTimezone(),
  };
}

/** Query keys for this feature, as a factory so they cannot drift apart. */
export const diaryKeys = {
  all: ['diary'] as const,
  lists: () => [...diaryKeys.all, 'list'] as const,
  list: (filter: DiaryFilter = {}) =>
    [...diaryKeys.lists(), readParams(filter)] as const,
  detail: (id: string) =>
    [...diaryKeys.all, 'detail', id, deviceTimezone()] as const,
};

/**
 * Anything outside 1-5 reads as no answer, the same rule `features/logs` and
 * `features/goals` each apply to the column this comes from.
 *
 * Spelled out here rather than imported for the reason `toHabit` is in
 * `features/goals/api.ts`: reaching into another feature's barrel for a helper
 * is what builds the require cycles Metro resolves to a half-built module.
 */
function toMood(value: number | null): MoodScore | null {
  if (value === null) return null;
  return value >= 1 && value <= 5 ? (value as MoodScore) : null;
}

const toGoal = (wire: WireDiaryGoal): DiaryGoal => ({
  id: wire.id,
  name: wire.name,
  colorSlot: wire.color_slot,
  archived: wire.archived,
  trackingFrequency: wire.tracking_frequency,
  streakRule: wire.streak_rule,
  streakThreshold: wire.streak_threshold,
});

const toCheckIn = (wire: WireDiaryCheckIn): DiaryCheckIn => ({
  habitLogId: wire.habit_log_id,
  goal: toGoal(wire.goal),
  mood: toMood(wire.mood),
  answered: wire.answered,
  skipped: wire.skipped,
  total: wire.total,
  completion: wire.completion,
  status: wire.status,
  countsForStreak: wire.counts_for_streak,
  endDate: wire.end_date,
});

const toNote = (wire: WireDiaryNote): DiaryNote => ({
  id: wire.id,
  entryDate: wire.entry_date,
  body: wire.body,
  tags: wire.tags,
  checkIn: wire.check_in === null ? null : toCheckIn(wire.check_in),
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

const toCheckInNote = (wire: WireCheckInNote): CheckInNote => ({
  id: wire.id,
  body: wire.body,
  tags: wire.tags,
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

/**
 * camelCase in, snake_case out, and a key the caller left out never reaches
 * the body — that absence is what makes a patch leave a field alone.
 *
 * The body is trimmed at the ends only: the server refuses one that is all
 * whitespace and counts the rest against its 2000, and the paragraphs inside
 * are the person's.
 */
function toWriteBody(patch: NotePatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.entryDate !== undefined) body.entry_date = patch.entryDate;
  if (patch.body !== undefined) body.body = patch.body.trim();
  if (patch.tags !== undefined) body.tags = patch.tags;
  return body;
}

/**
 * One page of the diary, newest first — a check-in's note where its check-in
 * sits, not where the note was written.
 *
 * `cursor` is the previous page's `nextCursor` and nothing else: it is a
 * token this endpoint minted, opaque on purpose. `null` asks for the first
 * page. The zone rides on the `X-Timezone` header, which the endpoint requires.
 */
export async function listNotes(
  filter: DiaryFilter = {},
  cursor: string | null = null,
): Promise<DiaryPage> {
  const { data } = await api.get<WireDiaryNotes>(paths.notes, {
    params: {
      limit: filter.limit ?? DIARY_PAGE_SIZE,
      ...(filter.goalId === undefined ? {} : { goal_id: filter.goalId }),
      ...(filter.tag === undefined ? {} : { tag: filter.tag }),
      ...(filter.from === undefined ? {} : { from: filter.from }),
      ...(filter.to === undefined ? {} : { to: filter.to }),
      ...(cursor === null ? {} : { cursor }),
    },
  });

  return {
    notes: data.notes.map(toNote),
    total: data.total,
    // The server sends "" for the last page and for a plan that reads
    // everything; null is what the rest of the app means by "there is no more".
    nextCursor: data.next_cursor === '' ? null : data.next_cursor,
    from: data.from,
    to: data.to,
    timezone: data.timezone,
    historyCutoff: data.history_cutoff === '' ? null : data.history_cutoff,
    hasMoreHistory: data.has_more_history,
  };
}

/**
 * One note, with its check-in scored the way the list scores it. Not bounded
 * by the plan's history cutoff: naming a note by id reads it back.
 */
export async function getNote(id: string): Promise<DiaryNote> {
  const { data } = await api.get<WireDiaryNote>(paths.note(id));
  return toNote(data);
}

/** A note written on its own, into the user's one diary. Capped per plan. */
export async function createNote(draft: NoteDraft): Promise<DiaryNote> {
  const { data } = await api.post<WireDiaryNote>(
    paths.notes,
    toWriteBody(draft),
  );
  return toNote(data);
}

export async function updateNote(
  id: string,
  patch: NotePatch,
): Promise<DiaryNote> {
  const { data } = await api.patch<WireDiaryNote>(
    paths.note(id),
    toWriteBody(patch),
  );
  return toNote(data);
}

/** A check-in that pointed at it keeps its answers and mood. */
export async function deleteNote(id: string): Promise<void> {
  await api.delete(paths.note(id));
}

/**
 * Adds a note to a saved check-in. Never replaces one: a check-in carries any
 * number. Capped by the same plan limit as a note written on its own.
 */
export async function addCheckInNote(
  logId: string,
  draft: CheckInNoteDraft,
): Promise<CheckInNote> {
  const { data } = await api.post<WireCheckInNote>(
    paths.checkInNotes(logId),
    toWriteBody(draft),
  );
  return toCheckInNote(data);
}

export async function updateCheckInNote(
  logId: string,
  noteId: string,
  patch: CheckInNotePatch,
): Promise<CheckInNote> {
  const { data } = await api.patch<WireCheckInNote>(
    paths.checkInNote(logId, noteId),
    toWriteBody(patch),
  );
  return toCheckInNote(data);
}

export async function deleteCheckInNote(
  logId: string,
  noteId: string,
): Promise<void> {
  await api.delete(paths.checkInNote(logId, noteId));
}
