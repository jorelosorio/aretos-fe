import type { ReactNode } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@tamagui/core';

const KEYBOARD_GAP = 112;

export function FormScrollView({
  children,
  padBottom = true,
}: {
  children: ReactNode;
  padBottom?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.background.val }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: padBottom ? insets.bottom : 0,
      }}
      bottomOffset={KEYBOARD_GAP}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
