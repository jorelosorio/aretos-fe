import { Alert } from 'react-native';
import { LogOut } from '@tamagui/lucide-icons-2';
import { Button } from 'tamagui';

import { useSignOut } from '@/features/auth';
import { useTranslations } from '@/lib/i18n';

/**
 * Confirms first — signing out is easy to hit by accident and costs a full
 * OAuth round trip to undo.
 *
 * Styled as the sign-in button's opposite number: same card-on-border shape,
 * destructive colouring on the label and icon rather than a filled red block,
 * which would pull the eye to the one thing on the screen nobody came for.
 */
export function SignOutButton() {
  const { t } = useTranslations();
  const { signOut, isSigningOut } = useSignOut();

  const confirm = () =>
    Alert.alert(t('auth.signOutConfirmTitle'), t('auth.signOutConfirmBody'), [
      { text: t('auth.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);

  return (
    <Button
      size="$5"
      onPress={confirm}
      disabled={isSigningOut}
      opacity={isSigningOut ? 0.7 : 1}
      bg="$card"
      color="$destructive"
      borderWidth={1}
      borderColor="$border"
      icon={<LogOut size={18} color="$destructive" />}
      accessibilityLabel={t('auth.signOut')}
    >
      {isSigningOut ? t('auth.signingOut') : t('auth.signOut')}
    </Button>
  );
}
