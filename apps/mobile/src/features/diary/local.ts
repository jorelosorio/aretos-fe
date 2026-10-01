import { randomUUID } from 'expo-crypto';
import { and, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';

import { addTag, sameTags } from '@/features/tags/rules';
import type { Database } from '@/lib/db/client';
import { diaryNoteTags, diaryNotes } from '@/lib/db/schema/diary';
import { syncRows } from '@/lib/db/schema/sync';
import type { ChangeFields } from '@/lib/sync/queue';
import {
  countUnsynced,
  dropQueued,
  enqueue,
  forgetRowState,
  isOnServer,
  markRow,
  readState,
  type Executor,
  type RowState,
} from '@/lib/sync/store';
import { deviceTimezone } from '@/lib/timezone';

import { DIARY_PAGE_SIZE, toCheckIn } from './api';
import { planNoteWrite } from './routing';
import { nowTimestamp, toTimestamp } from './timestamps';
import type {
  DiaryFilter,
  DiaryNote,
  DiaryPage,
  NoteDraft,
  WireDiaryCheckIn,
  WireDiaryNote,
} from './types';

/**
 * The diary as the device holds it: read, filtered and written here, with
 * or without a connection. `sync.ts` is its adapter to the sync engine in
 * `lib/sync`, which trades it with the server.
 *
 * The reads answer the same questions `/v1/diary-notes` does, in the same
 * order — `listed_at`, `created_at`, `id`, newest first — so the diary reads
 * the same whichever of the two filled it.
 *
 * Every write is one transaction: the note, its tags, where it stands with
 * the server, and the change queued to send. A note can never be saved
 * without the change that will carry it.
 */

/** The notes' name in the server's feed and in sync's tables. */
export const NOTES = 'diary_notes';

/** Keys the diary keeps in `sync_state`. */
export const StateKey = {
  /** The plan's history floor, `''` when it reads everything. */
  historyCutoff: 'diary.history_cutoff',
  /** `'1'` when notes sit behind the cutoff. */
  hasMoreHistory: 'diary.has_more_history',
  /** When the floor was last read, in epoch milliseconds. */
  floorCheckedAt: 'diary.floor_checked_at',
} as const;

type NoteRow = typeof diaryNotes.$inferSelect;

/** A note's own record in `sync_rows`, for joining onto the diary. */
const noteState = and(
  eq(syncRows.entity, NOTES),
  eq(syncRows.rowId, diaryNotes.id),
);

function toLocalNote(
  row: NoteRow,
  state: RowState | null,
  tags: string[],
): DiaryNote {
  return {
    id: row.id,
    entryDate: row.entryDate,
    body: row.body,
    tags,
    checkIn:
      row.checkIn === null
        ? null
        : toCheckIn(JSON.parse(row.checkIn) as WireDiaryCheckIn),
    listedAt: row.listedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    sync: {
      state: state?.state ?? 'synced',
      errorCode: state?.errorCode ?? null,
    },
  };
}

function tagsByNote(db: Executor, ids: string[]): Map<string, string[]> {
  const byNote = new Map<string, string[]>();
  if (ids.length === 0) return byNote;

  const rows = db
    .select()
    .from(diaryNoteTags)
    .where(inArray(diaryNoteTags.diaryNoteId, ids))
    .orderBy(sql`lower(${diaryNoteTags.name})`)
    .all();
  for (const row of rows) {
    byNote.set(row.diaryNoteId, [
      ...(byNote.get(row.diaryNoteId) ?? []),
      row.name,
    ]);
  }
  return byNote;
}

/** The later of two `YYYY-MM-DD` dates, either of which may be absent. */
const later = (a?: string | null, b?: string | null) =>
  !a ? (b ?? undefined) : !b ? a : a > b ? a : b;

/**
 * The diary list's filters, as `ListDiaryEntries` applies them: the plan's
 * floor raised over `from`, a tag matched ignoring case, a goal named by
 * its check-in — and, with no goal named, an archived goal's notes left out.
 * A note deleted here and not yet confirmed is hidden.
 */
function filterWhere(filter: DiaryFilter, cutoff: string | undefined): SQL {
  const conditions: SQL[] = [sql`coalesce(${syncRows.deleted}, 0) = 0`];

  const from = later(filter.from, cutoff);
  if (from !== undefined) {
    conditions.push(sql`${diaryNotes.entryDate} >= ${from}`);
  }
  if (filter.to !== undefined) {
    conditions.push(sql`${diaryNotes.entryDate} <= ${filter.to}`);
  }
  if (filter.tag !== undefined) {
    conditions.push(sql`exists (
      select 1 from ${diaryNoteTags}
      where ${diaryNoteTags.diaryNoteId} = ${diaryNotes.id}
        and lower(${diaryNoteTags.name}) = lower(${filter.tag}))`);
  }
  conditions.push(
    filter.goalId !== undefined
      ? sql`json_extract(${diaryNotes.checkIn}, '$.goal.id') = ${filter.goalId}`
      : sql`coalesce(json_extract(${diaryNotes.checkIn}, '$.goal.archived'), 0) = 0`,
  );

  return and(...conditions) as SQL;
}

type Cursor = { listedAt: string; createdAt: string; id: string };

/**
 * One page of the diary, in `DiaryPage`'s shape so the screens read it as
 * they read the server's. Keyset paging on the diary's own order: the
 * cursor is the last row's three columns, as JSON.
 */
export function readDiaryPage(
  db: Database,
  filter: DiaryFilter,
  cursor: string | null,
): DiaryPage {
  const size = filter.limit ?? DIARY_PAGE_SIZE;
  const cutoff = readState(db, StateKey.historyCutoff) || undefined;
  const where = filterWhere(filter, cutoff);

  const after = cursor === null ? null : (JSON.parse(cursor) as Cursor);
  const keyset =
    after === null
      ? undefined
      : sql`(${diaryNotes.listedAt}, ${diaryNotes.createdAt}, ${diaryNotes.id})
            < (${after.listedAt}, ${after.createdAt}, ${after.id})`;

  const rows = db
    .select({ note: diaryNotes, state: syncRows })
    .from(diaryNotes)
    .leftJoin(syncRows, noteState)
    .where(keyset === undefined ? where : and(where, keyset))
    .orderBy(
      desc(diaryNotes.listedAt),
      desc(diaryNotes.createdAt),
      desc(diaryNotes.id),
    )
    .limit(size + 1)
    .all();

  const page = rows.slice(0, size);
  const last = page.at(-1)?.note;
  const tags = tagsByNote(
    db,
    page.map(({ note }) => note.id),
  );

  // Counted for the first page only: the screens read the total off it,
  // and the range does not change as it is paged.
  const total =
    cursor !== null
      ? 0
      : (db
          .select({ count: sql<number>`count(*)` })
          .from(diaryNotes)
          .leftJoin(syncRows, noteState)
          .where(where)
          .get()?.count ?? 0);

  return {
    notes: page.map(({ note, state }) =>
      toLocalNote(note, state, tags.get(note.id) ?? []),
    ),
    total,
    nextCursor:
      rows.length > size && last !== undefined
        ? JSON.stringify({
            listedAt: last.listedAt,
            createdAt: last.createdAt,
            id: last.id,
          })
        : null,
    from: cutoff ?? null,
    to: filter.to ?? null,
    timezone: deviceTimezone(),
    historyCutoff: cutoff ?? null,
    hasMoreHistory: readState(db, StateKey.hasMoreHistory) === '1',
  };
}

/**
 * One note; `deleted` for one deleted here and not yet confirmed; `null` when
 * the device does not hold it.
 */
export function readNote(
  db: Database,
  id: string,
): DiaryNote | 'deleted' | null {
  const row = db
    .select({ note: diaryNotes, state: syncRows })
    .from(diaryNotes)
    .leftJoin(syncRows, noteState)
    .where(eq(diaryNotes.id, id))
    .get();
  if (row === undefined) return null;
  if (row.state?.deleted === true) return 'deleted';
  return toLocalNote(row.note, row.state, tagsByNote(db, [id]).get(id) ?? []);
}

/**
 * How many notes the server does not have as they are here — waiting to go,
 * or refused: what signing out would lose, and so what it warns about.
 */
export function countUnsyncedNotes(db: Database): number {
  return countUnsynced(db, NOTES);
}

function replaceTags(db: Executor, noteId: string, tags: readonly string[]) {
  db.delete(diaryNoteTags).where(eq(diaryNoteTags.diaryNoteId, noteId)).run();

  // The server's rules, which `addTag` mirrors: trimmed, repeats dropped
  // ignoring case with the first spelling kept, and the same caps.
  const names = tags.reduce<string[]>(addTag, []);
  if (names.length > 0) {
    db.insert(diaryNoteTags)
      .values(names.map((name) => ({ diaryNoteId: noteId, name })))
      .run();
  }
}

/**
 * Refuses a write to a note the device does not hold. Every note a screen
 * can show is held — `useNote` keeps one it reads from the server — so this
 * is a broken invariant, and failing loudly beats an edit that saves nowhere.
 */
function requireHeld(db: Executor, id: string) {
  const held = db
    .select({ id: diaryNotes.id })
    .from(diaryNotes)
    .where(eq(diaryNotes.id, id))
    .get();
  if (held === undefined) throw new Error(`note ${id} is not on this device`);
}

/** A note's whole content, as a create sends it. */
export function createFields(
  db: Executor,
  noteId: string,
): ChangeFields | null {
  const row = db
    .select()
    .from(diaryNotes)
    .where(eq(diaryNotes.id, noteId))
    .get();
  if (row === undefined) return null;

  return {
    entry_date: row.entryDate,
    body: row.body,
    tags: tagsByNote(db, [noteId]).get(noteId) ?? [],
    written_at: row.createdAt,
    ...(row.habitLogId === null ? {} : { habit_log_id: row.habitLogId }),
  };
}

/**
 * Saves the editor's value: a new note, or an edit to one. Returns the
 * note's id, which for a new note is made up here and never changes.
 */
export function saveNote(
  db: Database,
  note: DiaryNote | null,
  value: NoteDraft,
): string {
  const plan = planNoteWrite(note, value);
  const now = nowTimestamp();

  return db.transaction((tx) => {
    if (plan.kind === 'create') {
      const id = randomUUID();
      const body = plan.draft.body.trim();
      tx.insert(diaryNotes)
        .values({
          id,
          entryDate: plan.draft.entryDate,
          body,
          listedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      replaceTags(tx, id, plan.draft.tags);
      markRow(tx, NOTES, id, {
        serverVersion: null,
        state: 'pending',
        errorCode: null,
      });
      enqueue(tx, NOTES, id, {
        op: 'create',
        fields: {
          entry_date: plan.draft.entryDate,
          body,
          tags: plan.draft.tags,
          written_at: now,
        },
      });
      return id;
    }

    const { id, patch } = plan;
    requireHeld(tx, id);
    const { entryDate } = patch;
    const body = patch.body?.trim();

    tx.update(diaryNotes)
      .set({
        ...(body === undefined ? {} : { body }),
        ...(entryDate === undefined ? {} : { entryDate }),
        updatedAt: now,
      })
      .where(eq(diaryNotes.id, id))
      .run();
    if (patch.tags !== undefined) replaceTags(tx, id, patch.tags);

    // A note the server never accepted — its create was refused — is sent
    // again whole, as a create.
    if (isOnServer(tx, NOTES, id)) {
      enqueue(tx, NOTES, id, {
        op: 'update',
        fields: {
          ...(body === undefined ? {} : { body }),
          ...(entryDate === undefined ? {} : { entry_date: entryDate }),
          ...(patch.tags === undefined ? {} : { tags: patch.tags }),
        },
      });
    } else {
      const fields = createFields(tx, id);
      if (fields !== null) enqueue(tx, NOTES, id, { op: 'create', fields });
    }
    markRow(tx, NOTES, id, { state: 'pending', errorCode: null });
    return id;
  });
}

/**
 * Deletes a note. One the server never had goes at once; one it has is
 * hidden until the server confirms, so a refused delete can bring it back.
 */
export function deleteNote(db: Database, id: string) {
  db.transaction((tx) => {
    requireHeld(tx, id);
    if (!isOnServer(tx, NOTES, id)) {
      dropQueued(tx, NOTES, id, { unsentOnly: false });
      removeNote(tx, id);
      forgetRowState(tx, NOTES, id);
      return;
    }
    enqueue(tx, NOTES, id, { op: 'delete', fields: {} });
    markRow(tx, NOTES, id, {
      deleted: true,
      state: 'pending',
      errorCode: null,
    });
  });
}

/** Writes the server's copy of a note into the diary. */
export function storeServerNote(db: Executor, wire: WireDiaryNote) {
  const row = {
    diaryId: wire.diary.id,
    habitLogId: wire.check_in?.habit_log_id ?? null,
    entryDate: wire.entry_date,
    body: wire.body,
    listedAt: toTimestamp(wire.listed_at),
    createdAt: toTimestamp(wire.created_at),
    updatedAt: toTimestamp(wire.updated_at),
    checkIn: wire.check_in === null ? null : JSON.stringify(wire.check_in),
  };
  db.insert(diaryNotes)
    .values({ id: wire.id, ...row })
    .onConflictDoUpdate({ target: diaryNotes.id, set: row })
    .run();
  replaceTags(db, wire.id, wire.tags);
}

/** Removes a note from the diary. Its tags go with it, by cascade. */
export function removeNote(db: Executor, id: string) {
  db.delete(diaryNotes).where(eq(diaryNotes.id, id)).run();
}

/**
 * Keeps what this device wrote in a note as a new note of its own, queued
 * to be created: the way out of a conflict that loses nobody's text.
 *
 * `onCheckIn` keeps it on the original's check-in; a note whose check-in is
 * gone is kept as a free note on the same day. Nothing is copied when the
 * server's copy already says the same.
 */
export function forkNote(
  db: Executor,
  id: string,
  { onCheckIn, server }: { onCheckIn: boolean; server: WireDiaryNote | null },
) {
  const row = db.select().from(diaryNotes).where(eq(diaryNotes.id, id)).get();
  if (row === undefined) return;
  const tags = tagsByNote(db, [id]).get(id) ?? [];

  if (
    server !== null &&
    server.body === row.body &&
    sameTags(server.tags, tags)
  ) {
    return;
  }

  const copy = randomUUID();
  const now = nowTimestamp();
  const habitLogId = onCheckIn ? row.habitLogId : null;
  db.insert(diaryNotes)
    .values({
      id: copy,
      entryDate: row.entryDate,
      body: row.body,
      habitLogId,
      checkIn: onCheckIn ? row.checkIn : null,
      listedAt: onCheckIn ? row.listedAt : now,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  replaceTags(db, copy, tags);
  markRow(db, NOTES, copy, {
    serverVersion: null,
    state: 'pending',
    errorCode: null,
  });
  enqueue(db, NOTES, copy, {
    op: 'create',
    fields: {
      entry_date: row.entryDate,
      body: row.body,
      tags,
      written_at: now,
      ...(habitLogId === null ? {} : { habit_log_id: habitLogId }),
    },
  });
}
