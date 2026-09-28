import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { ComingSoonSubmit } from './coming-soon-submit';
import { CredentialField } from './credential-field';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';
import { TextLink } from './text-link';

export function LoginScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      <ComingSoonSubmit label={t('auth.sheet.logIn')} />
      <TextLink
        lead={t('auth.sheet.noAccount')}
        label={t('auth.sheet.toSignUp')}
        onPress={() => router.replace('/signup')}
      />
    </AuthSheet>
  );
}
