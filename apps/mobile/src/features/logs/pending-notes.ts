/**
 * Notes written on a period that has no check-in yet.
 *
 * A note needs a saved check-in to hang from, and saving one is not free:
 * under the `logged` streak rule any saved period counts, an empty one
 * included (`aretos-be/docs/progress.md`). So writing a note must never save
 * the check-in on its own. The note waits in the draft, and the check-in's
 * own Save posts it once the log exists.
 */

export type NoteBody = { body: string; tags: string[] };

export type PendingNote = NoteBody & {
  /** Local only, for React keys and for editing it before it is posted. */
  key: string;
  /** Its last post was refused or never arrived. */
  failed: boolean;
  /**
   * Why, when it failed — kept so the screen can say it. A plan's note limit
   * is not something a retry fixes, and "try again" alone would say it is.
   */
  error: unknown;
};

/** What a round of posting did, by key, so it can be applied to the list as it now stands. */
export type PostResult = {
  posted: string[];
  failed: { key: string; error: unknown } | null;
};

/**
 * Posts pending notes onto a saved log, one at a time and in the order they
 * were written.
 *
 * Stops at the first failure rather than skipping past it: each note's
 * `created_at` is the server's clock at its POST, and a later note landing
 * before a retried earlier one would reverse the order they were written in.
 */
export async function postPendingNotes(
  logId: string,
  pending: readonly PendingNote[],
  post: (logId: string, note: NoteBody) => Promise<unknown>,
): Promise<PostResult> {
  const posted: string[] = [];

  for (const note of pending) {
    try {
      await post(logId, { body: note.body, tags: note.tags });
    } catch (error) {
      return { posted, failed: { key: note.key, error } };
    }
    posted.push(note.key);
  }

  return { posted, failed: null };
}

/**
 * The list after a round of posting, applied to the list as it stands now
 * rather than to the one the round started from.
 *
 * Posting takes a request per note, and the screen stays usable meanwhile:
 * a note written, edited or removed during that time is the person's latest
 * word and has to survive the round finishing. Only what the round itself
 * decided — which keys went up, and which one failed — is applied.
 */
export function applyPostResult(
  current: readonly PendingNote[],
  result: PostResult,
): PendingNote[] {
  const posted = new Set(result.posted);

  return current
    .filter((note) => !posted.has(note.key))
    .map((note) =>
      result.failed?.key === note.key
        ? { ...note, failed: true, error: result.failed.error }
        : note,
    );
}

/**
 * The check-in's Save: the period first, then its waiting notes onto the log
 * that save returned. A save that fails throws before anything is posted, so
 * the notes are still the caller's, untouched.
 */
export async function saveThenPost<L extends { id: string }>(
  save: () => Promise<L>,
  pending: readonly PendingNote[],
  post: (logId: string, note: NoteBody) => Promise<unknown>,
): Promise<PostResult> {
  const log = await save();
  return postPendingNotes(log.id, pending, post);
}
