import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Paragraph } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { TEXT } from '@/constants/layout';
import { codeError } from '@/features/auth/credentials';
import { useAuthErrorMessage, useVerifyEmailCode } from '@/features/auth/hooks';
import { AuthErrorCode } from '@/features/auth/types';
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

  const submit = (full: string) => {
    if (verify.isPending) return;
    verify.mutate(
      { email, code: full },
      {
        onError: (error) => {
          if (error.code === AuthErrorCode.InvalidEmailCode) setCode('');
        },
      },
    );
  };

  const edit = (next: string) => {
    if (verify.isError) verify.reset();
    setCode(next);
  };

  return (
    <AuthSheet title={t('auth.sheet.codeTitle')}>
      <Paragraph size={TEXT.body} color="$mutedForeground">
        {t('auth.sheet.codeBody', { email })}
      </Paragraph>
      <CodeField
        value={code}
        onChange={edit}
        onComplete={submit}
        invalid={verify.error?.code === AuthErrorCode.InvalidEmailCode}
      />
      <ErrorNotice message={toMessage(verify.error)} />
      <SubmitButton
        label={t('auth.sheet.continue')}
        pending={verify.isPending}
        disabled={codeError(code) !== null}
        onPress={() => submit(code)}
      />
      <TextLink
        lead={t('auth.sheet.wrongEmail')}
        label={t('auth.sheet.goBack')}
        onPress={() => router.back()}
      />
    </AuthSheet>
  );
}
