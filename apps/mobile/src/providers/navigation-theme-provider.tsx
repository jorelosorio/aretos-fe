import { useEffect, useMemo, type ReactNode } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { useTheme, useThemeName } from '@tamagui/core';

export function NavigationThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const dark = useThemeName().startsWith('dark');

  const background = theme.background.val;
  const text = theme.color.val;
  const border = theme.border.val;
  const primary = theme.primary.val;

  const value = useMemo<Theme>(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark,
      colors: {
        ...base.colors,
        background,
        card: background,
        text,
        border,
        primary,
      },
    };
  }, [dark, background, text, border, primary]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(background);
  }, [background]);

  return <ThemeProvider value={value}>{children}</ThemeProvider>;
}
