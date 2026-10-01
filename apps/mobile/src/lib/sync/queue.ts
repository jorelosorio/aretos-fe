/**
 * The rules for the queue of changes waiting to be sent, the same for every
 * synced table.
 *
 * A row has at most one unsent change. Writing to it again before that one
 * goes folds the new change in, so a note edited five times offline is sent
 * once, as it ended up — and a row written and deleted offline is never sent
 * at all. A change whose request is already out is not folded into; a write
 * made meanwhile waits as a change of its own.
 */

/** What a change carries, in the table's routes' own names. */
export type ChangeFields = Record<string, unknown>;

export type ChangeOp = 'create' | 'update' | 'delete';

export type Change = { op: ChangeOp; fields: ChangeFields };

/**
 * The unsent change after `next` is written, or `null` when the two cancel
 * out — a row created and deleted before anything was sent.
 */
export function foldChange(
  pending: Change | null,
  next: Change,
): Change | null {
  if (pending === null) return next;

  switch (pending.op) {
    case 'create':
      if (next.op === 'delete') return null;
      return { op: 'create', fields: { ...pending.fields, ...next.fields } };
    case 'update':
      if (next.op === 'delete') return { op: 'delete', fields: {} };
      return { op: 'update', fields: { ...pending.fields, ...next.fields } };
    case 'delete':
      // A deleted row is not on screen to be written to again.
      return pending;
  }
}

/**
 * What a change's request came to, as a table's adapter reads it off the
 * route's answer: the row back is `applied`, `409 VERSION_CONFLICT` a
 * `conflict`, a row deleted elsewhere `gone`, and any other refusal
 * `rejected`.
 */
export type ResultStatus = 'applied' | 'conflict' | 'gone' | 'rejected';

/**
 * What the device does with one change's result.
 *
 * - `adopt`: take the server's copy.
 * - `forget`: the row no longer exists; remove it.
 * - `restore`: a delete did not happen; bring the row back — the server's
 *   copy when there is one.
 * - `fork`: the server's copy moved on while this device edited an older
 *   one. Keep what was written here as a new row, then take the server's.
 * - `forkAndForget`: the row was deleted elsewhere while this device edited
 *   it. Keep what was written here as a new row.
 * - `reject`: the server refused; keep the row and say why.
 *
 * Nothing anyone typed is dropped: every path that would lose this device's
 * text forks it instead — for a table whose adapter can fork. One that
 * cannot takes the server's copy.
 */
export type ResultPlan =
  'adopt' | 'forget' | 'restore' | 'fork' | 'forkAndForget' | 'reject';

export function planResult(op: ChangeOp, status: ResultStatus): ResultPlan {
  switch (status) {
    case 'applied':
      return op === 'delete' ? 'forget' : 'adopt';
    case 'conflict':
      return op === 'delete' ? 'restore' : 'fork';
    case 'gone':
      return op === 'delete' ? 'forget' : 'forkAndForget';
    case 'rejected':
      return op === 'delete' ? 'restore' : 'reject';
  }
}
