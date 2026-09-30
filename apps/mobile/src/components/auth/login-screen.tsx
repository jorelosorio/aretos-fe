import { useState } from 'react';
import { useRouter } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { credentialError } from '@/features/auth/credentials';
import { useAuthErrorMessage, useLogInWithEmail } from '@/features/auth/hooks';
import { AuthErrorCode } from '@/features/auth/types';
import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { CredentialField } from './credential-field';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';
import { SubmitButton } from './submit-button';
import { TextLink } from './text-link';

export function LoginScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const logIn = useLogInWithEmail();
  const toMessage = useAuthErrorMessage();

  const needsCode = logIn.error?.code === AuthErrorCode.EmailNotVerified;
  const ready =
    credentialError('email', email) === null &&
    credentialError('currentPassword', password) === null;

  const submit = () =>
    logIn.mutate(
      { email, password },
      {
        onError: (error) => {
          if (error.code !== AuthErrorCode.EmailNotVerified) return;
          router.push({ pathname: '/verify', params: { email: email.trim() } });
        },
      },
    );

  return (
    <AuthSheet title={t('auth.sheet.logInTitle')}>
      <GoogleButton />
      <OrDivider />
      <CredentialField rule="email" value={email} onChange={setEmail} />
      <CredentialField
        rule="currentPassword"
        value={password}
        onChange={setPassword}
      />
      <TextLink
        label={t('auth.sheet.forgotLink')}
        onPress={() => router.replace('/forgot-password')}
      />
      <ErrorNotice message={needsCode ? null : toMessage(logIn.error)} />
      <SubmitButton
        label={t('auth.sheet.logIn')}
        pending={logIn.isPending}
        disabled={!ready}
        onPress={submit}
      />
      <TextLink
        lead={t('auth.sheet.noAccount')}
        label={t('auth.sheet.toSignUp')}
        onPress={() => router.replace('/signup')}
      />
    </AuthSheet>
  );
}
