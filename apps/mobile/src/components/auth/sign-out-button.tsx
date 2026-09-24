import { Alert } from 'react-native';
import { LogOut } from '@tamagui/lucide-icons-2';
import { Button } from 'tamagui';

import { BUTTON, ICON } from '@/constants/layout';
import { useSignOut } from '@/features/auth';
import { useTranslations } from '@/lib/i18n';

/**
 * Confirms first — signing out is easy to hit by accident and costs a full
 * OAuth round trip to undo.
 *
 * Styled as the sign-in button's opposite number, card on border, and in the
 * ordinary text colour: signing out destroys nothing, so red here would only
 * spend the app's one alarm colour on a routine way out.
 */
export function SignOutButton() {
  const { t } = useTranslations();
  const { signOut, isSigningOut } = useSignOut();

  const confirm = () =>
    Alert.alert(t('auth.signOutConfirmTitle'), t('auth.signOutConfirmBody'), [
      { text: t('auth.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), onPress: () => signOut() },
    ]);

  return (
    <Button
      size={BUTTON.primary}
      onPress={confirm}
      disabled={isSigningOut}
      opacity={isSigningOut ? 0.7 : 1}
      bg="$card"
      color="$cardForeground"
      borderWidth={1}
      borderColor="$border"
      icon={<LogOut size={ICON.row} color="$mutedForeground" />}
      accessibilityLabel={t('auth.signOut')}
    >
      {isSigningOut ? t('auth.signingOut') : t('auth.signOut')}
    </Button>
  );
}
