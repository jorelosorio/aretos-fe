/**
 * The tallest detent a native form sheet takes on Android, as a fraction of
 * the screen's height, chosen so the sheet never runs up under the status bar.
 *
 * react-native-screens keeps a sheet clear of the status bar only while its
 * window-insets listener is the one installed on the decor view. A view keeps
 * a single listener, and `KeyboardProvider` installs its own there whenever it
 * re-applies insets — on a configuration change such as switching between
 * light and dark, and on every JS reload — so from then on a detent of `1`
 * reaches the top edge of the screen. Taking the status bar's height off the
 * detent keeps the sheet's top edge clear of it in both states: at the status
 * bar's bottom edge while the listener is replaced, one status-bar height
 * lower while it is not.
 *
 * iOS form sheets keep clear of the status bar on their own and use `1`.
 */
export function fullSheetDetent(statusBar: number, height: number): number {
  if (height <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - statusBar / height));
}
