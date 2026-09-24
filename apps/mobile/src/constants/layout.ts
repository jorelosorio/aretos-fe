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
 * The type scale, named by the job each step does.
 *
 * Same argument as `SPACING`: the font scale is the unit, these are the
 * decision about which unit belongs where.
 *
 * This used to hold two roles and insist that two was enough — "a third tier
 * is how the drift starts again". The drift happened anyway, in the other
 * direction: screens reached past the tokens for a raw `size="$5"` and the app
 * ended up running nine sizes, fifty-seven of them written as literals. Two
 * roles did not prevent a third, it only meant the third was never named.
 *
 * So every step a screen legitimately needs is here, and the rule is the one
 * that was missing: **a component never writes a raw `size="$n"` for text.**
 * If a new job does not fit one of these, the scale gains a role rather than
 * the screen gaining a literal.
 *
 * Which *face* a step is set in is a separate decision, and `fonts.ts` owns
 * it: the display face names the subject, everything else is the body face
 * leaning on `fontWeight`. A bigger size is not a licence for a different
 * font.
 *
 * One surface is exempt, and only one: the full-screen note in `NOTE_TEXT`,
 * which is read a paragraph at a time with nothing beside it. That exemption
 * is argued where it is taken, not granted here.
 */
export const TEXT = {
  /**
   * A measured value read as a figure rather than as prose: a target, a
   * percentage, a stepper's count. The only step that exists to be looked at
   * rather than read.
   */
  display: '$7',
  /**
   * The most prominent text below the native header: the home greeting, an
   * empty state's message. At most one visible at a time — two would fight
   * over which is the point — but a screen may hold several behind mutually
   * exclusive states, the way an empty goals list and a populated one never
   * show together.
   *
   * A notice *inside* a populated screen — a plan limit, an archived goal —
   * is a `heading`, not a `title`: the screen already has a subject, and the
   * notice is commenting on it rather than replacing it.
   *
   * Always smaller than the native header (`HEADER_TITLE`, 20pt): the
   * hierarchy runs header → `title` → `heading`, and a step here that
   * closed that gap would make a card read as more important than the
   * screen it sits on.
   */
  title: '$6',
  /**
   * A notice's title — a plan limit, an archived goal, a diary history
   * cutoff — always this one size regardless of which screen it sits on,
   * plus a stat's own value and a glyph sized to fill a fixed shape, such as
   * an avatar's fallback initial.
   */
  heading: '$5',
  /**
   * A card's subject when the card is one of several like it: a goal's or a
   * habit's name in a list. One step below `heading` because the same name
   * reads larger where the whole screen is about that one thing — a goal's
   * own detail screen uses `title` for it instead.
   */
  subheading: '$4',
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
  /**
   * The smallest readable step: a chip, a badge, a dense tally.
   *
   * Nothing here is uppercased. All-caps is a way of adding emphasis without
   * adding size, and this app does the opposite — what matters gets a bigger
   * step and a heavier weight, which is legible rather than merely loud.
   */
  micro: '$1',
} as const;

/**
 * Button sizes, named by the job rather than the step.
 *
 * Three, because the app already had three shapes of button and a fourth that
 * was nobody's decision: `$4` turned up on a stepper's plus and on an empty
 * state's call to action, two controls with nothing in common.
 *
 * Where a button goes is as much a decision as its size, and the app follows
 * the two platforms where they agree:
 *
 * - **Creating the thing a screen lists is a `+` in its header** — Goals on
 *   its tab, habits on a goal's detail. Never a row at the end of the list:
 *   past a handful of items that row is a scroll away, and the action a list
 *   exists to grow should not get harder to reach as it grows. An empty list
 *   still carries a `primary` button in its empty state, because there the
 *   header `+` is easy to miss and the empty state is the whole screen.
 * - **A modal dismisses from the leading edge and confirms from the trailing
 *   one**: iOS's Cancel/Done, Material's full-screen dialog. The root stack
 *   puts the close on every modal; a form puts its own confirm in
 *   `headerRight`, where the keyboard cannot cover it.
 * - **A form reached by tapping a row is a push, not a modal**, and goes
 *   back with the platform's back button: editing a habit drills into the
 *   goal's list the way a settings row does. A close ✕ there reads as
 *   "throw this away" on a screen that animated in like a page. Creating
 *   something, or an edit opened from a menu, is still a modal.
 * - **Actions on the thing a screen shows — archive, delete, edit — live
 *   behind the overflow `⋮` (`…` on iOS)**, always the trailing-most item in
 *   the header, so a goal and a habit are managed from the same place. They
 *   are never a visible button beside a form's confirm: one tap away from
 *   "Guardar" is too close for "Eliminar".
 * - **A menu opens without dimming the screen.** A blur would be the native
 *   backdrop, but the app has no blur view to draw one with (the installed
 *   glass effect is iOS 26 only and draws surfaces, not backdrops), and a
 *   translucent black curtain read as a rendering glitch rather than as
 *   focus. The menu carries a shadow instead; a tap outside still closes it.
 * - **The check-in is the one exception** to a header confirm: it is a flow
 *   worked through top to bottom every day, so its save sits in a sticky
 *   footer under the thumb, with the progress it is saving beside it.
 */
export const BUTTON = {
  /**
   * The screen's main action — the check-in's save in its sticky footer, an
   * empty state's way forward. One per screen.
   */
  primary: '$5',
  /** An icon-only action: a header, a row, a menu, a close. */
  icon: '$3',
  /** A compact inline control, such as a stepper's plus and minus. */
  compact: '$2',
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
 * How far the tab navigator's header actions sit in from the trailing edge,
 * in points.
 *
 * Only the tabs need it. The root stack draws a native header, which places
 * its bar items with the platform's own margins; the tab navigator draws a
 * JavaScript one that puts `headerRight` flush against the edge, where a `+`
 * would sit closer to the glass than the title does on the other side.
 */
export const HEADER_INSET = 8;

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
  height: 64,
  /** How far the pill sits above the bottom safe area. */
  gap: 16,
  /**
   * How far the pill sits in from each side.
   *
   * The bar spans the width rather than hugging its content. Six slots — five
   * tabs and the action — cannot be made both larger and further apart inside
   * a width that is the sum of its parts: at a 40pt glyph and a comfortable
   * gap that sum passes 370pt, which overflows a 360pt phone. Spanning the
   * width makes the slots share what is there instead, so the bar cannot
   * overflow and simply grows roomier on a larger screen.
   */
  inset: 16,
  /**
   * The tab glyphs, which sit a step above `ICON.feature`.
   *
   * Their own number rather than a role from `ICON` because the bar is the
   * one place where the icon *is* the control — there is no label beside it
   * and nothing else in the pill to read.
   */
  icon: 40,
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
