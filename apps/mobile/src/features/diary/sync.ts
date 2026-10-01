import type { Database } from '@/lib/db/client';
import {
  applied,
  readRefusal,
  storeRow,
  syncAdapter,
  type Outcome,
  type QueuedChange,
} from '@/lib/sync/engine';
import { readState, writeState } from '@/lib/sync/store';

import {
  addCheckInNote,
  getWireNote,
  listNotes,
  noteReadKeys,
  sendNewNote,
  sendNoteDelete,
  sendNoteEdit,
} from './api';
import {
  NOTES,
  StateKey,
  createFields,
  forkNote,
  removeNote,
  storeServerNote,
} from './local';
import type { WireDiaryNote } from './types';

/**
 * The diary's adapter to the sync engine (`lib/sync/engine.ts`): how a
 * queued note change reaches the server, and how the server's notes land in
 * the device's diary. The engine does the rest — the queue's order, where
 * each note stands, the feed and its cursor. Every request is `api.ts`'s;
 * every local write is `local.ts`'s.
 *
 * Notes are written through the routes every client uses
 * (`aretos-be/docs/sync.md`), each request carrying what makes it safe
 * offline: the device's own `id` and `written_at` on a create, the
 * `version` it edited on an edit or delete. A note is what someone wrote,
 * so a conflict never takes the server's copy over theirs: `fork` keeps
 * both.
 */

async function send(change: QueuedChange): Promise<Outcome<WireDiaryNote>> {
  const { rowId: id, fields, version } = change;

  try {
    switch (change.op) {
      case 'create': {
        const { habit_log_id: logId, ...rest } = fields;
        if (typeof logId !== 'string') {
          return applied(await sendNewNote(id, rest));
        }
        // A check-in's note is written through the check-in, which answers
        // with less than the diary shows: read it back as the diary does.
        await addCheckInNote(
          logId,
          {
            body: String(rest.body ?? ''),
            tags: (rest.tags as string[]) ?? [],
          },
          { id, written_at: rest.written_at as string | undefined },
        );
        return applied(await getWireNote(id));
      }
      case 'update':
        return applied(await sendNoteEdit(id, fields, version));
      case 'delete':
        await sendNoteDelete(id, version);
        return applied<WireDiaryNote>(null);
    }
  } catch (error) {
    return readRefusal(error, change.op, () => getWireNote(id));
  }
}

/** How often the plan's floor is read again: it moves once a day at most. */
const FLOOR_EVERY_MS = 60 * 60 * 1000;

/**
 * Where the plan's history begins, and whether anything sits behind it —
 * what the diary list reports, read off a one-note page of it, at most once
 * an hour.
 *
 * The feed skips a note behind the plan's floor. When the floor moves back
 * — an upgrade, or a plan with none — notes the feed once skipped are now
 * in reach, so the engine reads the feed again from 0. The floor moving
 * forward, as a bounded plan's does every day, only hides notes and sends
 * nothing.
 */
async function readPlanFloor(db: Database): Promise<boolean> {
  const checkedAt = Number(readState(db, StateKey.floorCheckedAt) ?? '0');
  if (Date.now() - checkedAt < FLOOR_EVERY_MS) return false;

  const page = await listNotes({ limit: 1 });
  const floor = page.historyCutoff ?? '';
  const before = readState(db, StateKey.historyCutoff);

  db.transaction((tx) => {
    writeState(tx, StateKey.historyCutoff, floor);
    writeState(tx, StateKey.hasMoreHistory, page.hasMoreHistory ? '1' : '0');
    writeState(tx, StateKey.floorCheckedAt, String(Date.now()));
  });

  return (
    before !== undefined && before !== '' && (floor === '' || floor < before)
  );
}

export const diaryNotesSync = syncAdapter<WireDiaryNote>({
  entity: NOTES,
  send,
  store: storeServerNote,
  version: (note) => note.version,
  remove: removeNote,
  createFields,
  fork: (db, id, { server, original }) =>
    forkNote(db, id, { onCheckIn: original === 'kept', server }),
  afterFeed: readPlanFloor,
  readKeys: noteReadKeys,
});

/**
 * Keeps a note read from the server — one the feed has not brought yet —
 * as the device's own, so it can be edited and deleted like any other.
 */
export function keepNote(db: Database, note: WireDiaryNote) {
  db.transaction((tx) => storeRow(tx, diaryNotesSync, note));
}
