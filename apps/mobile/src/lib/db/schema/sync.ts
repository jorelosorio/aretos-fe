import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

/**
 * The tables sync keeps for itself, the same for every synced table.
 *
 * The server's feed (`aretos-be/docs/sync.md`) names each table by its own
 * name — `diary_notes`, and later `goals` and `habits` — and every row by
 * its id. These tables use the same two, `entity` and `row_id`, so one
 * queue, one record of where each row stands and one cursor serve every
 * table the device keeps. The domain tables (`schema/diary.ts`, …) stay the
 * server's columns, with nothing of sync's mixed in.
 */

/**
 * Where each synced row stands with the server. One per row the device
 * holds or has written.
 *
 * - `serverVersion` is the version this device's copy is based on — what an
 *   edit is sent against. Null for a row the server has never seen, and for
 *   a table that has no versions.
 * - `state` is `synced`, `pending` (a change is waiting to go) or
 *   `rejected` (the server refused the last change; `errorCode` is its
 *   code).
 * - `deleted` hides a row deleted here until the server confirms, so a
 *   refused delete can bring it back rather than lose it.
 */
export const syncRows = sqliteTable(
  'sync_rows',
  {
    entity: text('entity').notNull(),
    rowId: text('row_id').notNull(),
    serverVersion: integer('server_version'),
    state: text('state', { enum: ['synced', 'pending', 'rejected'] }).notNull(),
    errorCode: text('error_code'),
    deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.entity, table.rowId] })],
);

/**
 * Changes waiting to be sent, oldest first across every table — a habit
 * created offline under a goal created offline has to reach the server
 * after its goal. Each is one request to the table's own routes.
 *
 * At most one unsent change per row: a second write before the first is sent
 * folds into it (`lib/sync/queue.ts`). The change being sent (`sending`) is
 * left alone, so a write made while its request is out becomes a change of
 * its own instead of vanishing with the sent one.
 */
export const outbox = sqliteTable(
  'outbox',
  {
    seq: integer('seq').primaryKey({ autoIncrement: true }),
    entity: text('entity').notNull(),
    rowId: text('row_id').notNull(),
    op: text('op', { enum: ['create', 'update', 'delete'] }).notNull(),
    /** The change's fields, as JSON, in the table's routes' own names. */
    payload: text('payload').notNull(),
    sending: integer('sending', { mode: 'boolean' }).notNull().default(false),
    /** Tries that failed without an answer to act on — see `lib/sync/engine.ts`. */
    attempts: integer('attempts').notNull().default(0),
  },
  (table) => [index('outbox_row_idx').on(table.entity, table.rowId)],
);

/**
 * Small facts about sync itself: the feed's cursor, which tables it was read
 * for, and whatever a table's adapter keeps (the diary's plan floor).
 */
export const syncState = sqliteTable('sync_state', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
