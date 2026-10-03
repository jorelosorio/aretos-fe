import { BadgeCheck } from '@tamagui/lucide-icons-2/icons/BadgeCheck';
import { SizableText, XStack } from 'tamagui';

import { ICON, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function AuthorLabel({
  name,
  official,
}: {
  name: string;
  official: boolean;
}) {
  const { t } = useTranslations();

  return (
    <XStack
      items="center"
      gap="$1"
      shrink={1}
      accessibilityLabel={official ? t('author.official', { name }) : name}
    >
      {official && <BadgeCheck size={ICON.inline} color="$primary" />}
      <SizableText
        size={TEXT.caption}
        fontWeight="600"
        color={official ? '$primary' : '$mutedForeground'}
        numberOfLines={1}
        shrink={1}
      >
        {name}
      </SizableText>
    </XStack>
  );
}
