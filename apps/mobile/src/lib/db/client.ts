import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import {
  deleteDatabaseAsync,
  openDatabaseSync,
  type SQLiteDatabase,
} from 'expo-sqlite';

import * as diary from './schema/diary';
import * as sync from './schema/sync';

/** Every table, one file per domain; a new synced table adds its file here. */
const schema = { ...sync, ...diary };

/**
 * The device's database, one file per account.
 *
 * Per account rather than one shared file with a user column: signing out
 * deletes the whole file, so nothing one person wrote is left on a phone the
 * next person signs into, and no query can forget to filter by user.
 */

export type Database = ExpoSQLiteDatabase<typeof schema>;

export type OpenDatabase = {
  userId: string;
  sqlite: SQLiteDatabase;
  db: Database;
};

const fileName = (userId: string) => `aretos-${userId}.db`;

const open = new Map<string, OpenDatabase>();

/**
 * The account's database, opened once and shared.
 *
 * Foreign keys are off by default in SQLite, and the tag rows cascade with
 * their note only when they are on. WAL lets the diary read while a sync
 * writes.
 */
export function openUserDatabase(userId: string): OpenDatabase {
  const existing = open.get(userId);
  if (existing !== undefined) return existing;

  const sqlite = openDatabaseSync(fileName(userId), {
    enableChangeListener: true,
  });
  sqlite.execSync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

  const handle = { userId, sqlite, db: drizzle(sqlite, { schema }) };
  open.set(userId, handle);
  return handle;
}

/**
 * Closes and deletes the account's database: on sign-out and on deleting the
 * account. Whatever was not synced is lost, which is why sign-out asks first
 * when anything is pending.
 */
export async function deleteUserDatabase(userId: string): Promise<void> {
  const handle = open.get(userId);
  open.delete(userId);
  if (handle !== undefined) {
    try {
      await handle.sqlite.closeAsync();
    } catch {
      // Already closed.
    }
  }
  try {
    await deleteDatabaseAsync(fileName(userId));
  } catch {
    // Never created on this device.
  }
}
