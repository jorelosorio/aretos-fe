import { Circle, Image, SizableText, XStack, YStack } from 'tamagui';

import { longDateLabel } from '@/components/common/date-label';
import { SPACING, TEXT } from '@/constants/layout';
import { todayKey } from '@/features/logs';
import { useProfile } from '@/features/user';
import { useTranslations } from '@/lib/i18n';

const AVATAR_SIZE = '$4';

function Avatar({ name, url }: { name: string; url: string }) {
  return (
    <Circle
      size={AVATAR_SIZE}
      items="center"
      justify="center"
      bg="$accentSurface"
      overflow="hidden"
    >
      {url === '' ? (
        <SizableText
          size={TEXT.heading}
          fontWeight="700"
          color="$accentSurfaceForeground"
        >
          {name.slice(0, 1).toUpperCase()}
        </SizableText>
      ) : (
        <Image
          source={{ uri: url }}
          width="100%"
          height="100%"
          accessibilityIgnoresInvertColors
        />
      )}
    </Circle>
  );
}

export function HomeHeader() {
  const { t, locale } = useTranslations();
  const { data: profile } = useProfile();

  const name = profile?.displayName ?? '';
  const initial = name || profile?.email || '';

  return (
    <XStack items="center" gap={SPACING.items}>
      <Avatar name={initial} url={profile?.avatarUrl ?? ''} />

      <YStack flex={1} gap={SPACING.text}>
        <SizableText
          size={TEXT.title}
          fontFamily="$heading"
          color="$color"
          numberOfLines={1}
        >
          {name === '' ? t('home.welcomeBack') : t('home.greeting', { name })}
        </SizableText>

        <SizableText
          size={TEXT.caption}
          color="$mutedForeground"
          numberOfLines={1}
        >
          {longDateLabel(todayKey(), locale)}
        </SizableText>
      </YStack>
    </XStack>
  );
}
