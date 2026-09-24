/**
 * The header every stack in the app draws, in one place.
 *
 * `screenOptions` do not cascade into a nested navigator: a stack mounted
 * inside another starts from React Navigation's defaults, white bar and
 * system font included. Only the root stack exists today, but the Log flow
 * once mounted its own, and its header was the one screen in the app that
 * looked borrowed until it shared these. A hook rather than inline options,
 * so the next nested stack starts from the app's header and not the library's.
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
