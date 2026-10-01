import { Alert } from 'react-native';

import { useSignOut } from '@/features/auth/hooks';
import { useUnsyncedNoteCount } from '@/features/diary/hooks';
import { useTranslations } from '@/lib/i18n';

/**
 * Sign-out behind a confirmation, for whatever control offers it.
 *
 * Confirms first — signing out is easy to hit by accident and costs a full
 * OAuth round trip to undo. Ordinarily the dialog's action is not
 * `destructive`: signing out destroys nothing, so red there would only spend
 * the app's one alarm colour on a routine way out.
 *
 * Except when notes written on this device have not reached the server yet.
 * Signing out deletes the device's copy of the diary, so those changes would
 * be lost: then the dialog says so, and the action is red.
 *
 * A hook rather than a button because Settings shows it as a row in its own
 * section, like every other setting, and any other screen that offers
 * sign-out gets the same confirmation from here.
 */
export function useConfirmSignOut() {
  const { t } = useTranslations();
  const { signOut, isSigningOut } = useSignOut();
  const pending = useUnsyncedNoteCount();

  const confirm = () =>
    Alert.alert(
      t('auth.signOutConfirmTitle'),
      pending === 0
        ? t('auth.signOutConfirmBody')
        : t(
            pending === 1
              ? 'auth.signOutPendingOne'
              : 'auth.signOutPendingMany',
            { count: pending },
          ),
      [
        { text: t('auth.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: pending === 0 ? 'default' : 'destructive',
          onPress: () => signOut(),
        },
      ],
    );

  return { confirm, isSigningOut };
}
