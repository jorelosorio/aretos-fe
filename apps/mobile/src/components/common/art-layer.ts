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
