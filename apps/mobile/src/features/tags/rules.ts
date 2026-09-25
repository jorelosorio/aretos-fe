/**
 * The server's tag rules, mirrored so the input can refuse what the server
 * would, before a save round-trips into a 400.
 *
 * `normalizeTags` in `tag_service.go` is the authority: it trims, drops an
 * empty name, drops repeats ignoring case (first spelling wins), and caps
 * the length and the count. Nothing here decides anything the server does
 * not — it only stops the input offering what the server refuses.
 */

/** `tags.name` is `VARCHAR(50)`, counted by the server in runes. */
export const TAG_MAX_LENGTH = 50;

/** `maxTagsPerItem`: one goal or note carries at most this many. */
export const TAGS_MAX = 20;

/**
 * Spread rather than `.length`: `.length` counts UTF-16 units, so an emoji
 * reads as two and a name the server accepts would be refused here.
 */
const runeLength = (name: string) => [...name].length;

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** The list with `raw` added, or an unchanged copy when the server would refuse it. */
export function addTag(tags: readonly string[], raw: string): string[] {
  const name = raw.trim();

  if (name === '' || runeLength(name) > TAG_MAX_LENGTH) return [...tags];
  if (tags.length >= TAGS_MAX) return [...tags];
  if (tags.some((tag) => sameName(tag, name))) return [...tags];

  return [...tags, name];
}

export function removeTag(tags: readonly string[], name: string): string[] {
  return tags.filter((tag) => tag !== name);
}

/**
 * Whether two lists name the same tags, which is what decides whether an
 * edit has to send them: the server replaces the list whole, so sending an
 * unchanged one is a write nobody made.
 */
export function sameTags(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;

  const left = a.map((tag) => tag.toLowerCase()).sort();
  const right = b.map((tag) => tag.toLowerCase()).sort();

  return left.every((tag, index) => tag === right[index]);
}
