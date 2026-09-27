import { createContext, useContext } from 'react';

/**
 * The width a chart card's body measured, for the charts drawn inside it.
 *
 * The chart libraries need a number in points rather than a flex size, and
 * only the card knows it once it has laid out. Handing it down this way lets
 * a chart sit anywhere in the card's body without every card threading a
 * `width` through its own rows. `ChartCard` renders its body only after the
 * measurement, so a chart never reads 0.
 */
export const ChartWidthContext = createContext(0);

export function useChartWidth(): number {
  return useContext(ChartWidthContext);
}
