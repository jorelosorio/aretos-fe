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
 * and come out as Tamagui's raised input surface — which is why the editor
 * used to sit on a lighter panel than the viewer while their two headers,
 * outside the input, matched. The editor passes values resolved from
 * `useTheme()` instead, so both sit on the screen's own background.
 */

import { SPACING } from '@/constants/layout';

export const NOTE_TEXT = {
  size: '$5',
  lineHeight: 28,
  /** Uniform, so the first line clears the header by what clears the edges. */
  padding: SPACING.screen,
} as const;
