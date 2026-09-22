/**
 * A note flattened to one run of prose, for the card that previews it.
 *
 * A note is written with paragraphs in it, and `numberOfLines` counts those
 * blank lines against the budget: a note whose first paragraph fills the
 * preview spends the last line on the gap after it, and the ellipsis lands on
 * a line of its own with no word in front of it. That is the "dots on their
 * own line" the cards showed.
 *
 * Collapsing every run of whitespace to a single space spends all four lines
 * on words, so the truncation reads as `…` hanging off the last one — which is
 * what a preview is for. The whole note, paragraphs intact, is what the
 * viewer opens; this is only the shape it takes on the way past.
 */
export function notePreview(note: string): string {
  return note.replace(/\s+/g, ' ').trim();
}
