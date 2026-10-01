import { and, eq, sql } from 'drizzle-orm';

import type { Database } from '@/lib/db/client';
import { outbox, syncRows, syncState } from '@/lib/db/schema/sync';

import { foldChange, type Change, type ChangeFields } from './queue';

/**
 * Sync's bookkeeping on the device, the same for every synced table: the
 * queue of changes to send, where each row stands with the server, and the
 * small facts sync keeps about itself. A table is named by `entity`, the
 * name the server's feed gives it — its own table name.
 *
 * Everything takes an `Executor`, so it runs inside the caller's
 * transaction: a row and the change that will carry it are written
 * together, or not at all.
 */

/** The database or a transaction on it. */
export type Executor = Pick<
  Database,
  'select' | 'insert' | 'update' | 'delete'
>;

export type RowState = typeof syncRows.$inferSelect;

export function readState(db: Executor, key: string): string | undefined {
  return db.select().from(syncState).where(eq(syncState.key, key)).get()?.value;
}

export function writeState(db: Executor, key: string, value: string) {
  db.insert(syncState)
    .values({ key, value })
    .onConflictDoUpdate({ target: syncState.key, set: { value } })
    .run();
}

const isRow = (entity: string, rowId: string) =>
  and(eq(syncRows.entity, entity), eq(syncRows.rowId, rowId));

const isQueued = (entity: string, rowId: string) =>
  and(eq(outbox.entity, entity), eq(outbox.rowId, rowId));

export function rowState(
  db: Executor,
  entity: string,
  rowId: string,
): RowState | undefined {
  return db.select().from(syncRows).where(isRow(entity, rowId)).get();
}

/** Records where a row stands, creating its record if it has none. */
export function markRow(
  db: Executor,
  entity: string,
  rowId: string,
  values: Partial<Omit<RowState, 'entity' | 'rowId'>>,
) {
  db.insert(syncRows)
    .values({ entity, rowId, state: 'pending', ...values })
    .onConflictDoUpdate({
      target: [syncRows.entity, syncRows.rowId],
      set: values,
    })
    .run();
}

export function forgetRowState(db: Executor, entity: string, rowId: string) {
  db.delete(syncRows).where(isRow(entity, rowId)).run();
}

/**
 * The rows of a table with a change waiting or being sent, in one read — so
 * a page of the feed asks once, not once per row.
 */
export function queuedRowIds(db: Executor, entity: string): Set<string> {
  return new Set(
    db
      .select({ rowId: outbox.rowId })
      .from(outbox)
      .where(eq(outbox.entity, entity))
      .all()
      .map(({ rowId }) => rowId),
  );
}

/** Whether a change for the row is waiting and not being sent yet. */
export function hasUnsentChange(db: Executor, entity: string, rowId: string) {
  return (
    db
      .select({ seq: outbox.seq })
      .from(outbox)
      .where(and(isQueued(entity, rowId), eq(outbox.sending, false)))
      .get() !== undefined
  );
}

/** Whether the server has the row, or is being sent its create. */
export function isOnServer(db: Executor, entity: string, rowId: string) {
  if ((rowState(db, entity, rowId)?.serverVersion ?? null) !== null) {
    return true;
  }
  return (
    db
      .select({ seq: outbox.seq })
      .from(outbox)
      .where(and(isQueued(entity, rowId), eq(outbox.sending, true)))
      .get() !== undefined
  );
}

/** Queues a change, folding it into the row's unsent one if there is one. */
export function enqueue(
  db: Executor,
  entity: string,
  rowId: string,
  change: Change,
) {
  const pending = db
    .select()
    .from(outbox)
    .where(and(isQueued(entity, rowId), eq(outbox.sending, false)))
    .get();

  const folded = foldChange(
    pending === undefined
      ? null
      : { op: pending.op, fields: JSON.parse(pending.payload) as ChangeFields },
    change,
  );

  if (pending === undefined) {
    if (folded !== null) {
      db.insert(outbox)
        .values({
          entity,
          rowId,
          op: folded.op,
          payload: JSON.stringify(folded.fields),
        })
        .run();
    }
  } else if (folded === null) {
    db.delete(outbox).where(eq(outbox.seq, pending.seq)).run();
  } else {
    db.update(outbox)
      .set({ op: folded.op, payload: JSON.stringify(folded.fields) })
      .where(eq(outbox.seq, pending.seq))
      .run();
  }
}

/** Drops the row's queued changes: all of them, or only the unsent one. */
export function dropQueued(
  db: Executor,
  entity: string,
  rowId: string,
  { unsentOnly }: { unsentOnly: boolean },
) {
  db.delete(outbox)
    .where(
      unsentOnly
        ? and(isQueued(entity, rowId), eq(outbox.sending, false))
        : isQueued(entity, rowId),
    )
    .run();
}

/**
 * How many rows hold something the server does not: a change waiting to go,
 * or one the server refused — for one table or all. What would be lost if
 * the device's copy were deleted now.
 */
export function countUnsynced(db: Executor, entity?: string): number {
  const unsynced = sql`${syncRows.state} <> 'synced'`;
  return (
    db
      .select({ count: sql<number>`count(*)` })
      .from(syncRows)
      .where(
        entity === undefined
          ? unsynced
          : and(eq(syncRows.entity, entity), unsynced),
      )
      .get()?.count ?? 0
  );
}
