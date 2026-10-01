import { useState } from 'react';
import { Alert } from 'react-native';
import { Paragraph } from 'tamagui';

import { CredentialField } from '@/components/auth/credential-field';
import { SubmitButton } from '@/components/auth/submit-button';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormScreen } from '@/components/common/form-screen';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TEXT } from '@/constants/layout';
import { credentialError } from '@/features/auth/credentials';
import { useDeleteAccount, useProfile } from '@/features/user/hooks';
import { useTranslations } from '@/lib/i18n';

import { useAccountErrorMessage } from './account';

export function DeleteAccountScreen() {
  const { data: profile } = useProfile();
  if (!profile) return <ScreenLoader />;
  return <DeleteAccountForm hasPassword={profile.hasPassword} />;
}

function DeleteAccountForm({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useTranslations();
  const remove = useDeleteAccount();
  const toMessage = useAccountErrorMessage();
  const [password, setPassword] = useState('');

  const ready =
    !hasPassword || credentialError('currentPassword', password) === null;

  const confirm = () =>
    Alert.alert(
      t('account.delete.confirmTitle'),
      t('account.delete.confirmBody'),
      [
        { text: t('auth.cancel'), style: 'cancel' },
        {
          text: t('account.delete.action'),
          style: 'destructive',
          onPress: () => remove.mutate(hasPassword ? password : null),
        },
      ],
    );

  return (
    <FormScreen>
      <Paragraph size={TEXT.body} color="$mutedForeground">
        {t('account.delete.body')}
      </Paragraph>
      <ErrorNotice message={toMessage(remove.error)} />
      {hasPassword && (
        <CredentialField
          rule="currentPassword"
          label={t('account.delete.passwordLabel')}
          value={password}
          onChange={setPassword}
        />
      )}
      <SubmitButton
        label={t('account.delete.action')}
        destructive
        pending={remove.isPending}
        disabled={!ready}
        onPress={confirm}
      />
    </FormScreen>
  );
}
