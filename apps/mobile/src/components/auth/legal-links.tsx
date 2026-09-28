import * as WebBrowser from 'expo-web-browser';
import { SizableText } from 'tamagui';

import { TEXT } from '@/constants/layout';
import { env } from '@/lib/env';
import { useTranslations } from '@/lib/i18n';

function open(path: '/terms' | '/privacy') {
  void WebBrowser.openBrowserAsync(`${env.webUrl}${path}`);
}

export function LegalLinks() {
  const { t } = useTranslations();

  return (
    <SizableText size={TEXT.caption} color="$mutedForeground">
      {t('auth.legal.before')}
      <SizableText
        size={TEXT.caption}
        color="$mutedForeground"
        textDecorationLine="underline"
        onPress={() => open('/terms')}
        accessibilityRole="link"
      >
        {t('auth.legal.terms')}
      </SizableText>
      {t('auth.legal.and')}
      <SizableText
        size={TEXT.caption}
        color="$mutedForeground"
        textDecorationLine="underline"
        onPress={() => open('/privacy')}
        accessibilityRole="link"
      >
        {t('auth.legal.privacy')}
      </SizableText>
      {t('auth.legal.after')}
    </SizableText>
  );
}
