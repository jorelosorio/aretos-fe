import { Alert } from 'react-native';

import { useSignOut } from '@/features/auth';
import { useTranslations } from '@/lib/i18n';

/**
 * Sign-out behind a confirmation, for whatever control offers it.
 *
 * Confirms first — signing out is easy to hit by accident and costs a full
 * OAuth round trip to undo. The dialog's action is not `destructive`:
 * signing out destroys nothing, so red here would only spend the app's one
 * alarm colour on a routine way out.
 *
 * A hook rather than a button because Settings shows it as a row in its own
 * section, like every other setting. It used to be a standalone button
 * floating below the last group, the one control on the screen that did not
 * sit in a section.
 */
export function useConfirmSignOut() {
  const { t } = useTranslations();
  const { signOut, isSigningOut } = useSignOut();

  const confirm = () =>
    Alert.alert(t('auth.signOutConfirmTitle'), t('auth.signOutConfirmBody'), [
      { text: t('auth.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), onPress: () => signOut() },
    ]);

  return { confirm, isSigningOut };
}
