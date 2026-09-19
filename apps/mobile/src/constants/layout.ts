/**
 * The spacing scale the app's screens are built on.
 *
 * Tamagui's `$1…$6` tokens are the units; these names are the decisions about
 * which unit belongs where. Reaching for a raw token in a screen is what let
 * three different section gaps ($4, $5 and $6) and an off-scale `$3.5` into
 * the same app, so a value used for layout should come from here.
 *
 * Two names sharing a value is fine and expected — they can move apart later
 * without hunting through the screens that used the number.
 */
export const SPACING = {
  /** Padding around a screen's own content. */
  screen: '$4',
  /** Between the top-level sections of a screen. */
  section: '$5',
  /** Between a section's title and the card beneath it. */
  group: '$2',
  /** Between siblings: cards in a list, controls in a stack, a row's parts. */
  items: '$3',
  /** Between the lines of one block of text. */
  text: '$1',
  /** Padding inside a card. */
  card: '$4',
} as const;
