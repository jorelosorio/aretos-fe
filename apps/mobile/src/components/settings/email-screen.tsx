import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Paragraph } from 'tamagui';

import { CodeField } from '@/components/auth/code-field';
import { CredentialField } from '@/components/auth/credential-field';
import { TextLink } from '@/components/auth/text-link';
import {
  formatWait,
  useResendCountdown,
} from '@/components/auth/use-resend-countdown';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormScreen } from '@/components/common/form-screen';
import { HeaderTextButton } from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TEXT } from '@/constants/layout';
import { codeError, credentialError } from '@/features/auth/credentials';
import { AuthErrorCode } from '@/features/auth/types';
import {
  useConfirmEmailChange,
  useProfile,
  useRequestEmailChange,
} from '@/features/user/hooks';
import type { Profile } from '@/features/user/types';
import { useTranslations } from '@/lib/i18n';

import { useAccountErrorMessage } from './account';

export function EmailScreen() {
  const { data: profile } = useProfile();
  if (!profile) return <ScreenLoader />;
  return <EmailForm profile={profile} />;
}

function EmailForm({ profile }: { profile: Profile }) {
  const { t } = useTranslations();
  const router = useRouter();
  const request = useRequestEmailChange();
  const confirm = useConfirmEmailChange();
  const toMessage = useAccountErrorMessage();
  const { secondsLeft, restart } = useResendCountdown(0);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const same = email.trim().toLowerCase() === profile.email.toLowerCase();
  const ready =
    credentialError('email', email) === null &&
    !same &&
    (!profile.hasPassword ||
      credentialError('currentPassword', password) === null);

  const send = () =>
    request.mutate(
      { email, password: profile.hasPassword ? password : null },
      {
        onSuccess: (sent) => {
          restart(sent.resend_after);
          confirm.reset();
          setCode('');
          setStep('code');
        },
      },
    );

  const submit = (full: string) => {
    if (confirm.isPending) return;
    confirm.mutate(full, {
      onSuccess: () => router.back(),
      onError: (error) => {
        if (error.code === AuthErrorCode.InvalidEmailCode) setCode('');
      },
    });
  };

  const editCode = (next: string) => {
    if (confirm.isError) confirm.reset();
    setCode(next);
  };

  if (step === 'code') {
    return (
      <>
        <Stack.Screen
          options={{
            headerRight: () => (
              <HeaderTextButton
                label={t('account.email.confirm')}
                onPress={() => submit(code)}
                disabled={codeError(code) !== null}
                busy={confirm.isPending}
              />
            ),
          }}
        />

        <FormScreen>
          <Paragraph size={TEXT.body} color="$mutedForeground">
            {t('auth.sheet.codeBody', { email: email.trim() })}
          </Paragraph>
          <CodeField
            value={code}
            onChange={editCode}
            onComplete={submit}
            invalid={confirm.error?.code === AuthErrorCode.InvalidEmailCode}
          />
          <ErrorNotice
            message={toMessage(confirm.error) ?? toMessage(request.error)}
          />
          <TextLink
            lead={t('auth.sheet.noCode')}
            label={
              secondsLeft > 0
                ? t('auth.sheet.resendIn', { time: formatWait(secondsLeft) })
                : t('auth.sheet.resend')
            }
            disabled={secondsLeft > 0 || request.isPending}
            onPress={send}
          />
          <TextLink
            label={t('account.email.differentAddress')}
            onPress={() => setStep('email')}
          />
        </FormScreen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderTextButton
              label={t('account.email.sendCode')}
              onPress={send}
              disabled={!ready}
              busy={request.isPending}
            />
          ),
        }}
      />

      <FormScreen>
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {t('account.email.body', { email: profile.email })}
        </Paragraph>
        <ErrorNotice message={toMessage(request.error)} />
        <CredentialField
          rule="email"
          label={t('account.email.new')}
          value={email}
          onChange={setEmail}
          error={same ? t('account.email.same') : undefined}
          autoFocus
        />
        {profile.hasPassword && (
          <CredentialField
            rule="currentPassword"
            label={t('account.password.current')}
            value={password}
            onChange={setPassword}
          />
        )}
      </FormScreen>
    </>
  );
}
