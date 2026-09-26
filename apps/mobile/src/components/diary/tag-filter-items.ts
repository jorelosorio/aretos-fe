/**
 * Which of the diary's filter tags are on screen.
 *
 * Collapsed, the row shows the first `limit` in the server's order and counts
 * the rest behind a "+N" chip, so a person with twenty tags is not handed a
 * wall of them to read before their notes. The one exception is the active
 * filter: a tag you are filtering by never hides behind "+N", or the row
 * would no longer show what the list below it is showing. It is added after
 * the first `limit` rather than moved to the front, so choosing a tag does
 * not reshuffle the chips under your finger.
 */
export function visibleTags(
  names: readonly string[],
  active: string | null,
  expanded: boolean,
  limit: number,
): { shown: string[]; hidden: number } {
  if (expanded || names.length <= limit) {
    return { shown: [...names], hidden: 0 };
  }

  const shown = names.slice(0, limit);
  const current =
    active === null
      ? undefined
      : names.find((name) => name.toLowerCase() === active.toLowerCase());

  if (current !== undefined && !shown.includes(current)) shown.push(current);

  return { shown, hidden: names.length - shown.length };
}
