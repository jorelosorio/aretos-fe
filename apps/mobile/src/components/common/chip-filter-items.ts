/**
 * Which of a filter row's chips are on screen.
 *
 * Collapsed, the row shows the first `limit` in the order it was given and
 * counts the rest behind a "+N" chip, so twenty tags or goals are not a wall
 * to read before the content under them. The one exception is the active
 * item: what you are filtering by never hides behind "+N", or the row would
 * no longer show what the content below it is showing. It is added after the
 * first `limit` rather than moved to the front, so choosing a chip does not
 * reshuffle the row under your finger.
 *
 * Keys are compared exactly; a caller whose keys match loosely (tags, which
 * the server treats case-insensitively) normalises them before passing them.
 */
export function visibleItems(
  keys: readonly string[],
  active: string | null,
  expanded: boolean,
  limit: number,
): { shown: string[]; hidden: number } {
  if (expanded || keys.length <= limit) {
    return { shown: [...keys], hidden: 0 };
  }

  const shown = keys.slice(0, limit);
  if (active !== null && keys.includes(active) && !shown.includes(active)) {
    shown.push(active);
  }

  return { shown, hidden: keys.length - shown.length };
}
