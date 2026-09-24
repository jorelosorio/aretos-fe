/**
 * The header every stack in the app draws, in one place.
 *
 * `screenOptions` do not cascade into a nested navigator: a stack mounted
 * inside another starts from React Navigation's defaults, white bar and
 * system font included. The check-in sheet is such a stack — it has to be,
 * so that picking a goal pushes the check-in inside the sheet instead of
 * replacing it — and without sharing these its header would be the one
 * screen in the app that looks borrowed.
 */

import { useTheme } from '@tamagui/core';

import { HEADER_TITLE } from '@/constants/layout';

export function useStackHeaderOptions() {
  const theme = useTheme();

  return {
    contentStyle: { backgroundColor: theme.background.val },
    headerStyle: { backgroundColor: theme.background.val },
    headerShadowVisible: false,
    headerTintColor: theme.color.val,
    headerTitleStyle: {
      fontFamily: HEADER_TITLE.fontFamily,
      fontSize: HEADER_TITLE.fontSize,
    },
  } as const;
}
