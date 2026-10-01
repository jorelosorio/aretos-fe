import { useEffect } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';

import { BrandSplash } from '@/components/brand/brand-splash';
import { fullSheetDetent } from '@/components/common/sheet-detents';
import { useStackHeaderOptions } from '@/components/common/stack-header';
import { SHEET } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';
import { useSession, useSessionAutoRefresh } from '@/features/auth/hooks';
import { usePreferences } from '@/lib/preferences';
import { DatabaseProvider } from '@/providers/database-provider';
import { NavigationThemeProvider } from '@/providers/navigation-theme-provider';
import { QueryProvider } from '@/providers/query-provider';

// Closes the auth popup left over from a redirect on web. No-op on native.
WebBrowser.maybeCompleteAuthSession();

// Held until we know whether there is a session, so the login screen never
// flashes in front of an already-signed-in user.
void SplashScreen.preventAutoHideAsync();

const AUTH_SHEET = {
  presentation: 'formSheet',
  sheetGrabberVisible: true,
  sheetCornerRadius: SHEET.radius,
} as const;

function RootNavigator() {
  const headerOptions = useStackHeaderOptions();
  const { t } = useTranslations();
  const { isAuthenticated, isRestoring } = useSession();
  const insets = useSafeAreaInsets();
  const frame = useSafeAreaFrame();
  const full =
    Platform.OS === 'android' ? fullSheetDetent(insets.top, frame.height) : 1;

  // Above the guard, so the timer survives navigation between groups.
  useSessionAutoRefresh();

  useEffect(() => {
    if (!isRestoring) void SplashScreen.hideAsync();
  }, [isRestoring]);

  if (isRestoring) return <BrandSplash />;

  return (
    <DatabaseProvider>
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
            name="guide"
            options={{
              headerShown: true,
              headerTransparent: true,
              headerStyle: { backgroundColor: 'transparent' },
            }}
          />

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
            name="goals/[id]/template"
            options={{
              headerShown: true,
              title: t('templates.form.fromGoalTitle'),
            }}
          />
          <Stack.Screen
            name="habits/[id]"
            options={{ headerShown: true, title: t('habits.form.editTitle') }}
          />

          <Stack.Screen
            name="templates/new"
            options={{ headerShown: true, title: t('templates.form.newTitle') }}
          />
          <Stack.Screen
            name="templates/[id]/index"
            options={{ headerShown: true, title: '' }}
          />
          <Stack.Screen
            name="templates/[id]/edit"
            options={{
              headerShown: true,
              title: t('templates.form.editTitle'),
            }}
          />

          <Stack.Screen
            name="diary/new"
            options={{ headerShown: true, title: t('diary.editor.newTitle') }}
          />
          <Stack.Screen
            name="diary/[id]/index"
            options={{ headerShown: true, title: '' }}
          />
          <Stack.Screen
            name="diary/[id]/edit"
            options={{ headerShown: true, title: t('diary.editor.editTitle') }}
          />

          <Stack.Screen
            name="settings/licenses"
            options={{ headerShown: true, title: t('settings.licenses') }}
          />
          <Stack.Screen
            name="settings/profile"
            options={{ headerShown: true, title: t('account.profile') }}
          />
          <Stack.Screen
            name="settings/name"
            options={{ headerShown: true, title: t('account.name.row') }}
          />
          <Stack.Screen
            name="settings/email"
            options={{ headerShown: true, title: t('account.email.row') }}
          />
          <Stack.Screen
            name="settings/password"
            options={{ headerShown: true, title: '' }}
          />
          <Stack.Screen
            name="settings/delete-account"
            options={{ headerShown: true, title: t('account.delete.row') }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="welcome" />
          <Stack.Screen
            name="login"
            options={{ ...AUTH_SHEET, sheetAllowedDetents: [full] }}
          />
          <Stack.Screen
            name="signup"
            options={{ ...AUTH_SHEET, sheetAllowedDetents: [full] }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{ ...AUTH_SHEET, sheetAllowedDetents: [0.6, full] }}
          />
          <Stack.Screen
            name="verify"
            options={{ ...AUTH_SHEET, sheetAllowedDetents: [full] }}
          />
          <Stack.Screen
            name="reset-password"
            options={{ ...AUTH_SHEET, sheetAllowedDetents: [full] }}
          />
        </Stack.Protected>
      </Stack>
    </DatabaseProvider>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const { theme } = usePreferences();

  // The stored preference is read synchronously at module load, so this is
  // already the right theme on the first paint — no flash of the device's.
  const resolved = theme === 'system' ? (scheme ?? 'light') : theme;

  useEffect(() => {
    Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
  }, [theme]);

  return (
    <TamaguiProvider config={config} defaultTheme={resolved}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />

      <KeyboardProvider>
        <NavigationThemeProvider>
          <QueryProvider>
            <RootNavigator />
          </QueryProvider>
        </NavigationThemeProvider>
      </KeyboardProvider>
    </TamaguiProvider>
  );
}
