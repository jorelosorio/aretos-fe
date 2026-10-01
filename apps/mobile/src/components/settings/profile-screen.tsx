import { useRouter } from 'expo-router';
import { ChevronRight } from '@tamagui/lucide-icons-2/icons/ChevronRight';
import { LogOut } from '@tamagui/lucide-icons-2/icons/LogOut';
import { ScrollView, YStack } from 'tamagui';

import { useConfirmSignOut } from '@/components/auth/use-confirm-sign-out';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SPACING } from '@/constants/layout';
import { useProfile } from '@/features/user/hooks';
import { useTranslations } from '@/lib/i18n';

import { PlanRow } from './plan-chip';
import { RowGroup } from './row-group';

export function ProfileScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const { data: profile } = useProfile();
  const { confirm: confirmSignOut, isSigningOut } = useConfirmSignOut();

  if (!profile) return <ScreenLoader />;

  return (
    <ScrollView flex={1} bg="$background">
      <YStack p={SPACING.screen} gap={SPACING.section}>
        <RowGroup
          title={t('account.details')}
          rows={[
            {
              label: t('account.name.row'),
              hint: profile.displayName || undefined,
              onPress: () => router.push('/settings/name'),
              Icon: ChevronRight,
            },
            {
              label: t('account.email.row'),
              hint: profile.email,
              onPress: () => router.push('/settings/email'),
              Icon: ChevronRight,
            },
            {
              label: profile.hasPassword
                ? t('account.password.changeRow')
                : t('account.password.setRow'),
              onPress: () => router.push('/settings/password'),
              Icon: ChevronRight,
            },
          ]}
        >
          <PlanRow tier={profile.tier} />
        </RowGroup>

        <RowGroup
          title={t('settings.account')}
          rows={[
            {
              label: isSigningOut ? t('auth.signingOut') : t('auth.signOut'),
              onPress: confirmSignOut,
              disabled: isSigningOut,
              Icon: LogOut,
              busy: isSigningOut,
            },
            {
              label: t('account.delete.row'),
              onPress: () => router.push('/settings/delete-account'),
              Icon: ChevronRight,
              destructive: true,
            },
          ]}
        />
      </YStack>
    </ScrollView>
  );
}
