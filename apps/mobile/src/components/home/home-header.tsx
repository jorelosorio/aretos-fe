import { Circle, Image, SizableText, XStack, YStack } from 'tamagui';

import { SPACING } from '@/constants/layout';
import { useProfile } from '@/features/user';
import { useTranslations } from '@/lib/i18n';

const AVATAR_SIZE = '$4';

function Avatar({ name, url }: { name: string; url: string | null }) {
  return (
    <Circle
      size={AVATAR_SIZE}
      items="center"
      justify="center"
      bg="$accentSurface"
      overflow="hidden"
    >
      {url === null ? (
        <SizableText
          size="$5"
          fontFamily="$heading"
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
  const { t } = useTranslations();
  const { data: profile } = useProfile();

  const name = profile?.name ?? '';

  return (
    <XStack items="center" gap={SPACING.items}>
      <Avatar name={name} url={profile?.avatarUrl ?? null} />

      <YStack flex={1} gap={SPACING.text}>
        <SizableText
          size="$6"
          fontFamily="$heading"
          color="$color"
          numberOfLines={1}
        >
          {name === '' ? t('home.welcomeBack') : t('home.greeting', { name })}
        </SizableText>

        {name !== '' && (
          <SizableText size="$2" color="$mutedForeground" numberOfLines={1}>
            {t('home.welcomeBack')}
          </SizableText>
        )}
      </YStack>
    </XStack>
  );
}
