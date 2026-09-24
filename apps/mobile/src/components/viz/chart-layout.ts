/**
 * Where a chart's marks go, computed so they fill the card and nothing more.
 *
 * `react-native-gifted-charts` sizes its container as `width +
 * yAxisLabelWidth`, and with the axis text hidden that label column still
 * defaults to 10 points. Every bar chart in the app was therefore 10 points
 * wider than the card it sat in and drawn 10 points to the right of centre —
 * which is what read as "the week leans right". The charts here pass
 * `yAxisLabelWidth={0}` (or a real, reserved width when they do draw labels)
 * and take their spacing from these functions rather than from ratios
 * written inline, so the arithmetic below is the only place the library's
 * sums have to be matched.
 */

/** How much of each bar's slot is the bar itself; the rest is its gap. */
const BAR_FILL = 0.56;
const MIN_BAR = 8;

/**
 * Bars that fill `width` exactly, with the same margin on both ends.
 *
 * The library adds up `initialSpacing + endSpacing + n × (barWidth +
 * spacing)`: every bar, the last one included, is followed by a gap. So with
 * each slot `width / n` and `initialSpacing` half a gap, the first bar starts
 * half a gap in and the last one ends half a gap before the edge — centred —
 * while the trailing gap the library counts is the half that overhangs, and
 * `endSpacing: 0` plus `xAxisLength: width` keep that overhang invisible.
 *
 * Labels are the other half of the same arithmetic. The library draws each
 * x-axis label in a box `labelWidth + spacing` wide starting half a gap left
 * of its bar, so the box is centred on the bar only when `labelWidth` is the
 * bar's own width — which is its default. Passing the slot width instead, as
 * this chart once did, shifts every label half a gap right and clips the last
 * one at the card's edge. Leave `labelWidth` unset.
 *
 * A bar that reaches the top of the plot leaves its value label nowhere to
 * go, so charts that print one pass `overflowTop` for the room above.
 */
export function barLayout(width: number, count: number) {
  const slot = width / Math.max(count, 1);
  const barWidth = Math.max(MIN_BAR, Math.floor(slot * BAR_FILL));
  const spacing = Math.max(0, slot - barWidth);

  return { barWidth, spacing, initialSpacing: spacing / 2 };
}

/**
 * Points spread across a line chart's plot area, first on its left edge
 * inset and last on its right.
 *
 * A line chart's total is `initialSpacing + spacing × (n - 1) +
 * endSpacing`, drawn to the right of the `yAxisLabelWidth` column. The plot
 * area is what is left of `width` after that column; the insets keep the
 * first and last data points from being clipped in half by the edges.
 */
export function lineLayout(
  width: number,
  count: number,
  labelWidth: number,
  inset: number,
) {
  const plot = Math.max(0, width - labelWidth);
  const spacing = count > 1 ? (plot - 2 * inset) / (count - 1) : 0;

  return { plot, spacing, initialSpacing: inset, endSpacing: inset };
}
