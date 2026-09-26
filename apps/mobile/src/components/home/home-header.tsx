import { Image, SizableText, Square, XStack, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';
import { useProfile } from '@/features/user';
import { useTranslations } from '@/lib/i18n';

import { partOfDay } from './part-of-day';

const AVATAR_SIZE = '$5';

function Avatar({ name, url }: { name: string; url: string }) {
  return (
    <Square
      size={AVATAR_SIZE}
      rounded="$xl2"
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
    </Square>
  );
}

export function HomeHeader() {
  const { t } = useTranslations();
  const { data: profile } = useProfile();

  const name = profile?.displayName ?? '';
  const initial = name || profile?.email || '';
  const greeting = t(`home.greeting.${partOfDay(new Date())}`);

  return (
    <XStack items="center" gap={SPACING.items}>
      <Avatar name={initial} url={profile?.avatarUrl ?? ''} />

      <YStack flex={1} minW={0} gap={SPACING.text}>
        <SizableText
          size={TEXT.subheading}
          fontWeight="700"
          color="$color"
          numberOfLines={1}
        >
          {name === '' ? greeting : name}
        </SizableText>

        {name !== '' && (
          <SizableText
            size={TEXT.caption}
            color="$mutedForeground"
            numberOfLines={1}
          >
            {greeting}
          </SizableText>
        )}
      </YStack>
    </XStack>
  );
}
