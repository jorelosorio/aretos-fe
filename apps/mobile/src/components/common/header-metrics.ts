import { getDefaultHeaderHeight } from 'expo-router/react-navigation';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { HEADER_TITLE } from '@/constants/layout';

/**
 * The navigation header's own metrics, for a screen that draws its own header.
 *
 * Every tab but home shows the native header, so its title sits where the
 * platform puts it — 44pt on a portrait phone, 32 in landscape, 50 on iPad,
 * 64 on Android, each below the status bar. A screen that hides the header and
 * pads down from the safe area by hand lands somewhere else, and the greeting
 * on home sat higher than the titles beside it for exactly that reason.
 *
 * So ask the router for the same numbers its header uses rather than guess:
 *
 * - `height` is the whole band, status bar included — what the native header
 *   occupies, and what a hand-drawn one has to fill to line up with it.
 * - `statusBar` is the part of that band the status bar takes. It comes from
 *   the difference between the two calls rather than from `insets.top`
 *   because the header shaves a few points off the inset on a device with a
 *   Dynamic Island; subtracting keeps whatever correction it applied.
 * - `titleTop` is where the native title's line starts: its line centred in
 *   the bar. This, not the band's middle, is what a screen's own header aligns
 *   to. Centring the whole block instead reads as too high the moment it has a
 *   second line, because a subtitle drags the first line up by half its height
 *   — which is what put the greeting above "My Goals" next door.
 *
 * `modalPresentation` is false here: home is a tab, not a sheet.
 */
export function useHeaderMetrics() {
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();

  const height = getDefaultHeaderHeight(frame, false, insets.top);
  const bar = getDefaultHeaderHeight(frame, false, 0);
  const statusBar = height - bar;

  return {
    height,
    statusBar,
    titleTop: statusBar + (bar - HEADER_TITLE.lineHeight) / 2,
  };
}
