import type { QueryKey } from '@tanstack/react-query';
import { asc, desc, eq } from 'drizzle-orm';

import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { Database } from '@/lib/db/client';
import { outbox } from '@/lib/db/schema/sync';

import {
  planResult,
  type ChangeFields,
  type ChangeOp,
  type ResultStatus,
} from './queue';
import {
  dropQueued,
  forgetRowState,
  hasUnsentChange,
  markRow,
  queuedRowIds,
  readState,
  rowState,
  writeState,
  type Executor,
} from './store';

/**
 * Trades the device's synced tables with the server
 * (`aretos-be/docs/sync.md`), whichever tables those are.
 *
 * The server has one way to write — each table's own routes — and one feed,
 * `GET /v1/sync`, that reports every synced table's changes under the
 * table's name. So the device has one engine, this, and one small adapter
 * per table (`SyncAdapter`) that knows the table's routes and its local
 * copy. Syncing another table — goals, habits — is its schema file, its
 * adapter, and adding the adapter where the engine is started.
 *
 * A sync sends the queue first, in order across every table, one change
 * per request; then reads the feed from the last cursor. Sending first
 * means a feed row never lands on a row with a change still waiting — and
 * when it would, the row is skipped: sending that change is what
 * reconciles it.
 *
 * Safe to stop at any point. A change leaves the queue only once its answer
 * is written; a request whose answer was lost is sent again, which the
 * server's rules make harmless — a create under the device's own id returns
 * the row it made. The cursor moves only once a page's changes are written.
 */

/** One queued change, as an adapter sends it. */
export type QueuedChange = {
  seq: number;
  entity: string;
  rowId: string;
  op: ChangeOp;
  fields: ChangeFields;
  /** The version the device's copy is based on; null for one it created. */
  version: number | null;
};

/** What sending one change came to, with the server's copy when it has one. */
export type Outcome<Row> = {
  status: ResultStatus;
  row: Row | null;
  errorCode: string | null;
};

/**
 * One synced table: how to send its changes and keep its local copy. The
 * engine owns everything else — the queue, where each row stands, the
 * cursor, the order things happen in.
 */
export type SyncAdapter<Row extends { id: string } = { id: string }> = {
  /** The table's name in the feed: the server's table name. */
  entity: string;
  /** Sends one change through the table's routes; throws to try again later. */
  send(change: QueuedChange): Promise<Outcome<Row>>;
  /** Writes the server's copy of a row into the local table. */
  store(db: Executor, row: Row): void;
  /** The version an edit to this row is sent against; null when unversioned. */
  version(row: Row): number | null;
  /** Removes a row from the local table. */
  remove(db: Executor, rowId: string): void;
  /** The whole row, as a create sends it, to send again when a create failed. */
  createFields(db: Executor, rowId: string): ChangeFields | null;
  /**
   * Keeps this device's copy of a row as a new one, queued as a create: how a
   * table that holds what people write loses nobody's text. A table without
   * it takes the server's copy on a conflict.
   */
  fork?(
    db: Executor,
    rowId: string,
    options: { server: Row | null; original: 'kept' | 'gone' },
  ): void;
  /** Runs after the feed is read; answering true reads it again from 0. */
  afterFeed?(db: Database): Promise<boolean>;
  /**
   * The screens' reads this table's rows feed, read again after a sync that
   * changed the table.
   */
  readKeys: readonly QueryKey[];
};

/** Lets adapters of different row types share one list. */
export const syncAdapter = <Row extends { id: string }>(
  adapter: SyncAdapter<Row>,
) => adapter as unknown as SyncAdapter;

/** Codes from `internal/api/errors/codes.go` the engine reads refusals by. */
const Code = {
  VersionConflict: 'VERSION_CONFLICT',
  Deleted: 'DELETED',
  IdInUse: 'ID_IN_USE',
  NotFound: 'NOT_FOUND',
} as const;

/**
 * Whether a failed request is worth sending again later, unchanged: the
 * connection failed, the server failed, or the session needs renewing. A
 * request the server read and refused is answered now instead.
 */
const retryLater = (error: unknown) =>
  !(error instanceof ApiError) ||
  error.status === undefined ||
  error.status >= 500 ||
  [401, 408, 429].includes(error.status);

export const applied = <Row>(row: Row | null): Outcome<Row> => ({
  status: 'applied',
  row,
  errorCode: null,
});

/**
 * What a refused change came to, by the server's codes — the same for every
 * table whose routes follow `note_writes.go`'s rules. Rethrows a failure
 * worth retrying. `current` reads the server's copy, for a conflict.
 */
export async function readRefusal<Row>(
  error: unknown,
  op: ChangeOp,
  current: () => Promise<Row | null>,
): Promise<Outcome<Row>> {
  if (retryLater(error)) throw error;
  const { code } = error as ApiError;
  const gone: Outcome<Row> = { status: 'gone', row: null, errorCode: null };

  switch (code) {
    case Code.VersionConflict: {
      const row = await current();
      return row === null ? gone : { status: 'conflict', row, errorCode: null };
    }
    case Code.NotFound:
      // Deleted elsewhere — or what it belonged to was.
      return op === 'delete' ? applied<Row>(null) : gone;
    case Code.Deleted:
    case Code.IdInUse:
      // Either way this id cannot be the row's.
      return gone;
    default:
      return { status: 'rejected', row: null, errorCode: code };
  }
}

/** Keys in `sync_state`. */
const StateKey = {
  /** The last change read from the feed: `since` for the next read. */
  cursor: 'feed_cursor',
  /** The tables the cursor was read for. */
  entities: 'feed_entities',
} as const;

/** Takes the server's copy of a row, and records it as in step. */
export function storeRow(
  db: Executor,
  adapter: SyncAdapter,
  row: { id: string },
) {
  adapter.store(db, row);
  markRow(db, adapter.entity, row.id, {
    serverVersion: adapter.version(row),
    state: 'synced',
    errorCode: null,
    deleted: false,
  });
}

/** Removes a row and everything sync knew about it. */
function forgetRow(db: Executor, adapter: SyncAdapter, rowId: string) {
  adapter.remove(db, rowId);
  forgetRowState(db, adapter.entity, rowId);
  dropQueued(db, adapter.entity, rowId, { unsentOnly: true });
}

/**
 * The change to send next, marked as being sent: one whose request was cut
 * off last time, or else the oldest waiting. A change for a table no
 * adapter handles any more is dropped.
 */
function takeNext(
  db: Database,
  adapters: ReadonlyMap<string, SyncAdapter>,
): { change: QueuedChange; adapter: SyncAdapter } | null {
  return db.transaction((tx) => {
    for (;;) {
      const entry = tx
        .select()
        .from(outbox)
        .orderBy(desc(outbox.sending), asc(outbox.seq))
        .limit(1)
        .get();
      if (entry === undefined) return null;

      const adapter = adapters.get(entry.entity);
      if (adapter === undefined) {
        tx.delete(outbox).where(eq(outbox.seq, entry.seq)).run();
        continue;
      }
      if (!entry.sending) {
        tx.update(outbox)
          .set({ sending: true })
          .where(eq(outbox.seq, entry.seq))
          .run();
      }

      const version =
        rowState(tx, entry.entity, entry.rowId)?.serverVersion ?? null;
      const base = {
        seq: entry.seq,
        entity: entry.entity,
        rowId: entry.rowId,
        version,
      };

      // Its create was refused, so the server has nothing to edit: send the
      // row whole again, as a create.
      if (entry.op === 'update' && version === null) {
        const whole = adapter.createFields(tx, entry.rowId);
        if (whole !== null) {
          return { adapter, change: { ...base, op: 'create', fields: whole } };
        }
      }
      return {
        adapter,
        change: {
          ...base,
          op: entry.op,
          fields: JSON.parse(entry.payload) as ChangeFields,
        },
      };
    }
  });
}

/** Writes what one change came to, and retires it from the queue. */
function settle(
  db: Database,
  adapter: SyncAdapter,
  change: QueuedChange,
  outcome: Outcome<{ id: string }>,
) {
  const { entity, rowId } = change;

  db.transaction((tx) => {
    switch (planResult(change.op, outcome.status)) {
      case 'adopt':
        if (outcome.row === null) {
          forgetRow(tx, adapter, rowId);
        } else if (hasUnsentChange(tx, entity, rowId)) {
          // Written to again while this was out: keep the newer content,
          // based on the version the server just made.
          markRow(tx, entity, rowId, {
            state: 'pending',
            serverVersion: adapter.version(outcome.row),
          });
        } else {
          storeRow(tx, adapter, outcome.row);
        }
        break;
      case 'forget':
        forgetRow(tx, adapter, rowId);
        break;
      case 'restore':
        if (outcome.row !== null) {
          storeRow(tx, adapter, outcome.row);
        } else {
          markRow(tx, entity, rowId, {
            state: 'rejected',
            errorCode: outcome.errorCode,
            deleted: false,
          });
        }
        break;
      case 'fork':
        // The device's latest content, folded writes included, goes into the
        // copy; nothing queued for the original is still worth sending.
        adapter.fork?.(tx, rowId, { server: outcome.row, original: 'kept' });
        dropQueued(tx, entity, rowId, { unsentOnly: false });
        if (outcome.row !== null) storeRow(tx, adapter, outcome.row);
        break;
      case 'forkAndForget':
        adapter.fork?.(tx, rowId, { server: null, original: 'gone' });
        forgetRow(tx, adapter, rowId);
        break;
      case 'reject':
        markRow(tx, entity, rowId, {
          state: hasUnsentChange(tx, entity, rowId) ? 'pending' : 'rejected',
          errorCode: outcome.errorCode,
        });
        break;
    }

    tx.delete(outbox).where(eq(outbox.seq, change.seq)).run();
  });
}

/**
 * A runaway loop's ceiling for one sync. Reaching it loses nothing: the
 * queue and the cursor are saved as they go, so the next sync carries on
 * from there.
 */
const MAX_ROUNDS = 1000;

/**
 * How many times a change may fail without an answer to act on before the
 * device stops trying it and shows it as refused.
 */
const MAX_ATTEMPTS = 5;

/**
 * No connection, or a session to renew: nothing about the change itself, so
 * it is not held against it. Everything waits for the next sync.
 */
const offline = (error: unknown) =>
  error instanceof ApiError &&
  (error.status === undefined || error.status === 401);

/**
 * A change that failed for a reason that is not the connection — the
 * server failing on it, or this device failing to apply its answer. Counted;
 * past `MAX_ATTEMPTS` it is refused like any other, with what failed as its
 * code, so one change cannot hold the queue — and every change behind it —
 * forever. The device's copy is kept, so nothing is lost.
 */
function recordFailure(
  db: Database,
  adapter: SyncAdapter,
  change: QueuedChange,
  error: unknown,
) {
  const entry = db
    .select({ attempts: outbox.attempts })
    .from(outbox)
    .where(eq(outbox.seq, change.seq))
    .get();
  const attempts = (entry?.attempts ?? 0) + 1;

  if (attempts < MAX_ATTEMPTS) {
    db.update(outbox).set({ attempts }).where(eq(outbox.seq, change.seq)).run();
    return;
  }
  const code = error instanceof ApiError ? error.code : 'SYNC_FAILED';
  try {
    settle(db, adapter, change, {
      status: 'rejected',
      row: null,
      errorCode: code,
    });
  } catch {
    // Applying even the refusal fails: take the change off the queue and
    // leave the row as it is, marked.
    db.transaction((tx) => {
      tx.delete(outbox).where(eq(outbox.seq, change.seq)).run();
      markRow(tx, change.entity, change.rowId, {
        state: 'rejected',
        errorCode: code,
        deleted: false,
      });
    });
  }
}

/**
 * Sends the queue in order. Stops at the first change that fails: offline,
 * it throws, so the sync waits for the connection; any other failure is
 * recorded and the sync goes on to read the feed, trying the change again
 * next time.
 */
async function sendQueue(
  db: Database,
  adapters: ReadonlyMap<string, SyncAdapter>,
  changed: Set<string>,
) {
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const next = takeNext(db, adapters);
    if (next === null) break;

    const { adapter, change } = next;
    try {
      settle(db, adapter, change, await adapter.send(change));
    } catch (error) {
      if (offline(error)) throw error;
      recordFailure(db, adapter, change, error);
      return;
    } finally {
      changed.add(adapter.entity);
    }
  }
}

type FeedTable = { updated: { id: string }[]; deleted: string[] };

type Feed = {
  changes: Record<string, FeedTable | undefined>;
  cursor: number;
  has_more: boolean;
};

/**
 * Reads the feed from the stored cursor until it is up to date.
 *
 * How much a page holds is the server's to decide: a row limit and a size
 * budget, so a page of long notes carries fewer of them. The device asks
 * for no page size and reads pages until `has_more` is false, writing each
 * one before asking for the next.
 *
 * The cursor is the feed's, across every table, and the feed sends each
 * change once. So when this build syncs a table the last one did not, the
 * feed is read again from 0: its rows went past the cursor while nothing
 * here kept them.
 */
async function readFeed(
  db: Database,
  adapters: ReadonlyMap<string, SyncAdapter>,
  changed: Set<string>,
) {
  const entities = [...adapters.keys()].sort().join(',');
  if (readState(db, StateKey.entities) !== entities) {
    db.transaction((tx) => {
      writeState(tx, StateKey.cursor, '0');
      writeState(tx, StateKey.entities, entities);
    });
  }

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const since = Number(readState(db, StateKey.cursor) ?? '0');
    const { data } = await api.get<Feed>('/v1/sync', { params: { since } });

    db.transaction((tx) => {
      for (const adapter of adapters.values()) {
        const table = data.changes[adapter.entity];
        if (table === undefined) continue;
        // A row with a change of the device's waiting is left alone: sending
        // that change is what reconciles it. Read once for the page.
        const queued = queuedRowIds(tx, adapter.entity);

        for (const row of table.updated) {
          if (queued.has(row.id)) continue;
          // A row this build cannot store is skipped rather than allowed to
          // fail the page: failing it would keep the cursor where it is, and
          // every sync after would fail on the same row. The row comes again
          // the next time it changes.
          try {
            storeRow(tx, adapter, row);
            changed.add(adapter.entity);
          } catch {
            continue;
          }
        }
        for (const id of table.deleted) {
          if (queued.has(id)) continue;
          forgetRow(tx, adapter, id);
          changed.add(adapter.entity);
        }
      }
      writeState(tx, StateKey.cursor, String(data.cursor));
    });

    if (!data.has_more) break;
  }
}

/**
 * One full sync. Answers which tables changed on the device, so the caller
 * reads again only the screens they feed. Throws when the connection fails;
 * what was done before that stays done.
 */
export async function syncAll(
  db: Database,
  adapters: readonly SyncAdapter[],
): Promise<ReadonlySet<string>> {
  const byEntity = new Map(
    adapters.map((adapter) => [adapter.entity, adapter]),
  );

  const changed = new Set<string>();

  await sendQueue(db, byEntity, changed);
  await readFeed(db, byEntity, changed);

  let again = false;
  for (const adapter of adapters) {
    if (adapter.afterFeed !== undefined && (await adapter.afterFeed(db))) {
      changed.add(adapter.entity);
      again = true;
    }
  }
  if (again) {
    writeState(db, StateKey.cursor, '0');
    await readFeed(db, byEntity, changed);
  }
  return changed;
}

/**
 * Runs syncs one at a time. A sync asked for while one runs makes that one
 * go round once more when it ends, so a row written mid-sync is never left
 * waiting for the next trigger.
 *
 * `stop` ends it for good, when the account's database is about to close:
 * no sync starts after, and one still running reports nothing.
 */
export function createSyncer(
  db: Database,
  adapters: readonly SyncAdapter[],
  {
    onChanged,
    canReach,
  }: {
    onChanged: (changed: readonly SyncAdapter[]) => void;
    canReach: () => boolean;
  },
) {
  let running: Promise<void> | null = null;
  let again = false;
  let stopped = false;

  const run = async () => {
    do {
      again = false;
      if (stopped || !canReach()) return;
      try {
        const changed = await syncAll(db, adapters);
        const touched = adapters.filter((adapter) =>
          changed.has(adapter.entity),
        );
        if (touched.length > 0 && !stopped) onChanged(touched);
      } catch {
        // Offline, or the server failing, for now. The next trigger — a
        // write, the connection coming back, the app returning — tries
        // again from where this stopped.
        return;
      }
    } while (again);
  };

  return {
    stop() {
      stopped = true;
    },
    sync(): Promise<void> {
      if (stopped) return Promise.resolve();
      if (running !== null) {
        again = true;
        return running;
      }
      running = run().finally(() => {
        running = null;
      });
      return running;
    },
  };
}
