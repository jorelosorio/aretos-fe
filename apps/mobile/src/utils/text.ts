/**
 * A label that stands on its own starts with a capital: a date on its own
 * line, a tag on a chip, a month on a chart axis. Spanish writes weekdays and
 * months in lower case, and people type tags however they like — both right
 * where they come from, and both read as headings once they sit alone.
 *
 * Only the first character moves. A label that starts with a number is
 * already fine, and the rest stays as written: the month inside
 * "Jue, 24 sept." keeps Spanish's case, and a tag keeps its spelling.
 *
 * Display only. A date placed inside a sentence keeps the case `Intl` gives
 * it, and a tag is never saved capitalised — the server stores what was typed.
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
