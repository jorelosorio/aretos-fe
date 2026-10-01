import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';

import { CredentialField } from '@/components/auth/credential-field';
import { ErrorNotice } from '@/components/common/error-notice';
import { FormScreen } from '@/components/common/form-screen';
import { HeaderTextButton } from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import { useProfile, useUpdateProfile } from '@/features/user/hooks';
import type { Profile } from '@/features/user/types';
import { useTranslations } from '@/lib/i18n';

import { useAccountErrorMessage } from './account';

export function NameScreen() {
  const { data: profile } = useProfile();
  if (!profile) return <ScreenLoader />;
  return <NameForm profile={profile} />;
}

function NameForm({ profile }: { profile: Profile }) {
  const { t } = useTranslations();
  const router = useRouter();
  const update = useUpdateProfile();
  const toMessage = useAccountErrorMessage();
  const [name, setName] = useState(profile.displayName);

  const trimmed = name.trim();
  const ready = trimmed !== '' && trimmed !== profile.displayName;

  const save = () =>
    update.mutate({ displayName: trimmed }, { onSuccess: () => router.back() });

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderTextButton
              label={t('account.save')}
              onPress={save}
              disabled={!ready}
              busy={update.isPending}
            />
          ),
        }}
      />

      <FormScreen>
        <ErrorNotice message={toMessage(update.error)} />
        <CredentialField
          rule="name"
          value={name}
          onChange={setName}
          autoFocus
        />
      </FormScreen>
    </>
  );
}
