import { SizableText, XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/common/avatar';
import { SPACING, TEXT } from '@/constants/layout';
import { useProfile } from '@/features/user/hooks';
import { useTranslations } from '@/lib/i18n';

import { partOfDay } from './part-of-day';

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
