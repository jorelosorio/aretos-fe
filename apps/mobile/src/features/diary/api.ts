import { api } from '@/lib/api';
import { deviceTimezone } from '@/lib/timezone';

import type { MoodScore } from '@/features/logs';

import type {
  DiaryEntry,
  DiaryFilter,
  DiaryGoal,
  DiaryPage,
  WireDiary,
  WireDiaryEntry,
  WireDiaryGoal,
} from './types';

/** Requests for the diary feature, mirroring `aretos-be/bruno/Diary/`. */
const paths = {
  diary: '/v1/diary',
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
 * `tz` is part of it because it decides which 90 days the server defaults to,
 * so two zones are genuinely two answers.
 */
function readParams(filter: DiaryFilter) {
  return {
    goalId: filter.goalId ?? null,
    from: filter.from ?? null,
    to: filter.to ?? null,
    limit: filter.limit ?? DIARY_PAGE_SIZE,
    tz: deviceTimezone() ?? null,
  };
}

/** Query keys for this feature, as a factory so they cannot drift apart. */
export const diaryKeys = {
  all: ['diary'] as const,
  lists: () => [...diaryKeys.all, 'list'] as const,
  list: (filter: DiaryFilter = {}) =>
    [...diaryKeys.lists(), readParams(filter)] as const,
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

const toEntry = (wire: WireDiaryEntry): DiaryEntry => ({
  id: wire.id,
  entryDate: wire.entry_date,
  goal: toGoal(wire.goal),
  note: wire.note,
  mood: toMood(wire.mood),
  answered: wire.answered,
  skipped: wire.skipped,
  total: wire.total,
  completion: wire.completion,
  status: wire.status,
  countsForStreak: wire.counts_for_streak,
  createdAt: wire.created_at,
  updatedAt: wire.updated_at,
});

/**
 * One page of the diary, newest first.
 *
 * `cursor` is the previous page's `nextCursor` and nothing else: it is a token
 * this endpoint minted, opaque on purpose, because what the page turns on is
 * the server's business and a caller that built its own would keep sending it
 * after the ordering changed. `null` asks for the first page.
 *
 * `tz` is sent from the device rather than left to the stored `users.timezone`
 * for the reason `features/goals` sends it: the phone is the only thing that
 * knows the user got on a plane, and the zone is what decides which day the
 * default window ends on.
 */
export async function listDiary(
  filter: DiaryFilter = {},
  cursor: string | null = null,
): Promise<DiaryPage> {
  const tz = deviceTimezone();

  const { data } = await api.get<WireDiary>(paths.diary, {
    params: {
      limit: filter.limit ?? DIARY_PAGE_SIZE,
      ...(filter.goalId === undefined ? {} : { goal_id: filter.goalId }),
      ...(filter.from === undefined ? {} : { from: filter.from }),
      ...(filter.to === undefined ? {} : { to: filter.to }),
      ...(cursor === null ? {} : { cursor }),
      ...(tz === undefined ? {} : { tz }),
    },
  });

  return {
    entries: data.entries.map(toEntry),
    total: data.total,
    // The server sends "" for the last page and for a plan that reads
    // everything; null is what the rest of the app means by "there is no more".
    nextCursor: data.next_cursor === '' ? null : data.next_cursor,
    from: data.from,
    to: data.to,
    timezone: data.timezone,
    historyCutoff: data.history_cutoff === '' ? null : data.history_cutoff,
  };
}
