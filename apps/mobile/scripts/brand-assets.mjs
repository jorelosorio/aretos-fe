// Renders every brand asset — the SVG logos in assets/brand and every raster
// icon and launch image — from the one definition of the mark below. The app
// draws the mark from these files too (BrandMark shows the launch images), so
// nothing else holds a copy of the geometry.
// Run: npm run brand:assets
import { mkdirSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

// The mark is a lowercase a: the bowl is an open ring of recurring days, the
// dot — the moment — sits in the ring's gap, and the stem down the right side
// makes the ring a letter.
//
// Path and gradient are the designer's file exactly as exported: one shape
// (letter and dot) in its own 1500 × 1500 box, filled top to bottom from peach
// through ember to moss. PLACE sets that box on the 23.5–76.5 extent of the
// 100 × 100 box every asset below is composed in; the gradient is in the
// path's own units, so it moves with it.
const MARK_PATH =
  'M2119.435,1588.819C1825.724,1809.528 1406.328,1786.271 1139.104,1519.048C846.407,1226.351 846.407,751.085 1139.104,458.388C1345.207,252.285 1652.054,184.259 1925.95,283.948C2003.744,312.263 2043.915,398.411 2015.6,476.205C1987.286,554 1901.138,594.171 1823.344,565.856C1659.006,506.042 1474.898,546.858 1351.236,670.52C1175.618,846.138 1175.618,1131.298 1351.236,1306.916C1526.855,1482.534 1812.014,1482.534 1987.633,1306.916C2071.958,1222.591 2118.966,1108.693 2119.434,990.539L2119.435,990.093C2119.678,907.483 2186.824,840.536 2269.434,840.539L2269.88,840.539C2352.491,840.782 2419.437,907.928 2419.434,990.539L2419.434,990.984L2419.434,1588.6C2419.434,1671.387 2352.222,1738.6 2269.434,1738.6C2186.72,1738.6 2119.553,1671.506 2119.435,1588.819ZM2142.74,508.372C2225.527,508.372 2292.74,575.585 2292.74,658.372C2292.74,741.16 2225.527,808.372 2142.74,808.372C2059.953,808.372 1992.74,741.16 1992.74,658.372C1992.74,575.585 2059.953,508.372 2142.74,508.372Z';
const MARK_GRADIENT =
  '<linearGradient id="mark" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0,1499.874231,-1499.874231,0,1669.508011,238.696532)"><stop offset="0" stop-color="#f0a879"/><stop offset="0.5" stop-color="#e79160"/><stop offset="1" stop-color="#8fbf5a"/></linearGradient>';
const PLACE = `translate(23.5 23.5) scale(${53 / 1500}) translate(-919.581533 -238.696533)`;

const shape = (fill) =>
  `<path transform="${PLACE}" d="${MARK_PATH}" fill="${fill}" fill-rule="evenodd"/>`;

const mark = shape('url(#mark)');

// One flat colour: what Android's themed icons and iOS's tinted mode
// recolour, so it has to read as a silhouette.
const flat = (ink) => shape(ink);

// Each icon tile is its theme's own neutral ramp, lightest to darkest across
// the diagonal: light runs `popover` → `muted`, dark runs its third palette
// step → `muted`, the same values themes.ts holds.
const LIGHT_TILE = ['#fffaf1', '#efe3ce'];
const DARK_TILE = ['#2a221c', '#171310'];

const defs = (tile = LIGHT_TILE) =>
  `<defs>${MARK_GRADIENT}<linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tile[0]}"/><stop offset="1" stop-color="${tile[1]}"/></linearGradient></defs>`;

// Scales content about the centre of the box, so the mark stays centred.
const scaled = (factor, body) => {
  const shift = 50 - 50 * factor;
  return `<g transform="translate(${shift} ${shift}) scale(${factor})">${body}</g>`;
};

const svg = (body, viewBox = '0 0 100 100') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;

// How large the mark sits in each kind of asset, as a multiple of its drawn
// size (53 units of the 100 box).
const ON_TILE = 1.1; // ≈58% of an icon's side
// Android masks the adaptive icon to a circle, so the mark is set larger there,
// at the size of the system's own icons in the same launcher; its farthest
// point still sits inside the 66dp safe zone.
const ON_ADAPTIVE = 0.84; // ≈67% of the 72dp an adaptive icon shows
const ON_SPLASH = 1.4; // fills the launch image with a margin around it

const icon = (tile) =>
  svg(
    `${defs(tile)}<rect width="100" height="100" fill="url(#tile)"/>${scaled(ON_TILE, mark)}`,
  );

function write(file, contents) {
  writeFileSync(file, contents);
  console.log('wrote', file);
}

function render(file, size, source) {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: size } })
    .render()
    .asPng();
  write(file, png);
}

mkdirSync('assets/brand', { recursive: true });
mkdirSync('assets/images', { recursive: true });

// The logo as vectors, for anywhere outside the app that needs it. The mark
// is the same on light and dark grounds.
write('assets/brand/logo.svg', svg(`${defs()}${mark}`, '23.5 23.5 53 53'));
write('assets/brand/icon.svg', icon(LIGHT_TILE));
write('assets/brand/icon-dark.svg', icon(DARK_TILE));

// App icon (Expo default and the store listing): full bleed, the OS applies
// its own mask.
render('assets/images/icon.png', 1024, icon(LIGHT_TILE));

// Android adaptive icon: the gradient tile behind, the mark in front sized to
// the visible 72dp of the 108dp canvas, and a flat copy for themed icons.
render(
  'assets/images/android-icon-background.png',
  1024,
  svg(`${defs()}<rect width="100" height="100" fill="url(#tile)"/>`),
);
render(
  'assets/images/android-icon-foreground.png',
  1024,
  svg(`${defs()}${scaled(ON_ADAPTIVE, mark)}`),
);
render(
  'assets/images/android-icon-monochrome.png',
  1024,
  svg(scaled(ON_ADAPTIVE, flat('#ffffff'))),
);

// iOS Icon Composer layer: the mark alone at the icon's scale; the gradient
// is the icon's fill in assets/expo.icon/icon.json.
render(
  'assets/expo.icon/Assets/mark.png',
  1024,
  svg(`${defs()}${scaled(ON_TILE, mark)}`),
);

// Launch images, one per theme. BrandMark shows these same files, so the
// hand-off from the native launch screen to the app does not change a pixel.
// The mark is identical in both; they stay two files so each theme's launch
// screen keeps its own image slot.
render(
  'assets/images/splash-icon.png',
  512,
  svg(`${defs()}${scaled(ON_SPLASH, mark)}`),
);
render(
  'assets/images/splash-icon-dark.png',
  512,
  svg(`${defs()}${scaled(ON_SPLASH, mark)}`),
);

render('assets/images/favicon.png', 48, icon(LIGHT_TILE));
