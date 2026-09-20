/**
 * The check-in's editing state: one goal's period, loaded if it exists and
 * blank if it does not, with the entries the person changes as they go.
 *
 * A draft exists because Save is declarative. `POST /v1/habit-logs` overwrites
 * the period with exactly what it is sent and deletes any habit it does not
 * mention, so the screen cannot send a diff — it has to hold the whole period
 * and hand it over in one piece. Starting from what is already saved is not a
 * convenience, it is what stops a second save from erasing the first.
 *
 * The load itself is the caller's: the check-in reads the goal, its habits
 * and the period in one request, so this holds editing state and nothing
 * else. What it still insists on is `isLoaded` — a draft seeded before the
 * period arrives is a blank one, and saving it would wipe the period.
 */

import { useCallback, useMemo, useState } from 'react';

import type { Habit } from '@/features/habits';

import { useSaveLog } from './hooks';
import type { DateKey } from './period';
import { emptyEntry, isAnswered, type LogEntry, type MoodScore } from './types';

type EntryPatch = Partial<Omit<LogEntry, 'habitId'>>;

type Entries = Record<string, LogEntry>;

/**
 * The saved period this draft starts from, or `undefined` when unwritten.
 *
 * Narrower than `Log` on purpose. The draft only ever reads these three, and
 * the check-in now gets them from the goal's `?include=progress` block rather
 * than from `/v1/habit-logs` — a `GoalPeriod` satisfies this shape as-is, so
 * neither caller has to build a `Log` it does not have the ids for.
 */
export type SavedPeriod = {
  note: string;
  mood: MoodScore | null;
  entries: readonly LogEntry[];
};

/**
 * Seeded from the saved log first and the goal's habits second.
 *
 * The union matters on the way out, not on the way in: a habit archived after
 * it was logged is no longer in `habits`, and seeding from `habits` alone
 * would drop its entry from the map and so delete it from the period on the
 * next save. Its result rides along untouched instead — the screen renders
 * `habits`, the save sends everything.
 */
function seedEntries(
  habits: readonly Habit[],
  saved: SavedPeriod | undefined,
): Entries {
  const entries: Entries = {};
  for (const entry of saved?.entries ?? []) entries[entry.habitId] = entry;
  for (const habit of habits) entries[habit.id] ??= emptyEntry(habit.id);
  return entries;
}

/**
 * `entryDate` and `existing` are handed in rather than fetched.
 *
 * The check-in loads the goal, its habits and the period in one request, so
 * the draft has no lookup left to own — and `entryDate` is the period the
 * server answered with, not one the device snapped and hoped matched.
 *
 * `isLoaded` gates the seeding: seeding from a period that has not arrived
 * would blank a written one, and the save that followed would erase it.
 */
export function useLogDraft({
  goalId,
  habits,
  entryDate,
  existing,
  isLoaded,
}: {
  goalId: string;
  habits: readonly Habit[];
  entryDate: DateKey;
  existing: SavedPeriod | undefined;
  isLoaded: boolean;
}) {
  const { saveLog, isSaving, error: saveError } = useSaveLog();

  const [note, setNote] = useState('');
  const [mood, setMood] = useState<MoodScore | null>(null);
  const [entries, setEntries] = useState<Entries>({});

  // Set during render rather than in an effect: this is React's own answer to
  // state that has to follow a prop, and it re-renders before painting, so
  // moving to another period never shows the previous one's answers for a
  // frame. Keyed on the period alone, not on the log's `updatedAt`, so a
  // background refetch cannot overwrite what the person is in the middle of
  // typing.
  const seed = `${goalId}:${entryDate}`;
  const [seeded, setSeeded] = useState<string | null>(null);
  if (isLoaded && seeded !== seed) {
    setSeeded(seed);
    setNote(existing?.note ?? '');
    setMood(existing?.mood ?? null);
    setEntries(seedEntries(habits, existing));
  }

  const entryFor = useCallback(
    (habitId: string): LogEntry => entries[habitId] ?? emptyEntry(habitId),
    [entries],
  );

  const setEntry = useCallback((habitId: string, patch: EntryPatch) => {
    setEntries((current) => ({
      ...current,
      [habitId]: { ...(current[habitId] ?? emptyEntry(habitId)), ...patch },
    }));
  }, []);

  // Un-skipping returns the habit to unanswered rather than to whatever it
  // held before: the person took the period back, and restoring a value they
  // had already dismissed would put an answer in their mouth.
  const toggleSkip = useCallback((habitId: string) => {
    setEntries((current) => {
      const skipped = current[habitId]?.skipped ?? false;
      return {
        ...current,
        [habitId]: { ...emptyEntry(habitId), skipped: !skipped },
      };
    });
  }, []);

  const answered = useMemo(
    () => habits.filter((habit) => isAnswered(entryFor(habit.id))).length,
    [habits, entryFor],
  );

  const save = useCallback(
    () =>
      saveLog({
        goalId,
        entryDate,
        note,
        mood,
        entries: Object.values(entries),
      }),
    [saveLog, goalId, entryDate, note, mood, entries],
  );

  return {
    /**
     * True until this period has been seeded at least once.
     *
     * The caller owns the load and its error; a read that failed never sets
     * `isLoaded`, so this stays true and the caller must show the failure
     * rather than a spinner that never stops.
     */
    isLoading: seeded !== seed,

    note,
    setNote,
    mood,
    setMood,

    entryFor,
    setEntry,
    toggleSkip,

    /** How many of the goal's habits have an answer, for a progress line. */
    answered,
    total: habits.length,

    save,
    isSaving,
    saveError,
  };
}
