import { Easing } from 'react-native-reanimated';

/**
 * How a sheet slides in and out, shared by the bottom and full-screen sheets
 * so every sheet in the app moves the same way.
 *
 * Entering eases out over a longer run, so the sheet settles rather than
 * lands; leaving eases in and is quicker, so a dismissed sheet gets out of
 * the way instead of lingering over the screen it uncovers.
 */
export const SHEET_ENTER = {
  duration: 420,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};

export const SHEET_EXIT = {
  duration: 260,
  easing: Easing.bezier(0.32, 0, 0.67, 0),
};
