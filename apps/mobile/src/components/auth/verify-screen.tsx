import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Paragraph } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { TEXT } from '@/constants/layout';
import { codeError } from '@/features/auth/credentials';
import { useAuthErrorMessage, useVerifyEmailCode } from '@/features/auth/hooks';
import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { CodeField } from './code-field';
import { SubmitButton } from './submit-button';
import { TextLink } from './text-link';

export function VerifyScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const verify = useVerifyEmailCode();
  const toMessage = useAuthErrorMessage();

  return (
    <AuthSheet title={t('auth.sheet.codeTitle')}>
      <Paragraph size={TEXT.body} color="$mutedForeground">
        {t('auth.sheet.codeBody', { email })}
      </Paragraph>
      <CodeField value={code} onChange={setCode} />
      <ErrorNotice message={toMessage(verify.error)} />
      <SubmitButton
        label={t('auth.sheet.continue')}
        pending={verify.isPending}
        disabled={codeError(code) !== null}
        onPress={() => verify.mutate({ email, code })}
      />
      <TextLink
        lead={t('auth.sheet.noCodeOrWrongEmail')}
        label={t('auth.sheet.goBack')}
        onPress={() => router.back()}
      />
    </AuthSheet>
  );
}
