/**
 * The check-in's editing state: one goal's period, loaded if it exists and
 * blank if it does not, with the entries the person changes as they go.
 *
 * A draft exists because Save is declarative. `POST /v1/habit-logs` overwrites
 * the period with exactly what it is sent and deletes any habit it does not
 * mention, so the screen cannot send a diff — it has to hold the whole period
 * and hand it over in one piece. Loading the existing log first is not a
 * convenience, it is what stops a second save from erasing the first.
 */

import { useCallback, useMemo, useState } from 'react';

import type { Goal } from '@/features/goals';
import type { Habit } from '@/features/habits';

import { useLogForPeriod, useSaveLog } from './hooks';
import { periodKey, type DateKey } from './period';
import {
  emptyEntry,
  isAnswered,
  type Log,
  type LogEntry,
  type MoodScore,
} from './types';

type EntryPatch = Partial<Omit<LogEntry, 'habitId'>>;

type Entries = Record<string, LogEntry>;

/**
 * Seeded from the saved log first and the goal's habits second.
 *
 * The union matters on the way out, not on the way in: a habit archived after
 * it was logged is no longer in `habits`, and seeding from `habits` alone
 * would drop its entry from the map and so delete it from the period on the
 * next save. Its result rides along untouched instead — the screen renders
 * `habits`, the save sends everything.
 */
function seedEntries(habits: readonly Habit[], log: Log | undefined): Entries {
  const entries: Entries = {};
  for (const entry of log?.entries ?? []) entries[entry.habitId] = entry;
  for (const habit of habits) entries[habit.id] ??= emptyEntry(habit.id);
  return entries;
}

export function useLogDraft({
  goal,
  habits,
  date,
}: {
  goal: Goal;
  habits: readonly Habit[];
  date: DateKey;
}) {
  const entryDate = periodKey(date, goal.trackingFrequency);

  const {
    data: existing,
    isSuccess,
    isFetching,
    error: loadError,
  } = useLogForPeriod(goal.id, entryDate);
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
  const seed = `${goal.id}:${entryDate}`;
  const [seeded, setSeeded] = useState<string | null>(null);
  if (isSuccess && seeded !== seed) {
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
        goalId: goal.id,
        entryDate,
        note,
        mood,
        entries: Object.values(entries),
      }),
    [saveLog, goal.id, entryDate, note, mood, entries],
  );

  return {
    /** The period being written — already snapped, so safe to display. */
    entryDate,
    /** The saved log for this period, or `undefined` if it is unwritten. */
    existing,
    /**
     * True until the period's own log has been looked for at least once.
     *
     * A screen showing a spinner on this has to handle `loadError` too: a
     * lookup that failed never seeds, so the flag stays true and the spinner
     * would never stop on its own.
     */
    isLoading: seeded !== seed,
    isRefreshing: isFetching,
    /** The lookup failed. Writing over a period that could not be read would
     * erase it, so this is a wall, not a warning. */
    loadError,

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
