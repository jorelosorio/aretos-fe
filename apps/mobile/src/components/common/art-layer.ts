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
 * The drawings were composed at whatever size suited each one, so in the
 * same square one filled it edge to edge and another sat smaller and low,
 * and side by side they read as different sizes. Fitting each to one box
 * makes them match; `all-logged.svg`, which is not layered, has the same fit
 * baked into its outer group.
 */
export const ART_EXTENT = 440;
