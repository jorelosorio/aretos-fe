import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';

import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';

import { ScreenLoader } from '@/components/common/screen-loader';
import { useStackHeaderOptions } from '@/components/common/stack-header';
import { useTranslations } from '@/lib/i18n';
import { useSession, useSessionAutoRefresh } from '@/features/auth';
import { usePreferences } from '@/lib/preferences';
import { NavigationThemeProvider } from '@/providers/navigation-theme-provider';
import { QueryProvider } from '@/providers/query-provider';

// Closes the auth popup left over from a redirect on web. No-op on native.
WebBrowser.maybeCompleteAuthSession();

// Held until we know whether there is a session, so the login screen never
// flashes in front of an already-signed-in user.
void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const headerOptions = useStackHeaderOptions();
  const { t } = useTranslations();
  const { isAuthenticated, isRestoring } = useSession();

  // Above the guard, so the timer survives navigation between groups.
  useSessionAutoRefresh();

  useEffect(() => {
    if (!isRestoring) void SplashScreen.hideAsync();
  }, [isRestoring]);

  if (isRestoring) return <ScreenLoader />;

  return (
    <Stack screenOptions={{ ...headerOptions, headerShown: false }}>
      {/*
        Declarative guards: groups are mounted by session state rather than by
        an effect that redirects after render, so there is no window in which a
        protected screen is on screen without a session. A refresh that fails
        clears the store, which flips this on its own.
      */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="goals/new"
          options={{ headerShown: true, title: t('goals.form.newTitle') }}
        />
        <Stack.Screen
          name="goals/[id]/index"
          options={{ headerShown: true, title: '' }}
        />
        <Stack.Screen
          name="goals/[id]/check-in"
          options={{ headerShown: true, title: '' }}
        />
        <Stack.Screen
          name="goals/[id]/edit"
          options={{ headerShown: true, title: t('goals.form.editTitle') }}
        />
        <Stack.Screen
          name="goals/[id]/habits/new"
          options={{ headerShown: true, title: t('habits.form.newTitle') }}
        />
        <Stack.Screen
          name="habits/[id]"
          options={{ headerShown: true, title: t('habits.form.editTitle') }}
        />

        <Stack.Screen
          name="diary/[id]"
          options={{ headerShown: true, title: '' }}
        />

        <Stack.Screen
          name="settings/licenses"
          options={{ headerShown: true, title: t('settings.licenses') }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const { theme } = usePreferences();

  // The stored preference is read synchronously at module load, so this is
  // already the right theme on the first paint — no flash of the device's.
  const resolved = theme === 'system' ? (scheme ?? 'light') : theme;

  return (
    <TamaguiProvider config={config} defaultTheme={resolved}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />

      <NavigationThemeProvider>
        <QueryProvider>
          <RootNavigator />
        </QueryProvider>
      </NavigationThemeProvider>
    </TamaguiProvider>
  );
}
