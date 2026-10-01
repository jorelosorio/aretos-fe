import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Paragraph } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { TEXT } from '@/constants/layout';
import { codeError, credentialError } from '@/features/auth/credentials';
import {
  useAuthErrorMessage,
  useRequestPasswordReset,
  useResetPassword,
} from '@/features/auth/hooks';
import { useTranslations } from '@/lib/i18n';

import { AuthSheet } from './auth-sheet';
import { CodeField } from './code-field';
import { CredentialField } from './credential-field';
import { resetStepFor, type ResetStep } from './reset-steps';
import { SubmitButton } from './submit-button';
import { TextLink } from './text-link';
import { fromSentParams, useCodeClock, type SentParams } from './use-code-clock';

export function ResetPasswordScreen() {
  const { t } = useTranslations();
  const { email, ...sent } = useLocalSearchParams<
    { email: string } & SentParams
  >();
  const [step, setStep] = useState<ResetStep>('code');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const reset = useResetPassword();
  const resend = useRequestPasswordReset();
  const { expiresIn, resendIn, restart } = useCodeClock(fromSentParams(sent));
  const toMessage = useAuthErrorMessage();

  const failedOn = reset.error ? resetStepFor(reset.error.code) : null;

  const sendAgain = () =>
    resend.mutate(email, {
      onSuccess: (next) => {
        reset.reset();
        setCode('');
        restart(next);
      },
    });

  const save = () =>
    reset.mutate(
      { email, code, password },
      {
        onError: (error) => {
          const back = resetStepFor(error.code);
          if (back === 'code') setCode('');
          setStep(back);
        },
      },
    );

  const editCode = (next: string) => {
    if (failedOn === 'code') reset.reset();
    setCode(next);
  };

  if (step === 'password') {
    return (
      <AuthSheet title={t('auth.sheet.newPasswordTitle')}>
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {t('auth.sheet.newPasswordBody')}
        </Paragraph>
        <CredentialField
          rule="newPassword"
          value={password}
          onChange={setPassword}
        />
        <ErrorNotice
          message={failedOn === 'password' ? toMessage(reset.error) : null}
        />
        <SubmitButton
          label={t('auth.sheet.savePassword')}
          pending={reset.isPending}
          disabled={credentialError('newPassword', password) !== null}
          onPress={save}
        />
        <TextLink
          label={t('auth.sheet.changeCode')}
          onPress={() => setStep('code')}
        />
      </AuthSheet>
    );
  }

  return (
    <AuthSheet title={t('auth.sheet.codeTitle')}>
      <Paragraph size={TEXT.body} color="$mutedForeground">
        {t('auth.sheet.codeBody', { email })}
      </Paragraph>
      <CodeField
        value={code}
        onChange={editCode}
        onComplete={() => setStep('password')}
        invalid={failedOn === 'code'}
        expiresIn={expiresIn}
      />
      <ErrorNotice
        message={
          failedOn === 'code' ? toMessage(reset.error) : toMessage(resend.error)
        }
      />
      <SubmitButton
        label={t('auth.sheet.continue')}
        disabled={codeError(code) !== null || expiresIn === 0}
        onPress={() => setStep('password')}
      />
      <TextLink
        lead={
          resend.isSuccess && resendIn > 0
            ? t('auth.sheet.codeResent')
            : t('auth.sheet.noCode')
        }
        label={t('auth.sheet.resend')}
        disabled={resendIn > 0 || resend.isPending}
        onPress={sendAgain}
      />
    </AuthSheet>
  );
}
