import { Button, H1, Paragraph, Spinner, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { BUTTON, TEXT } from '@/constants/layout';
import { useAuthErrorMessage, useSignIn } from '@/features/auth';
import { useTranslations } from '@/lib/i18n';

import { GoogleMark } from './google-mark';

/** The only way into the app. The flow itself lives in `useSignIn`. */
export function SignInForm() {
  const { t } = useTranslations();
  const { signIn, isSigningIn, error } = useSignIn('google');
  const toMessage = useAuthErrorMessage();

  return (
    <YStack gap="$6" width="100%" maxW={420}>
      <YStack gap="$2" items="center">
        <H1 fontFamily="$heading" color="$color">
          {t('auth.title')}
        </H1>
        <Paragraph size={TEXT.body} color="$mutedForeground" text="center">
          {t('auth.tagline')}
        </Paragraph>
      </YStack>

      <YStack gap="$3">
        <ErrorNotice message={toMessage(error)} />

        <Button
          size={BUTTON.primary}
          onPress={() => signIn()}
          disabled={isSigningIn}
          opacity={isSigningIn ? 0.7 : 1}
          bg="$card"
          color="$cardForeground"
          borderWidth={1}
          borderColor="$border"
          icon={
            isSigningIn ? <Spinner color="$mutedForeground" /> : <GoogleMark />
          }
        >
          {isSigningIn ? t('auth.signingIn') : t('auth.continueWithGoogle')}
        </Button>
      </YStack>
    </YStack>
  );
}
