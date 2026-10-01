import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Paragraph } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { TEXT } from '@/constants/layout';
import { credentialError } from '@/features/auth/credentials';
import {
  useAuthErrorMessage,
  useRequestPasswordReset,
} from '@/features/auth/hooks';
import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { CredentialField } from './credential-field';
import { SubmitButton } from './submit-button';
import { TextLink } from './text-link';
import { toSentParams } from './use-code-clock';

export function ForgotPasswordScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const request = useRequestPasswordReset();
  const toMessage = useAuthErrorMessage();

  const submit = () =>
    request.mutate(email, {
      onSuccess: (sent) =>
        router.push({
          pathname: '/reset-password',
          params: { email: email.trim(), ...toSentParams(sent) },
        }),
    });

  return (
    <AuthSheet title={t('auth.sheet.forgotTitle')}>
      <Paragraph size={TEXT.body} color="$mutedForeground">
        {t('auth.sheet.forgotBody')}
      </Paragraph>
      <CredentialField rule="email" value={email} onChange={setEmail} />
      <ErrorNotice message={toMessage(request.error)} />
      <SubmitButton
        label={t('auth.sheet.sendReset')}
        pending={request.isPending}
        disabled={credentialError('email', email) !== null}
        onPress={submit}
      />
      <TextLink
        label={t('auth.sheet.backToLogIn')}
        onPress={() => router.replace('/login')}
      />
    </AuthSheet>
  );
}
