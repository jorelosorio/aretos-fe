import { sql } from 'drizzle-orm';
import {
  check,
  index,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

/**
 * The user's notes, kept on the device so the diary opens, filters and
 * accepts writing with no connection.
 *
 * `diary_notes` and `diary_note_tags` mirror the server's tables in
 * `aretos-be/internal/db/migrations`, with what SQLite and an offline device
 * need changed:
 *
 * - **Types.** UUIDs, dates and timestamps are text. Timestamps are UTC ISO
 *   8601 with microseconds and a `Z` (`features/diary/timestamps.ts`), one
 *   fixed width, so sorting the text sorts by time the way the server's
 *   TIMESTAMPTZ(6) does. UUIDs are lowercase, which sorts as Postgres sorts
 *   them.
 * - **No foreign keys to what is not here.** `habit_log_id` points at a
 *   check-in this device may never have downloaded, and every row is the one
 *   user's whose database this is.
 * - **Tags by name.** The server makes a tag's id the first time its name is
 *   saved; two devices offline would each make up a different one. Names are
 *   what the server sends and what it matches on, ignoring case.
 * - **The check-in as the server scored it.** A check-in's note shows its
 *   goal, mood and score, which only the server computes
 *   (`docs/progress.md`). `check_in` keeps its last answer, as JSON, and is
 *   never recomputed here.
 *
 * Where each note stands with the server is sync's own business, in
 * `schema/sync.ts`. Change a schema file, then `npm run db:generate`.
 */

export const diaryNotes = sqliteTable(
  'diary_notes',
  {
    /** Made up on the device for a note written here, so it never changes. */
    id: text('id').primaryKey(),
    diaryId: text('diary_id'),
    habitLogId: text('habit_log_id'),
    /** `YYYY-MM-DD`. */
    entryDate: text('entry_date').notNull(),
    body: text('body').notNull(),
    /** The diary's order: `listed_at`, `created_at`, `id`, newest first. */
    listedAt: text('listed_at').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    /** The server's `DiaryCheckIn` JSON, as last pulled; null for a free note. */
    checkIn: text('check_in'),
  },
  (table) => [
    index('diary_notes_listed_idx').on(
      table.listedAt,
      table.createdAt,
      table.id,
    ),
    index('diary_notes_entry_date_idx').on(table.entryDate),
    // The server's diary_notes_body_check, and its VARCHAR(2000): SQLite's
    // length() counts characters, as Postgres does.
    check(
      'diary_notes_body_check',
      sql`trim(${table.body}) <> '' AND length(${table.body}) <= 2000`,
    ),
  ],
);

export const diaryNoteTags = sqliteTable(
  'diary_note_tags',
  {
    diaryNoteId: text('diary_note_id')
      .notNull()
      .references(() => diaryNotes.id, { onDelete: 'cascade' }),
    /** The spelling the server keeps; matched ignoring case. */
    name: text('name').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.diaryNoteId, table.name] }),
    index('diary_note_tags_name_idx').on(sql`lower(${table.name})`),
  ],
);
