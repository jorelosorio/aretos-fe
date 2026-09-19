import { Languages, Moon, Smartphone, Sun } from '@tamagui/lucide-icons-2';
import { ScrollView, YStack } from 'tamagui';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { OptionGroup, type Option } from '@/components/common/option-group';
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
    <ScrollView flex={1} bg="$background" contentContainerStyle={{ grow: 1 }}>
      <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
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

        <YStack flex={1} minH="$6" />

        <SignOutButton />
      </YStack>
    </ScrollView>
  );
}
