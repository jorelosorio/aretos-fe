import { SizableText, XStack } from 'tamagui';

import { TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function TagChips({
  tags,
  max,
  onPress,
}: {
  tags: readonly string[];
  max?: number;
  onPress?: (tag: string) => void;
}) {
  const { t } = useTranslations();

  if (tags.length === 0) return null;

  const shown = max === undefined ? tags : tags.slice(0, max);
  const hidden = tags.length - shown.length;

  return (
    <XStack flexWrap="wrap" items="center" gap="$1.5">
      {shown.map((tag) => (
        <XStack
          key={tag}
          px="$2"
          py="$1"
          rounded={999}
          bg="$muted"
          onPress={onPress === undefined ? undefined : () => onPress(tag)}
          pressStyle={onPress === undefined ? undefined : { opacity: 0.7 }}
          accessibilityRole={onPress === undefined ? 'text' : 'button'}
          accessibilityLabel={
            onPress === undefined ? tag : t('tags.filterBy', { name: tag })
          }
        >
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {tag}
          </SizableText>
        </XStack>
      ))}

      {hidden > 0 && (
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t('diary.entry.more', { count: hidden })}
        </SizableText>
      )}
    </XStack>
  );
}
