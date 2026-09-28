/**
 * The type a note is set in, whether it is being written or read back.
 *
 * The check-in's editor and the diary's viewer are the same page in two
 * modes, and they sit one tap apart: a note that reflows the moment it is
 * saved reads as a bug even when both frames are defensible on their own.
 * Sharing the size, the leading and the padding is what keeps the text
 * landing on the same pixels in both — the caret is meant to be the only
 * difference.
 *
 * The size is a step above `TEXT.body`, and this is the one surface in the
 * app allowed to be. Everywhere else prose shares a screen with something —
 * a card's title, a list, a form — and body size is what keeps it in its
 * place. Here the note *is* the screen, read for a paragraph at a time, and
 * `TEXT.body` set that reading at the size of a caption on a list item.
 *
 * The diary card's preview stays at `TEXT.body`, because there it is one
 * item among many and bigger type was what made the list shout.
 *
 * `lineHeight` is named here rather than left to the font config because
 * that scale is tuned for UI labels. A button wants its lines tight; several
 * paragraphs of someone's own writing want air.
 *
 * The colours are not here, and cannot be: they have to be read off the live
 * theme. `createV5Theme` generates an `Input` component theme, so `$background`
 * and `$color` written *inside* a `TextArea` resolve against that sub-theme
 * and come out as Tamagui's raised input surface, a lighter panel than the
 * viewer's. The editor passes values resolved from `useTheme()` instead, so
 * both sit on the screen's own background.
 */

import { SPACING } from '@/constants/layout';
import { usePreferences, type NoteTextSize } from '@/lib/preferences';

export const NOTE_TEXT = {
  size: '$5',
  lineHeight: 28,
  /** Uniform, so the first line clears the header by what clears the edges. */
  padding: SPACING.screen,
} as const;

/**
 * The three sizes a person can read a note at, smallest first. Only the
 * reader offers them; the editor stays at `NOTE_TEXT`.
 *
 * `medium` is `NOTE_TEXT` itself, the size the page was designed at. The
 * step down is one font step; the step up is two, because the larger size is
 * the one someone reaches for to read more comfortably, and a single step up
 * barely shows.
 */
export const NOTE_TEXT_SIZES: Record<
  NoteTextSize,
  { size: '$4' | '$5' | '$7'; lineHeight: number }
> = {
  small: { size: '$4', lineHeight: 24 },
  medium: { size: NOTE_TEXT.size, lineHeight: NOTE_TEXT.lineHeight },
  large: { size: '$7', lineHeight: 34 },
};

export const NOTE_TEXT_STEPS: readonly NoteTextSize[] = [
  'small',
  'medium',
  'large',
];

/** The note type at the size the person picked. */
export function useNoteText() {
  return NOTE_TEXT_SIZES[usePreferences().noteTextSize];
}
