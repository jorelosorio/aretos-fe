/**
 * Runs `task` unless one is already running under the same lock, in which
 * case the call is dropped and resolves `undefined`.
 *
 * A mutation's `isPending` is not enough to stop a second tap. It reaches
 * the screen a render later — TanStack Query notifies on the next macrotask —
 * and it covers one request, while a save can be several in a row. A ref
 * flips synchronously, inside the press that set it, and holds for as long
 * as the whole task does.
 */
export async function runExclusive<T>(
  lock: { current: boolean },
  task: () => Promise<T>,
): Promise<T | undefined> {
  if (lock.current) return undefined;

  lock.current = true;
  try {
    return await task();
  } finally {
    lock.current = false;
  }
}
