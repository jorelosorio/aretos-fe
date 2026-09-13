import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { TamaguiProvider, useTheme } from '@tamagui/core';
import { config } from '../../tamagui.config';

function RootStack() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    />
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <TamaguiProvider config={config} defaultTheme={scheme ?? 'light'}>
      <RootStack />
    </TamaguiProvider>
  );
}
