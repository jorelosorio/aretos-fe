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
  /**
   * Padding inside a card that repeats down a dense list.
   *
   * On the home screen every goal gets a card, so how many fit on a phone is
   * the whole point of the screen — and past a handful of goals the padding
   * costs more rows than the content does. Reach for this only where that is
   * true; a card the user reads one of still wants `card`.
   */
  cardTight: '$3',
} as const;

/**
 * The floating tab bar's two metrics, in points.
 *
 * Plain numbers rather than `size` tokens because `height` is also the pill's
 * corner radius — one number, or the ends stop being semicircles — and
 * because `useTabBarInset` has to add them to a safe-area inset.
 *
 * The bar floats over the scene instead of taking layout space, which is what
 * lets content pass behind it and read as floating. Scrolling screens pay for
 * that with `useTabBarInset` as bottom padding.
 */
export const TAB_BAR = {
  height: 62,
  /** How far the pill sits above the bottom safe area. */
  gap: 16,
  /**
   * The tab glyphs, which sit a step above `ICON.feature`.
   *
   * Their own number rather than a role from `ICON` because the bar is the
   * one place where the icon *is* the control — there is no label beside it
   * and nothing else in the pill to read — and because the tabs take their
   * width from it, so it is what sets the spacing across the whole bar.
   */
  icon: 32,
} as const;

/**
 * Icon sizes, in points.
 *
 * These are not Tamagui `size` tokens, and deliberately so: that scale runs
 * 8, 20, 24, 28 — spaced for controls, not for glyphs — so every icon in the
 * app would have to round to 20 or to 8. Anything that *is* a box (a dot, a
 * tile, an avatar) should still take a `size` token; only the glyph drawn
 * inside one comes from here.
 *
 * Named by the role the icon plays, so a screen picks a job rather than a
 * number, and the three can move together.
 */
export const ICON = {
  /** Sits on a line of body text, like the flame beside a streak. */
  inline: 13,
  /** The icon of a row or a header action, read at arm's length. */
  row: 18,
  /** The subject of a tile or an empty state, not an annotation of one. */
  feature: 24,
} as const;
