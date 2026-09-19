/**
 * The chart palette, indexed by a goal's `color_slot`.
 *
 * Slots are never cycled: past eight goals the dot falls back to muted ink
 * rather than repeating a hue, because two goals sharing a colour reads as a
 * relationship that is not there. Same rule as the web app's `categorySlot`.
 */
const SLOT_COLORS = [
  '$chart1',
  '$chart2',
  '$chart3',
  '$chart4',
  '$chart5',
  '$chart6',
  '$chart7',
  '$chart8',
] as const;

/** Inferred, not annotated as `string`: Tamagui only accepts its own tokens. */
export const slotColor = (slot: number) =>
  SLOT_COLORS[slot] ?? '$mutedForeground';
