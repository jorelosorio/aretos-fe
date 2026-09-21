import * as WebBrowser from 'expo-web-browser';
import { ExternalLink } from '@tamagui/lucide-icons-2';

import { ICON } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { CREDITS } from './credits';
import { RowGroup } from './row-group';

export function Attributions() {
  const { t } = useTranslations();

  return (
    <RowGroup
      title={t('settings.attributions')}
      rows={CREDITS.map((credit) => ({
        label: credit.label,
        onPress: () => void WebBrowser.openBrowserAsync(credit.url),
        trailing: <ExternalLink size={ICON.row} color="$mutedForeground" />,
      }))}
    />
  );
}
