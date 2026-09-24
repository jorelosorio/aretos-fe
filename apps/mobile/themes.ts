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
 * The status colours, each defined once per scheme.
 *
 * Every role that means "done" — `good`, `outcomeDone`, `successInk`, and the
 * moss goal slot `chart8` — reads from `done`, and every role that means
 * "missed" or "watch this" — `warning`, `outcomeMissed`, and the ochre goal
 * slot `chart3` — reads from `missed`. `destructive` and `critical` read from
 * `danger`. They used to be separate
 * literals that had drifted a few shades apart, so the analysis tab showed
 * three greens on one screen: the donut's, the best-day bar's, and the
 * verdict text's. A role here may alias one of these; it never gets its own
 * value for the same meaning again.
 */
const lightStatus = {
  done: '#4a6b28',
  missed: '#8f6210',
  skipped: '#8a8073',
  blank: '#cfc4b0',
  danger: '#b5483f',
};

const darkStatus: typeof lightStatus = {
  done: '#a8c084',
  missed: '#e6b45c',
  skipped: '#968a7c',
  blank: '#4d4238',
  danger: '#e27d72',
};

/**
 * Every colour here belongs to one earthy family: cream, clay, terracotta,
 * moss, ochre. The status and chart roles used to be borrowed from a generic
 * UI kit — a grass green, a traffic-light yellow, a pure red, and a chart
 * palette of teal, royal blue and violet — and they were the loudest thing on
 * any screen they appeared on, louder than the terracotta that is meant to
 * lead.
 *
 * So each semantic role is now the earthy cousin of what it means:
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
 * Light values hold at least 4.5:1 against both `card` and `background` when
 * set as text, except the chart slots, which are dots and fills and hold 3:1.
 * Dark values are the same hues lifted, all above 5:1 on `card`.
 */
const lightRoles = {
  card: '#fffaf1',
  cardForeground: '#2a211b',
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
  destructive: lightStatus.danger,
  destructiveForeground: '#ffffff',

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
  chart3: lightStatus.missed,
  chart4: '#b0606c',
  chart5: '#7d5f93',
  chart6: '#8f6b47',
  chart7: '#56718f',
  chart8: lightStatus.done,

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

  good: lightStatus.done,
  warning: lightStatus.missed,
  serious: '#c2652f',
  critical: lightStatus.danger,
  successInk: lightStatus.done,

  outcomeDone: lightStatus.done,
  outcomeMissed: lightStatus.missed,
  outcomeSkipped: lightStatus.skipped,
  outcomeBlank: lightStatus.blank,
};

const darkRoles: typeof lightRoles = {
  card: '#2a221c',
  cardForeground: '#f5eade',
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
  destructive: darkStatus.danger,
  destructiveForeground: '#0b0b0b',

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
  chart3: darkStatus.missed,
  chart4: '#d98a92',
  chart5: '#b096c4',
  chart6: '#c09a74',
  chart7: '#8fa6c4',
  chart8: darkStatus.done,

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

  good: darkStatus.done,
  warning: darkStatus.missed,
  serious: '#e58b5a',
  critical: darkStatus.danger,
  successInk: darkStatus.done,

  outcomeDone: darkStatus.done,
  outcomeMissed: darkStatus.missed,
  outcomeSkipped: darkStatus.skipped,
  outcomeBlank: darkStatus.blank,
};

export const themes = createV5Theme({
  lightPalette,
  darkPalette,
  accent: { light: accentLight, dark: accentDark },
  childrenThemes: {},
  getTheme: ({ scheme }) => (scheme === 'dark' ? darkRoles : lightRoles),
});
