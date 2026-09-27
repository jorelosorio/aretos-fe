/**
 * One layer of an animated illustration, and the space it is drawn in.
 *
 * Every layer is a whole `VIEWBOX` × `VIEWBOX` SVG holding only its own
 * shapes, so layers stack exactly and each can move on its own. `center` is
 * in that same space: the point a part floats, twinkles, grows or turns
 * around.
 */

export type ArtLayer = { xml: string; center: readonly [number, number] };

export const VIEWBOX = 500;

/**
 * A drawing's visible extent in `VIEWBOX` units, as `[left, top, right,
 * bottom]` — backdrop, badges and sparkles included, measured once from the
 * rendered layers.
 */
export type ArtBounds = readonly [number, number, number, number];

/**
 * How large every illustration's visible content is drawn: its longer side
 * spans this many units, centred in the frame.
 *
 * Each drawing is composed at whatever size suits it, so in the same square
 * one would fill it edge to edge and another sit smaller and low. Fitting
 * each to one box makes them read as the same size side by side. The still
 * SVGs in `assets/illustrations` have the same fit baked into their outer
 * `fit` group.
 */
export const ART_EXTENT = 440;

/**
 * The seven colours every illustration is drawn in — the animated layers and
 * the still SVGs in `assets/illustrations` alike. Fixed values rather than
 * theme tokens, because a drawing is one image in both themes; they are the
 * theme's own warm family, so it sits in either.
 *
 * Storyset's drawings arrive with their own yellow, cool greys, pure white, a
 * second dark slate and a pink; each is mapped onto one of these when a
 * drawing is added. Opacity may vary — a shadow is `ink` at 35% — but a new
 * hue may not, or the set stops reading as one.
 */
export const ART_PALETTE = {
  ink: '#263238',
  slate: '#455a64',
  salmon: '#d3766a',
  peach: '#f0a879',
  cream: '#f9f0e2',
  muted: '#efe3ce',
  border: '#ded3c0',
} as const;
