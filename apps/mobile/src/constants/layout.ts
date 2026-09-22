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
 * The two sizes running text comes in, named by the job it does.
 *
 * Same argument as `SPACING`: the font scale is the unit, these are the
 * decision about which unit belongs where. Picking a token per screen is how
 * the app ended up reading a note at `$5` on one surface, `$3` on another and
 * a sign-in tagline at `$4` — three sizes for the same job, none of them
 * wrong on its own.
 *
 * Only two, on purpose. A third tier is how the drift starts again, and
 * anything that needs to stand out more than `body` is a heading and should
 * say so with `SectionTitle` or a `$heading` face rather than a bigger body.
 *
 * One surface is exempt, and only one: the full-screen note in `NOTE_TEXT`,
 * which is read a paragraph at a time with nothing beside it. That exemption
 * is argued where it is taken, not granted here — a screen that wants larger
 * prose has to make the same case.
 */
export const TEXT = {
  /** Running prose: whatever is read as sentences, however short. */
  body: '$3',
  /**
   * A hint or a line of metadata, pinned to something that explains it.
   *
   * Only legible *because* of what it sits next to — a form field, an icon,
   * a card's title. Prose that has to stand on its own is `body`, even when
   * it is one line.
   */
  caption: '$2',
} as const;

/**
 * The square an empty state's illustration is drawn in, in points.
 *
 * Measured against the screen rather than fixed, because a number that looks
 * generous on a 6" phone is most of a small one's viewport — and an empty
 * state has a heading, a paragraph and sometimes a plan notice to fit beside
 * the picture. The three bounds are a floor, not a stack of preferences: the
 * smallest wins.
 *
 * - `widthRatio` is how much of the screen's width the drawing may span.
 * - `heightRatio` keeps it from crowding the text on a short screen, which
 *   width alone cannot see.
 * - `max` stops it ballooning on a tablet, where the ratios have room to.
 */
export const ILLUSTRATION_SIZE = {
  widthRatio: 0.72,
  heightRatio: 0.32,
  max: 320,
} as const;

/**
 * The navigation header's title style, in points.
 *
 * Both navigators set it as `headerTitleStyle`, and `useHeaderMetrics` reads
 * the same numbers to place a header a screen draws itself. One object rather
 * than two literals because the whole point of that hook is that the greeting
 * on home lands where a native title would — which stops being true the moment
 * one side changes its font size alone.
 *
 * `lineHeight` is what the title's single line measures, not a style anyone
 * applies: React Navigation leaves the title's line height to the font, so
 * this is the usual ~1.3 of the size, and it only has to be close enough to
 * centre a line inside a 44- to 64-point bar.
 */
export const HEADER_TITLE = {
  fontFamily: 'Caprasimo-Regular',
  fontSize: 20,
  lineHeight: 26,
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
  icon: 36,
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
