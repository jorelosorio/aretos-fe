import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

import { TamaguiProvider, useTheme } from '@tamagui/core';
import { config } from '../../tamagui.config';

import { ScreenLoader } from '@/components/common/screen-loader';
import { useSession, useSessionAutoRefresh } from '@/features/auth';
import { QueryProvider } from '@/providers/query-provider';

// Closes the auth popup left over from a redirect on web. No-op on native.
WebBrowser.maybeCompleteAuthSession();

// Held until we know whether there is a session, so the login screen never
// flashes in front of an already-signed-in user.
void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const theme = useTheme();
  const { isAuthenticated, isRestoring } = useSession();

  // Above the guard, so the timer survives navigation between groups.
  useSessionAutoRefresh();

  useEffect(() => {
    if (!isRestoring) void SplashScreen.hideAsync();
  }, [isRestoring]);

  if (isRestoring) return <ScreenLoader />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    >
      {/*
        Declarative guards: groups are mounted by session state rather than by
        an effect that redirects after render, so there is no window in which a
        protected screen is on screen without a session. A refresh that fails
        clears the store, which flips this on its own.
      */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <TamaguiProvider config={config} defaultTheme={scheme ?? 'light'}>
      <QueryProvider>
        <RootNavigator />
      </QueryProvider>
    </TamaguiProvider>
  );
}
