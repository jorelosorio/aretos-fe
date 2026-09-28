import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { ComingSoonSubmit } from './coming-soon-submit';
import { CredentialField } from './credential-field';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';
import { TextLink } from './text-link';

export function SignupScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      <ComingSoonSubmit label={t('auth.sheet.signUp')} />
      <TextLink
        lead={t('auth.sheet.haveAccount')}
        label={t('auth.sheet.toLogIn')}
        onPress={() => router.replace('/login')}
      />
    </AuthSheet>
  );
}
