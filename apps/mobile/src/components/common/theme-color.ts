/**
 * Turns a Tamagui colour token into the value the current theme gives it.
 *
 * Tamagui components take `"$chart1"` and resolve it themselves, but anything
 * drawing outside Tamagui does not: `react-native-svg` puts `stroke` straight
 * into the native view, where a literal `"$chart1"` is not a colour and the
 * shape silently renders black. So a token handed to an SVG has to be looked
 * up first, and it has to be looked up per render rather than frozen into a
 * constant, because light and dark give the same token two different values.
 */

import type { useTheme } from '@tamagui/core';

type Theme = ReturnType<typeof useTheme>;

/** The shape we actually read. The generated theme type is far wider. */
type Values = Record<string, { val?: unknown } | undefined>;

export function resolveColor(theme: Theme, token: string): string {
  const name = token.startsWith('$') ? token.slice(1) : token;
  const value = (theme as unknown as Values)[name]?.val;

  // A token with no entry is returned untouched: a caller passing a plain
  // `"#fff"` still works, and a genuinely missing token stays visible as a
  // broken colour rather than being quietly swapped for a plausible one.
  return typeof value === 'string' ? value : token;
}
