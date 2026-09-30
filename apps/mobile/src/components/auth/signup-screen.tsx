import { useState } from 'react';
import { useRouter } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { credentialError } from '@/features/auth/credentials';
import {
  useAuthErrorMessage,
  useRegisterWithEmail,
} from '@/features/auth/hooks';
import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { CredentialField } from './credential-field';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';
import { SubmitButton } from './submit-button';
import { TextLink } from './text-link';

export function SignupScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegisterWithEmail();
  const toMessage = useAuthErrorMessage();

  const ready =
    credentialError('name', name) === null &&
    credentialError('email', email) === null &&
    credentialError('newPassword', password) === null;

  const submit = () =>
    register.mutate(
      { name, email, password },
      {
        onSuccess: () =>
          router.push({
            pathname: '/verify',
            params: { email: email.trim() },
          }),
      },
    );

  return (
    <AuthSheet title={t('auth.sheet.signUpTitle')}>
      <GoogleButton />
      <OrDivider />
      <CredentialField rule="name" value={name} onChange={setName} />
      <CredentialField rule="email" value={email} onChange={setEmail} />
      <CredentialField
        rule="newPassword"
        value={password}
        onChange={setPassword}
      />
      <ErrorNotice message={toMessage(register.error)} />
      <SubmitButton
        label={t('auth.sheet.signUp')}
        pending={register.isPending}
        disabled={!ready}
        onPress={submit}
      />
      <TextLink
        lead={t('auth.sheet.haveAccount')}
        label={t('auth.sheet.toLogIn')}
        onPress={() => router.replace('/login')}
      />
    </AuthSheet>
  );
}
