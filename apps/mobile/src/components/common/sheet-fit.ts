/**
 * Where a `fit` sheet rests: low enough that exactly its chrome (handle and
 * title), its content and the bottom inset show, and no blank sheet below.
 *
 * The sheet is positioned by how far it sits below fully open, so the answer
 * is `full` minus what should be visible. Content taller than the sheet can
 * grow opens it fully — it still scrolls inside. Until both parts have been
 * measured there is nothing to fit to, and null tells the caller to hold its
 * current height rather than jump to a guess.
 */
export function fitResting({
  full,
  chrome,
  content,
  bottom,
}: {
  full: number;
  chrome: number;
  content: number;
  bottom: number;
}): number | null {
  if (chrome === 0 || content === 0) return null;
  return Math.max(0, full - (chrome + content + bottom));
}

/** How much a drag past the floor is damped: a quarter of the finger. */
const RESISTANCE = 4;

/**
 * The sheet's offset while dragged. Above the floor it follows the finger;
 * past it, it gives a little and then stops, so the sheet feels elastic
 * rather than stuck — and never opens a gap under itself, since it is drawn
 * `overdrag` taller than it needs.
 *
 * The floor is fully open (0) for a sheet that may expand, and its resting
 * height for one that may not.
 */
export function resistDrag(
  next: number,
  floor: number,
  overdrag: number,
): number {
  'worklet';
  if (next >= floor) return next;
  return Math.max(floor + (next - floor) / RESISTANCE, floor - overdrag);
}

/**
 * Where a released sheet may settle. A sheet that may not expand has no
 * fully-open point to land on — only its resting height, or closed.
 */
export function snapPoints(
  resting: number,
  full: number,
  allowExpand: boolean,
): number[] {
  'worklet';
  return allowExpand ? [0, resting, full] : [resting, full];
}
