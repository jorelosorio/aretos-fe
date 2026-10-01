import { createContext, useContext } from 'react';

import type { Database } from './client';

/**
 * The signed-in account's database, as the screens reach it.
 *
 * Defined here, in `lib/`, so a feature can read it; filled by
 * `providers/database-provider.tsx`, which is what opens the file, migrates
 * it and starts syncing.
 *
 * - `closed`: nobody is signed in.
 * - `opening`: the file is open and its migrations are running.
 * - `failed`: a migration failed. Nothing reads a database in an unknown
 *   shape; the error is what a screen reports.
 * - `ready`: `requestSync` asks for a sync, and returns once it has run.
 */
export type LocalDatabase =
  | { status: 'closed' }
  | { status: 'opening' }
  | { status: 'failed'; error: Error }
  | { status: 'ready'; db: Database; requestSync: () => Promise<void> };

export const LocalDatabaseContext = createContext<LocalDatabase>({
  status: 'closed',
});

export function useLocalDatabase(): LocalDatabase {
  return useContext(LocalDatabaseContext);
}

/**
 * Whether a read of the database can run yet: once it is ready, or once it
 * has failed, so the failure becomes the read's error instead of a read that
 * waits forever. For a query's `enabled`.
 */
export const canRead = (local: LocalDatabase) =>
  local.status === 'ready' || local.status === 'failed';

/** The database, for a query or mutation function that runs once `canRead`. */
export function databaseOf(local: LocalDatabase): Database {
  if (local.status === 'ready') return local.db;
  if (local.status === 'failed') throw local.error;
  throw new Error('The local database is not open yet.');
}
