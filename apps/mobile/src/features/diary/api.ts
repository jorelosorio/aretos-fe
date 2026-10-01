import type { QueryKey } from '@tanstack/react-query';

import { goalKeys } from '@/features/goals/api';
import { limitKeys } from '@/features/limits/api';
import type { MoodScore } from '@/features/logs/types';
import { tagKeys } from '@/features/tags/api';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { deviceTimezone } from '@/lib/timezone';

import { toTimestamp } from './timestamps';

import {
  DiaryErrorCode,
  type CheckInNote,
  type CheckInNoteDraft,
  type DiaryCheckIn,
  type DiaryFilter,
  type DiaryGoal,
  type DiaryNote,
  type DiaryPage,
  type NotePatch,
  type OfflineFields,
  type WireCheckInNote,
  type WireDiaryCheckIn,
  type WireDiaryGoal,
  type WireDiaryNote,
  type WireDiaryNotes,
} from './types';

/**
 * Every request the diary makes, mirroring `aretos-be/bruno/DiaryNotes/`,
 * the `notes-*` requests in `aretos-be/bruno/HabitLogs/`, and the writes of
 * `aretos-be/docs/sync.md`. Nothing else in the feature names a path.
 */
const paths = {
  notes: '/v1/diary-notes',
  note: (id: string) => `/v1/diary-notes/${id}`,
  checkInNotes: (logId: string) => `/v1/habit-logs/${logId}/notes`,
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
 * Every read a note reaching or leaving the server moves: the diary, the
 * check-in's log (it carries its notes), the goals' calendars (each period
 * counts its notes), the tag suggestions and the plan's note usage. Read
 * again after a sync that changed notes, and after a note added online.
 *
 * `['logs']` is `logKeys.all` spelled out: `features/logs` imports this
 * feature, and importing it back is a require cycle Metro resolves to a
 * half-built module. The key's first segment is the whole contract.
 */
export const noteReadKeys: readonly QueryKey[] = [
  diaryKeys.all,
  ['logs'],
  goalKeys.all,
  tagKeys.all,
  limitKeys.all,
];

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
  streakSkipLimit: wire.streak_skip_limit,
});

export const toCheckIn = (wire: WireDiaryCheckIn): DiaryCheckIn => ({
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
  listedAt: toTimestamp(wire.listed_at),
  createdAt: toTimestamp(wire.created_at),
  updatedAt: toTimestamp(wire.updated_at),
  sync: { state: 'synced', errorCode: null },
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
 * One note as the server has it, or `null` when it has none — deleted, or
 * never the caller's. Not bounded by the plan's history cutoff: naming a note
 * by id reads it back.
 */
export async function getWireNote(id: string): Promise<WireDiaryNote | null> {
  try {
    const { data } = await api.get<WireDiaryNote>(paths.note(id));
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.code === DiaryErrorCode.NotFound) {
      return null;
    }
    throw error;
  }
}

/**
 * Adds a note to a saved check-in. Never replaces one: a check-in carries any
 * number. Capped by the same plan limit as a note written on its own.
 *
 * `offline` is what a device that wrote the note offline sends with it — its
 * own id and when it wrote it (`aretos-be/docs/sync.md`).
 */
export async function addCheckInNote(
  logId: string,
  draft: CheckInNoteDraft,
  offline: OfflineFields = {},
): Promise<CheckInNote> {
  const { data } = await api.post<WireCheckInNote>(paths.checkInNotes(logId), {
    ...toWriteBody(draft),
    ...offline,
  });
  return toCheckInNote(data);
}

/**
 * The writes the device's queue sends (`sync.ts`). Each takes the queued
 * change's fields as they are stored — already trimmed, already in the
 * routes' own names — and answers with the server's copy of the note.
 */

/** A note written on its own, under the device's own id. Capped per plan. */
export async function sendNewNote(
  id: string,
  fields: Record<string, unknown>,
): Promise<WireDiaryNote> {
  const { data } = await api.post<WireDiaryNote>(paths.notes, {
    ...fields,
    id,
  });
  return data;
}

/**
 * An edit. `version` is the one the device edited; the server refuses the
 * edit when the note has moved past it.
 */
export async function sendNoteEdit(
  id: string,
  fields: Record<string, unknown>,
  version: number | null,
): Promise<WireDiaryNote> {
  const { data } = await api.patch<WireDiaryNote>(paths.note(id), {
    ...fields,
    ...(version === null ? {} : { version }),
  });
  return data;
}

/** A delete, refused the same way when the note has moved past `version`. */
export async function sendNoteDelete(
  id: string,
  version: number | null,
): Promise<void> {
  await api.delete(paths.note(id), {
    params: version === null ? {} : { version },
  });
}
