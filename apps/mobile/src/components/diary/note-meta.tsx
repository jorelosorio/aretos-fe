import { SizableText, YStack } from 'tamagui';

import { TagChips } from '@/components/tags/tag-chips';
import { SPACING, TEXT } from '@/constants/layout';

const COLLAPSED_TAGS = 3;

export function NoteMeta({
  caption,
  captionTone = '$mutedForeground',
  tags,
  collapsed = false,
  onTagPress,
}: {
  caption: string;
  captionTone?: '$mutedForeground' | '$destructive';
  tags: readonly string[];
  collapsed?: boolean;
  onTagPress?: (tag: string) => void;
}) {
  return (
    <YStack gap={SPACING.group}>
      <SizableText
        size={TEXT.caption}
        color={captionTone}
        numberOfLines={collapsed ? 1 : undefined}
      >
        {caption}
      </SizableText>
      <TagChips
        tags={tags}
        max={collapsed ? COLLAPSED_TAGS : undefined}
        onPress={onTagPress}
      />
    </YStack>
  );
}
