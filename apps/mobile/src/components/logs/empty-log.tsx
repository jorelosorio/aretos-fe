import type { ImageSourcePropType } from 'react-native';
import type { Check } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { EmptyArt } from '@/components/common/empty-art';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';

type IconComponent = typeof Check;

export function EmptyLog({
  Icon,
  illustration,
  title,
  body,
  action,
  onAction,
}: {
  Icon: IconComponent;
  illustration?: ImageSourcePropType;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <YStack flex={1} p={SPACING.screen} bg="$background">
      <YStack
        flex={1}
        items="center"
        justify="center"
        gap={SPACING.section}
        p={SPACING.section}
      >
        <EmptyArt Icon={Icon} illustration={illustration} />

        <YStack gap={SPACING.group} items="center">
          <SizableText
            size={TEXT.title}
            fontWeight="700"
            color="$color"
            text="center"
          >
            {title}
          </SizableText>
          <Paragraph size={TEXT.body} color="$mutedForeground" text="center">
            {body}
          </Paragraph>
        </YStack>

        {action && onAction ? (
          <Button size={BUTTON.primary} theme="accent" onPress={onAction}>
            {action}
          </Button>
        ) : null}
      </YStack>
    </YStack>
  );
}
