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
  /**
   * `section` in points, for the one place that has to add it to other
   * numbers — the splash places its caption a fixed distance below a mark
   * centred on the screen, so it needs arithmetic a token cannot do.
   */
  sectionPx: 24,
} as const;

/**
 * The type scale, named by the job each step does.
 *
 * Same argument as `SPACING`: the font scale is the unit, these are the
 * decision about which unit belongs where.
 *
 * A scale too small to cover every job does not stop a screen needing one
 * more step; it only means the step gets written as a raw literal nobody
 * named. So every step a screen legitimately needs is here, and the rule is:
 * **a component never writes a raw `size="$n"` for text.**
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
   * The product name beside the mark on the welcome screen. It is half of the
   * logo lockup rather than a step in the reading order, so it is sized to sit
   * with the mark at `MARK_SIZE.md`, while staying below `hero` so the
   * headline remains the point of the screen. Used there and nowhere else.
   */
  brand: '$7',
  /**
   * The welcome screen's headline — the one screen with no native header
   * above it, so the "smaller than the header" ceiling on `title` does not
   * apply. Used there and nowhere else.
   */
  hero: '$8',
  /**
   * The paragraph under the welcome headline that says what the headline
   * means: read once, in the body face and a muted colour, so it sits a step
   * below `hero` without competing with it. Used there and nowhere else.
   */
  lede: '$5',
  /**
   * A measured value read as a figure rather than as prose: a target, a
   * percentage, a stepper's count. The only step that exists to be looked at
   * rather than read.
   */
  display: '$7',
  /**
   * The most prominent text below the native header: Home's date, which
   * heads its list the way a headline heads a page, or an empty state's
   * message. Home's greeting sits above the date at `subheading` — a name and
   * a hello, not the point of the screen. At most one visible at a time — two would fight
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
   * A card's subject: a goal's or a habit's name, wherever it sits in the
   * content. One size everywhere, a goal's own detail screen included: the
   * native header above already names the goal, so the name in its card has
   * no reason to be louder than on any other card.
   */
  subheading: '$4',
  /**
   * Running prose: whatever is read as sentences, however short. Also a
   * row's label in a grouped list — Settings, a form's choices — one step
   * below the `SectionTitle` above it. At the title's own size a heading
   * and its rows would differ only by weight, and the heading would read as
   * one more row.
   */
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
 * - **A card that opens something carries no chevron.** The whole card is
 *   the button, and its edge and its press state already say so; a `›` at
 *   the end would take a column from every card and read as a second,
 *   smaller target. A card whose tap does something more specific than "open" may
 *   show it as a small icon in its top-right corner — home's goal card shows
 *   a pencil because a tap logs or edits the entry. A **list row**, like the
 *   ones in Settings, keeps its chevron: that is the platform's own mark for
 *   a row that leads to another screen, and rows have no edge to say it.
 * - **A menu opens without dimming the screen.** A blur would be the native
 *   backdrop, but the app has no blur view to draw one with (the installed
 *   glass effect is iOS 26 only and draws surfaces, not backdrops), and a
 *   translucent black curtain read as a rendering glitch rather than as
 *   focus. The menu carries a shadow instead; a tap outside still closes it.
 *   The same holds for a `FullScreenSheet` and a `BottomSheet`: Android dims
 *   behind any opaque `Modal`, so both are transparent ones that slide
 *   themselves in. A `BottomSheet` leaves the screen above it in view, and a
 *   tap there closes it the way a tap outside a menu does.
 * - **No exceptions for long flows.** The check-in is worked through top to
 *   bottom daily, but its confirm is still in the header like every other
 *   modal's — a sticky footer save would be a second convention for the same
 *   job. Its "2 of 3" sits with the period title, where it describes what is
 *   being saved rather than the button.
 */
export const BUTTON = {
  /**
   * An empty state's way forward, or a standalone action such as signing in
   * or out. One per screen. A form's confirm is never this size: it is a
   * `HeaderTextButton`.
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
 * that with `useTabBarInset` as bottom padding: the pill plus a `gap` above
 * it, so the last item comes to rest clear of the bar rather than touching it.
 *
 * Content passing behind is why the pill carries a wide, soft shadow: it is
 * a `$card` over lists of `$card`, and without an edge a goal card scrolling
 * underneath would merge into it. The halo runs round every side, so it is
 * the edge on its own; a border inside it would only double the outline.
 * The pill stays `$card` rather than taking a lighter "elevated" surface,
 * which would read as a different component rather than the same card
 * raised, and nothing fades the content behind it, which would hide
 * everything below and stop the bar floating.
 */
export const TAB_BAR = {
  height: 56,
  /** How far the pill sits above the bottom safe area. */
  gap: 12,
  /**
   * The width of one tab's touch target; the pill is these laid side by side.
   *
   * The bar hugs its tabs, centred, rather than spanning the screen: five
   * slots of this width come to under 300pt, so the pill is only as wide as
   * what is in it and covers less of the list scrolling behind it. A sixth
   * slot would pass 360pt and overflow a small phone. 56 is the height
   * too: each tab's target is a square, comfortably over the 44/48pt minimum
   * on both platforms.
   */
  slot: 56,
  /**
   * The tab glyphs, which sit a step above `ICON.feature`.
   *
   * Their own number rather than a role from `ICON` because the bar is the
   * one place where the icon *is* the control — there is no label beside it
   * and nothing else in the pill to read.
   */
  icon: 40,
  /**
   * The halo that lifts the pill, as a `boxShadow`: a wide blur with only a
   * slight drop, so it reads as a drop shadow yet still spreads round every
   * edge. A `boxShadow` rather than `elevation`, which Android lights from
   * above: it falls under the bar only, leaves the sides and top bare, and
   * the pill reads as resting on the content rather than floating over it.
   *
   * The pill has no border, so this blur is its edge on its own. Wide and
   * soft rather than tight, because a tight halo round a borderless shape
   * reads as a drawn outline. Softer in dark for the reason `SHEET.shadow`
   * is: a dense black halo on a near-black screen reads as a band. Dark is
   * two wide, faint layers for the same reason: stacked, their blur falls off
   * gradually, where a single dense one concentrates at the rim and reads
   * as a ring rather than a shadow. Neither is tight: a small blur draws a
   * crisp dark edge against the pill, which reads as an outline.
   */
  shadow: {
    light: '0px 4px 32px rgba(0, 0, 0, 0.16)',
    dark: '0px 6px 24px rgba(0, 0, 0, 0.18), 0px 16px 64px rgba(0, 0, 0, 0.32)',
  },
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

/**
 * The geometry of a `BottomSheet`, in points unless noted.
 *
 * - `detents` are the heights a sheet opens at, as a share of the screen.
 *   Two and only two: `half` for something glanced at, `tall` for something
 *   read. Dragging up always reaches the full height, so a third opening size
 *   would only be a guess at where the user was going to drag anyway. The one
 *   exception is not a size at all: a sheet opened with `fit` measures its
 *   own content and opens exactly that tall — for content that is one fixed
 *   size, like a date picker, where either preset leaves blank sheet below.
 * - `topGap` is what stays visible above a fully expanded sheet, below the
 *   status bar. Without it an expanded sheet is indistinguishable from a
 *   pushed screen, and the drag down that closes it stops being discoverable.
 * - `overdrag` is how far the sheet may be pulled past its full height before
 *   it stops following the finger. The sheet is drawn that much taller than
 *   it needs, below the screen, so the resistance never opens a gap under it.
 * - `radius` is the `$xl3` token as a number, because the view that casts
 *   the sheet's shadow is a plain animated view that cannot read tokens.
 * - `padding` is the sheet's side margin, for its header and its content
 *   alike, so the first line of what it shows sits under the title. A step
 *   above `SPACING.screen`: the rounded corners eat into the edge, and at the
 *   screen's own margin the title looked pushed into them.
 * - `shadow` is cast upward, the only direction a sheet has an edge to show.
 *   It is a `boxShadow` rather than `elevation`, which on Android lights from
 *   above and draws almost nothing over a view's top edge. In dark it is
 *   deliberately faint: a dense one on a near-black screen reads as a black
 *   band behind the list rather than as depth. What outlines
 *   the sheet there is its surface instead — `$popover`, a step lighter than
 *   the screen, the way Material lifts an elevated surface in dark — and a
 *   hairline of `$border` around the rounded edge.
 * - `handle` is the grabber at the top centre: iOS's 36 × 5 and Material's
 *   32 × 4 are close enough that one size reads as native on both.
 */
export const SHEET = {
  detents: { half: 0.5, tall: 0.7 },
  topGap: 12,
  overdrag: 80,
  radius: 21,
  padding: '$5',
  shadow: {
    light: '0px -4px 24px rgba(0, 0, 0, 0.14)',
    dark: '0px -2px 16px rgba(0, 0, 0, 0.3)',
  },
  handle: { width: 36, height: 5 },
} as const;

/**
 * How far past its drawn edge a small control still takes a tap, in points.
 *
 * For the controls drawn smaller than the 44/48pt platform minimum because a
 * bigger shape would crowd what sits beside it: a chip's remove mark, a
 * header's icon, a section's text action. The hit area grows instead of the
 * drawing. A control packed tighter than its neighbours' reach, like the
 * colour swatches, keeps a smaller slop of its own so taps do not overlap.
 */
export const HIT_SLOP = 8;

/**
 * The side of one day's cell in a calendar or a week strip, in points.
 *
 * One number for the month calendar and the check-in week picker because
 * they show the same thing — a day that can be picked — and a day that
 * changed size between the two would read as two different controls.
 */
export const DAY_CELL = 38;
