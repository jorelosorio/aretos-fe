import { Alert } from 'react-native';
import { LogOut } from '@tamagui/lucide-icons-2';
import { Button } from 'tamagui';

import { useSignOut } from '@/features/auth';
import { useTranslations } from '@/lib/i18n';

/**
 * Confirms first — signing out is easy to hit by accident and costs a full
 * OAuth round trip to undo.
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
      size="$3"
      chromeless
      onPress={confirm}
      disabled={isSigningOut}
      icon={<LogOut size={18} color="$mutedForeground" />}
      accessibilityLabel={t('auth.signOut')}
    />
  );
}
