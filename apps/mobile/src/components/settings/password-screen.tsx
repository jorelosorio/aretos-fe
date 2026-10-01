import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Paragraph } from 'tamagui';

import { CredentialField } from '@/components/auth/credential-field';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormScreen } from '@/components/common/form-screen';
import { HeaderTextButton } from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TEXT } from '@/constants/layout';
import { credentialError } from '@/features/auth/credentials';
import { useChangePassword, useProfile } from '@/features/user/hooks';
import { useTranslations } from '@/lib/i18n';

import { useAccountErrorMessage } from './account';

export function PasswordScreen() {
  const { data: profile } = useProfile();
  if (!profile) return <ScreenLoader />;
  return <PasswordForm hasPassword={profile.hasPassword} />;
}

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useTranslations();
  const router = useRouter();
  const change = useChangePassword();
  const toMessage = useAccountErrorMessage();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  const ready =
    (!hasPassword || credentialError('currentPassword', current) === null) &&
    credentialError('newPassword', next) === null;

  const save = () =>
    change.mutate(
      { currentPassword: hasPassword ? current : null, newPassword: next },
      { onSuccess: () => router.back() },
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: hasPassword
            ? t('account.password.changeRow')
            : t('account.password.setRow'),
          headerRight: () => (
            <HeaderTextButton
              label={t('account.save')}
              onPress={save}
              disabled={!ready}
              busy={change.isPending}
            />
          ),
        }}
      />

      <FormScreen>
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {hasPassword
            ? t('account.password.changeBody')
            : t('account.password.setBody')}
        </Paragraph>
        <ErrorNotice message={toMessage(change.error)} />
        {hasPassword && (
          <CredentialField
            rule="currentPassword"
            label={t('account.password.current')}
            value={current}
            onChange={setCurrent}
            autoFocus
          />
        )}
        <CredentialField
          rule="newPassword"
          label={t('account.password.new')}
          value={next}
          onChange={setNext}
          autoFocus={!hasPassword}
        />
      </FormScreen>
    </>
  );
}
