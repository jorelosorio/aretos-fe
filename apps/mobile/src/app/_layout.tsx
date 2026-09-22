import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';

import { TamaguiProvider, useTheme } from '@tamagui/core';
import { config } from '../../tamagui.config';

import { CloseButton } from '@/components/common/close-button';
import { ScreenLoader } from '@/components/common/screen-loader';
import { HEADER_TITLE } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';
import { useSession, useSessionAutoRefresh } from '@/features/auth';
import { usePreferences } from '@/lib/preferences';
import { QueryProvider } from '@/providers/query-provider';

// Closes the auth popup left over from a redirect on web. No-op on native.
WebBrowser.maybeCompleteAuthSession();

// Held until we know whether there is a session, so the login screen never
// flashes in front of an already-signed-in user.
void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const theme = useTheme();
  const { t } = useTranslations();
  const { isAuthenticated, isRestoring } = useSession();

  // Above the guard, so the timer survives navigation between groups.
  useSessionAutoRefresh();

  useEffect(() => {
    if (!isRestoring) void SplashScreen.hideAsync();
  }, [isRestoring]);

  if (isRestoring) return <ScreenLoader />;

  const modalOptions = { presentation: 'modal', headerShown: true } as const;

  const sheetOptions = {
    ...modalOptions,
    animation: 'slide_from_bottom',
    headerBackVisible: false,
    headerLeft: () => null,
    headerRight: () => <CloseButton />,
  } as const;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
        headerStyle: { backgroundColor: theme.background.val },
        headerShadowVisible: false,
        headerTintColor: theme.color.val,
        headerTitleStyle: {
          fontFamily: HEADER_TITLE.fontFamily,
          fontSize: HEADER_TITLE.fontSize,
        },
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

        <Stack.Screen
          name="goals/new"
          options={{ ...modalOptions, title: t('goals.form.newTitle') }}
        />
        <Stack.Screen name="goals/[id]/index" options={{ headerShown: true }} />
        <Stack.Screen
          name="goals/[id]/edit"
          options={{ ...modalOptions, title: t('goals.form.editTitle') }}
        />
        <Stack.Screen
          name="goals/[id]/habits/new"
          options={{ ...modalOptions, title: t('habits.form.newTitle') }}
        />
        <Stack.Screen
          name="habits/[id]"
          options={{ ...modalOptions, title: t('habits.form.editTitle') }}
        />

        <Stack.Screen
          name="settings/licenses"
          options={{ headerShown: true, title: t('settings.licenses') }}
        />

        <Stack.Screen
          name="logs/new"
          options={{ ...sheetOptions, title: t('logs.pickTitle') }}
        />
        <Stack.Screen name="logs/[goalId]" options={sheetOptions} />
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

      <QueryProvider>
        <RootNavigator />
      </QueryProvider>
    </TamaguiProvider>
  );
}
