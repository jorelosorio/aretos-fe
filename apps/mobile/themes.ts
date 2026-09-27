import { createV5Theme } from '@tamagui/config/v5';

const lightPalette = [
  '#fffaf1',
  '#f7efe2',
  '#efe3ce',
  '#ded3c0',
  '#cfc4b0',
  '#c2b6a2',
  '#a69b8b',
  '#948976',
  '#8a8073',
  '#686054',
  '#474036',
  '#2a211b',
];

const darkPalette = [
  '#171310',
  '#1d1712',
  '#2a221c',
  '#332b23',
  '#3e352c',
  '#4d4238',
  '#5f5346',
  '#7a6e5f',
  '#9a8f80',
  '#ada093',
  '#c1b4a7',
  '#f5eade',
];

const accentLight = {
  accent1: '#8f431c',
  accent2: '#b65b33',
  accent3: '#c25a33',
  accent4: '#cd6539',
  accent5: '#d5764a',
  accent6: '#e08f5c',
  accent7: '#e9a879',
  accent8: '#efb894',
  accent9: '#f7dcc4',
  accent10: '#ffdcc7',
  accent11: '#fff1e8',
  accent12: '#ffffff',
};

const accentDark = {
  accent1: '#f0a879',
  accent2: '#e58b5a',
  accent3: '#d9834a',
  accent4: '#cd7a44',
  accent5: '#c96a3a',
  accent6: '#ad6033',
  accent7: '#93502b',
  accent8: '#7a4423',
  accent9: '#5c3219',
  accent10: '#472a1e',
  accent11: '#392319',
  accent12: '#1d1712',
};

/**
 * The informative colours, defined once for both schemes.
 *
 * Every role that means "done" — `good`, `outcomeDone`, `successInk`, and the
 * moss goal slot `chart8` — reads from `done`, and every role that means
 * "missed" or "watch this" — `warning`, `outcomeMissed`, and the ochre goal
 * slot `chart3` — reads from `missed`. `destructive` and `critical` read from
 * `danger`. A role may alias one of these but never gets its own value for
 * the same meaning, so one screen never shows two greens for "done".
 *
 * The same set serves both schemes, so a check mark is one colour in light
 * and dark and "done" reads as one thing. That constrains how light or dark
 * the set can be:
 *
 * - A pastel cannot serve both: it is itself light, so it contrasts only
 *   with a near-black surface and all but disappears on cream.
 * - So these are mid-tones, each the lightness that maximises its *worst*
 *   contrast across every surface it lands on in either scheme: card, page
 *   and field in light; card, page and muted in dark. Each holds 3.5–4.3:1
 *   on all of them. That clears 3:1 for marks, bars and bold labels.
 *   It is short of 4.5:1 for small body text, and no single colour can
 *   reach that on both cream and near-black: the ceiling is about 3.7:1.
 *
 * `ink` is what is drawn *on* one of these fills, such as the tick inside a
 * done mark: cream, which holds about 4.3:1 on all three.
 */
const status = {
  done: '#65803c',
  missed: '#9b7027',
  danger: '#c25549',
  ink: '#fffaf1',
};

/**
 * The neutral outcomes stay per scheme: they are not informative colours but
 * shades of the surface — a skipped or blank day should recede into whatever
 * it sits on, which a single value cannot do on both cream and near-black.
 */
const lightNeutral = {
  skipped: '#8a8073',
  blank: '#cfc4b0',
};

const darkNeutral: typeof lightNeutral = {
  skipped: '#968a7c',
  blank: '#4d4238',
};

/**
 * Every colour here belongs to one earthy family: cream, clay, terracotta,
 * moss, ochre. Generic UI-kit colours — a grass green, a traffic-light
 * yellow, a pure red, a chart palette of teal, royal blue and violet — would
 * be the loudest thing on any screen, louder than the terracotta that is
 * meant to lead.
 *
 * So each semantic role is the earthy cousin of what it means:
 *
 * - `good` is moss — the very value `outcomeDone` is — so "this is going
 *   well" and "this habit was done" are one colour, not two close ones.
 * - `warning` is ochre, the very value `outcomeMissed` is: a caution, not an
 *   alarm, because in this app a slipping trend is information rather than a
 *   failure.
 * - `destructive` and `critical` are brick, red enough to stop a thumb on
 *   "Eliminar" but not a siren.
 * - `chart1`–`chart8` keep the hue each goal slot already had (teal stays
 *   teal-ish, pink stays rose) but muted to the theme's saturation, so a goal
 *   does not change identity, only volume.
 *
 * Each scheme's own roles hold at least 4.5:1 against its `card` and
 * `background` when set as text, except the chart slots, which are dots and
 * fills and hold 3:1. The shared status colours are the exception, at
 * 3.5–4.3:1 in both; the note on `status` says why.
 */
const lightRoles = {
  card: '#fffaf1',
  cardForeground: '#2a211b',
  // A pressed card. Its own role, not `muted`: cards carry `muted` chips and
  // strips inside them, and a press that turned the card that same colour made
  // them vanish under the finger. Darker than `muted` in light, lighter than
  // `card` in dark, so it reads apart from both.
  cardPress: '#e4d6bd',
  // A text field's well. Its own role, not `card`: at the card's near-white
  // on the cream screen a field reads as a white box rather than as a place
  // to write. It sits a step *below* the screen, tinted toward the
  // terracotta, so a form reads as wells to fill between the raised cards of
  // its choices. `fieldChip` is what a tag chip sits as inside one — `muted`
  // is too close to the well to separate from it.
  field: '#f2e1cf',
  fieldBorder: '#dfc6ac',
  fieldChip: '#fffaf1',
  popover: '#fffaf1',
  popoverForeground: '#2a211b',

  primary: '#b65b33',
  primaryForeground: '#ffffff',
  secondary: '#efe3ce',
  secondaryForeground: '#2a211b',
  muted: '#efe3ce',
  mutedForeground: '#474036',
  accentSurface: '#fff1e8',
  accentSurfaceForeground: '#67301a',
  destructive: status.danger,
  destructiveForeground: status.ink,

  border: '#ded3c0',
  input: '#c2b6a2',
  ring: '#d5764a',

  sidebar: '#f0e8d9',
  sidebarForeground: '#2a211b',
  sidebarPrimary: '#b65b33',
  sidebarPrimaryForeground: '#ffffff',
  sidebarAccent: '#fff1e8',
  sidebarAccentForeground: '#67301a',
  sidebarBorder: '#ded3c0',
  sidebarRing: '#d5764a',

  deco1: '#ffdcc7',
  deco2: '#e1edc9',
  deco3: '#fbe7bb',
  deco1Vivid: '#f89a5c',
  deco2Vivid: '#8fbf5a',
  deco3Vivid: '#f0b23c',
  deco1Shade: '#a8501f',
  deco2Shade: '#4a6b28',
  seedEmberInk: '#8f4322',
  seedMossInk: '#3c4e2a',

  chart1: '#c25a33',
  chart2: '#4d8578',
  chart3: status.missed,
  chart4: '#b0606c',
  chart5: '#7d5f93',
  chart6: '#8f6b47',
  chart7: '#56718f',
  chart8: status.done,

  vizAxis: '#8a8073',
  vizGrid: '#e9e0d1',
  vizBaseline: '#cfc4b0',
  vizEmpty: '#f0e8db',
  vizTrack: '#f5e4d2',

  seq1: '#f7dcc4',
  seq2: '#efb894',
  seq3: '#e08f5c',
  seq4: '#c2652f',
  seq5: '#8f431c',

  good: status.done,
  warning: status.missed,
  serious: '#c2652f',
  critical: status.danger,
  successInk: status.done,
  statusForeground: status.ink,

  outcomeDone: status.done,
  outcomeMissed: status.missed,
  outcomeSkipped: lightNeutral.skipped,
  outcomeBlank: lightNeutral.blank,
};

const darkRoles: typeof lightRoles = {
  card: '#2a221c',
  cardForeground: '#f5eade',
  cardPress: '#3a2f27',
  field: '#2a221c',
  fieldBorder: 'rgba(245, 234, 222, 0.12)',
  fieldChip: '#171310',
  popover: '#2a221c',
  popoverForeground: '#f5eade',

  primary: '#e58b5a',
  primaryForeground: '#1d1712',
  secondary: '#171310',
  secondaryForeground: '#f5eade',
  muted: '#171310',
  mutedForeground: '#c1b4a7',
  accentSurface: '#392319',
  accentSurfaceForeground: '#f6c6a3',
  destructive: status.danger,
  destructiveForeground: status.ink,

  border: 'rgba(245, 234, 222, 0.12)',
  input: 'rgba(245, 234, 222, 0.16)',
  ring: '#f0a879',

  sidebar: '#171310',
  sidebarForeground: '#f5eade',
  sidebarPrimary: '#e58b5a',
  sidebarPrimaryForeground: '#1d1712',
  sidebarAccent: '#392319',
  sidebarAccentForeground: '#f6c6a3',
  sidebarBorder: 'rgba(245, 234, 222, 0.1)',
  sidebarRing: '#f0a879',

  deco1: '#472a1e',
  deco2: '#2e3d24',
  deco3: '#4a3616',
  deco1Vivid: '#c96a3a',
  deco2Vivid: '#6f9445',
  deco3Vivid: '#b8802a',
  deco1Shade: '#1a0d06',
  deco2Shade: '#0d1408',
  seedEmberInk: '#f6c6a3',
  seedMossInk: '#a8c084',

  chart1: '#e0875a',
  chart2: '#7fb8aa',
  chart3: status.missed,
  chart4: '#d98a92',
  chart5: '#b096c4',
  chart6: '#c09a74',
  chart7: '#8fa6c4',
  chart8: status.done,

  vizAxis: '#9a8f80',
  vizGrid: '#332b23',
  vizBaseline: '#3e352c',
  vizEmpty: '#281f18',
  vizTrack: '#3d2717',

  seq1: '#4a2a18',
  seq2: '#7a4423',
  seq3: '#ad6033',
  seq4: '#d9834a',
  seq5: '#f0ab77',

  good: status.done,
  warning: status.missed,
  serious: '#e58b5a',
  critical: status.danger,
  successInk: status.done,
  statusForeground: status.ink,

  outcomeDone: status.done,
  outcomeMissed: status.missed,
  outcomeSkipped: darkNeutral.skipped,
  outcomeBlank: darkNeutral.blank,
};

export const themes = createV5Theme({
  lightPalette,
  darkPalette,
  accent: { light: accentLight, dark: accentDark },
  childrenThemes: {},
  getTheme: ({ scheme }) => (scheme === 'dark' ? darkRoles : lightRoles),
});
