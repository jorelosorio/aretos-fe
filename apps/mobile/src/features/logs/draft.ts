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
 *
 * Notes are not in the snapshot. A saved period's notes are written one at a
 * time through their own routes and the Save button never touches them. A
 * period with no log yet cannot take a note, so notes written there wait in
 * `pending` and are posted by `save` once the log exists — see
 * `pending-notes.ts` for why writing a note must not save the check-in.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { useAddCheckInNote } from '@/features/diary';
import type { Habit } from '@/features/habits';
import { runExclusive } from '@/lib/exclusive';

import { useSaveLog } from './hooks';
import type { DateKey } from './period';
import {
  applyPostResult,
  saveThenPost,
  type NoteBody,
  type PendingNote,
} from './pending-notes';
import { emptyEntry, isAnswered, type LogEntry, type MoodScore } from './types';

type EntryPatch = Partial<Omit<LogEntry, 'habitId'>>;

type Entries = Record<string, LogEntry>;

/** The draft's contents, as they stood at the last seed or the last save. */
type Snapshot = { mood: MoodScore | null; entries: Entries };

const EMPTY_SNAPSHOT: Snapshot = { mood: null, entries: {} };

/**
 * The saved period this draft starts from, or `undefined` when unwritten.
 *
 * Narrower than `Log` on purpose. The draft only ever reads these two, and
 * the check-in now gets them from the goal's `?include=progress` block rather
 * than from `/v1/habit-logs` — a `GoalPeriod` satisfies this shape as-is, so
 * neither caller has to build a `Log` it does not have the ids for.
 */
export type SavedPeriod = {
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
 * Whether the draft says anything the snapshot does not.
 *
 * Compared value by value over the union of both maps rather than by
 * identity: `setEntry` replaces the object it touches, so reference equality
 * would read a number typed and typed back again as a change — and the
 * check-in would write a period nobody edited every time it changed day.
 */
function hasChanged(draft: Snapshot, saved: Snapshot): boolean {
  if (draft.mood !== saved.mood) return true;

  const ids = new Set([
    ...Object.keys(draft.entries),
    ...Object.keys(saved.entries),
  ]);

  for (const id of ids) {
    const left = draft.entries[id] ?? emptyEntry(id);
    const right = saved.entries[id] ?? emptyEntry(id);

    if (
      left.skipped !== right.skipped ||
      left.done !== right.done ||
      left.amount !== right.amount
    ) {
      return true;
    }
  }

  return false;
}

let pendingSequence = 0;

/** Unique for the life of the app, which is all a React key needs. */
const nextPendingKey = () => `pending-${(pendingSequence += 1)}`;

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
  const { saveLog, error: saveError } = useSaveLog();
  const { addCheckInNote } = useAddCheckInNote();

  // One save at a time, for the whole of it: the period and then each
  // waiting note. The mutation's own `isPending` ends with the period, and a
  // second tap while the notes are still going up would post them twice.
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const [mood, setMood] = useState<MoodScore | null>(null);
  const [entries, setEntries] = useState<Entries>({});
  const [pending, setPending] = useState<PendingNote[]>([]);

  // What the period read as when it was seeded, and again after every save.
  // The week strip puts all seven days one tap apart, so leaving a period is
  // now something a person does in passing; this is what lets the check-in
  // write the day it is leaving instead of discarding it.
  const [saved, setSaved] = useState<Snapshot>(EMPTY_SNAPSHOT);

  // Set during render rather than in an effect: this is React's own answer to
  // state that has to follow a prop, and it re-renders before painting, so
  // moving to another period never shows the previous one's answers for a
  // frame. Keyed on the period alone, not on the log's `updatedAt`, so a
  // background refetch cannot overwrite what the person is in the middle of
  // typing.
  const seed = `${goalId}:${entryDate}`;
  const [seeded, setSeeded] = useState<string | null>(null);
  if (isLoaded && seeded !== seed) {
    const opening = {
      mood: existing?.mood ?? null,
      entries: seedEntries(habits, existing),
    };

    setSeeded(seed);
    setMood(opening.mood);
    setEntries(opening.entries);
    setPending([]);
    setSaved(opening);
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

  const addPending = useCallback((note: NoteBody) => {
    setPending((current) => [
      ...current,
      { ...note, key: nextPendingKey(), failed: false, error: null },
    ]);
  }, []);

  const updatePending = useCallback((key: string, note: NoteBody) => {
    setPending((current) =>
      current.map((item) =>
        item.key === key
          ? { ...item, ...note, failed: false, error: null }
          : item,
      ),
    );
  }, []);

  const removePending = useCallback((key: string) => {
    setPending((current) => current.filter((item) => item.key !== key));
  }, []);

  // The snapshot only moves once the period itself is written. A save that
  // failed left the server holding the old period, and calling the draft
  // clean would let the next day change walk away from the answers it could
  // not write. Resolves false when a note is still waiting after the period
  // saved — or when a save was already running — so the caller stays on
  // screen rather than leaving twice or dropping a note.
  const save = useCallback(async (): Promise<boolean> => {
    const complete = await runExclusive(saving, async () => {
      setIsSaving(true);
      try {
        const result = await saveThenPost(
          async () => {
            const written = await saveLog({
              goalId,
              entryDate,
              mood,
              entries: Object.values(entries),
            });
            setSaved({ mood, entries });
            return written;
          },
          pending,
          (logId, note) => addCheckInNote({ logId, note }),
        );

        setPending((current) => applyPostResult(current, result));
        return result.failed === null;
      } finally {
        setIsSaving(false);
      }
    });

    return complete === true;
  }, [saveLog, addCheckInNote, goalId, entryDate, mood, entries, pending]);

  return {
    /**
     * True until this period has been seeded at least once.
     *
     * The caller owns the load and its error; a read that failed never sets
     * `isLoaded`, so this stays true and the caller must show the failure
     * rather than a spinner that never stops.
     */
    isLoading: seeded !== seed,

    mood,
    setMood,

    entryFor,
    setEntry,
    toggleSkip,

    /** How many of the goal's habits have an answer, for a progress line. */
    answered,
    total: habits.length,

    /** Notes waiting for the period's first save, in the order written. */
    pending,
    addPending,
    updatePending,
    removePending,

    /** Whether the period holds anything the server has not been told. */
    isDirty: hasChanged({ mood, entries }, saved) || pending.length > 0,

    save,
    /** The period and its waiting notes, start to finish. */
    isSaving,
    saveError,
  };
}
