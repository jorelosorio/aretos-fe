import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Paragraph } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { FormHint } from '@/components/common/form-section';
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
import { useResendCountdown } from './use-resend-countdown';

export function ResetPasswordScreen() {
  const { t } = useTranslations();
  const { email, resendAfter } = useLocalSearchParams<{
    email: string;
    resendAfter: string;
  }>();
  const [step, setStep] = useState<ResetStep>('code');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const reset = useResetPassword();
  const resend = useRequestPasswordReset();
  const { secondsLeft, restart } = useResendCountdown(Number(resendAfter));
  const toMessage = useAuthErrorMessage();

  const failedOn = reset.error ? resetStepFor(reset.error.code) : null;

  const sendAgain = () =>
    resend.mutate(email, {
      onSuccess: (sent) => {
        reset.reset();
        restart(sent.resend_after);
      },
    });

  const save = () =>
    reset.mutate(
      { email, code, password },
      { onError: (error) => setStep(resetStepFor(error.code)) },
    );

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
      <CodeField value={code} onChange={setCode} />
      <ErrorNotice
        message={
          failedOn === 'code' ? toMessage(reset.error) : toMessage(resend.error)
        }
      />
      <SubmitButton
        label={t('auth.sheet.continue')}
        disabled={codeError(code) !== null}
        onPress={() => setStep('password')}
      />
      {resend.isSuccess && secondsLeft > 0 && (
        <FormHint text="center">{t('auth.sheet.codeResent')}</FormHint>
      )}
      <TextLink
        lead={t('auth.sheet.noCode')}
        label={
          secondsLeft > 0
            ? t('auth.sheet.resendIn', { seconds: secondsLeft })
            : t('auth.sheet.resend')
        }
        disabled={secondsLeft > 0 || resend.isPending}
        onPress={sendAgain}
      />
    </AuthSheet>
  );
}
