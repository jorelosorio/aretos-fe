import { Button, Spinner, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { BUTTON, SPACING } from '@/constants/layout';
import { useAuthErrorMessage, useSignIn } from '@/features/auth/hooks';
import { useTranslations } from '@/lib/i18n';

import { GoogleMark } from './google-mark';

export function GoogleButton() {
  const { t } = useTranslations();
  const { signIn, isSigningIn, error } = useSignIn('google');
  const toMessage = useAuthErrorMessage();

  return (
    <YStack gap={SPACING.items}>
      <ErrorNotice message={toMessage(error)} />
      <Button
        size={BUTTON.primary}
        onPress={() => signIn()}
        disabled={isSigningIn}
        opacity={isSigningIn ? 0.7 : 1}
        bg="$card"
        color="$cardForeground"
        icon={
          isSigningIn ? <Spinner color="$mutedForeground" /> : <GoogleMark />
        }
      >
        {isSigningIn ? t('auth.signingIn') : t('auth.continueWithGoogle')}
      </Button>
    </YStack>
  );
}
