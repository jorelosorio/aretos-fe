import { useRouter } from 'expo-router';
import { ChevronRight } from '@tamagui/lucide-icons-2/icons/ChevronRight';
import { Languages } from '@tamagui/lucide-icons-2/icons/Languages';
import { Moon } from '@tamagui/lucide-icons-2/icons/Moon';
import { Smartphone } from '@tamagui/lucide-icons-2/icons/Smartphone';
import { Sun } from '@tamagui/lucide-icons-2/icons/Sun';
import { ScrollView, YStack } from 'tamagui';

import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { OptionGroup, type Option } from '@/components/common/option-group';
import { ProfileSummary } from '@/components/settings/profile-summary';
import { RowGroup } from '@/components/settings/row-group';
import { useProfile } from '@/features/user/hooks';
import { APP_LOCALES, useTranslations } from '@/lib/i18n';
import { SPACING } from '@/constants/layout';
import {
  setPreferences,
  usePreferences,
  type LocalePreference,
  type ThemePreference,
} from '@/lib/preferences';

const LOCALE_LABELS: Record<(typeof APP_LOCALES)[number], string> = {
  en: 'English',
  es: 'Español',
};

export function SettingsScreen() {
  const { t } = useTranslations();
  const { theme, locale } = usePreferences();
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const { data: profile } = useProfile();

  const themeOptions: readonly Option<ThemePreference>[] = [
    { value: 'light', label: t('settings.light'), Icon: Sun },
    { value: 'dark', label: t('settings.dark'), Icon: Moon },
    { value: 'system', label: t('settings.system'), Icon: Smartphone },
  ];

  const localeOptions: readonly Option<LocalePreference>[] = [
    ...APP_LOCALES.map((code) => ({
      value: code,
      label: LOCALE_LABELS[code],
      Icon: Languages,
    })),
    { value: 'system', label: t('settings.system'), Icon: Smartphone },
  ];

  return (
    <ScrollView
      flex={1}
      bg="$background"
      contentContainerStyle={{ grow: 1, pb: tabBarInset }}
    >
      <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
        {profile !== undefined && (
          <ProfileSummary
            profile={profile}
            onPress={() => router.push('/settings/profile')}
          />
        )}

        <OptionGroup
          title={t('settings.appearance')}
          options={themeOptions}
          value={theme}
          onChange={(value) => setPreferences({ theme: value })}
        />

        <OptionGroup
          title={t('settings.language')}
          options={localeOptions}
          value={locale}
          onChange={(value) => setPreferences({ locale: value })}
        />

        <RowGroup
          title={t('settings.legal')}
          rows={[
            {
              label: t('settings.licenses'),
              onPress: () => router.push('/settings/licenses'),
              Icon: ChevronRight,
            },
          ]}
        />
      </YStack>
    </ScrollView>
  );
}
