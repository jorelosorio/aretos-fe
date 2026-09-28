import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Paragraph } from 'tamagui';

import { TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { ComingSoonSubmit } from './coming-soon-submit';
import { CredentialField } from './credential-field';
import { TextLink } from './text-link';

export function ForgotPasswordScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <AuthSheet title={t('auth.sheet.forgotTitle')}>
      <Paragraph size={TEXT.body} color="$mutedForeground">
        {t('auth.sheet.forgotBody')}
      </Paragraph>
      <CredentialField rule="email" value={email} onChange={setEmail} />
      <ComingSoonSubmit label={t('auth.sheet.sendReset')} />
      <TextLink
        label={t('auth.sheet.backToLogIn')}
        onPress={() => router.replace('/login')}
      />
    </AuthSheet>
  );
}
