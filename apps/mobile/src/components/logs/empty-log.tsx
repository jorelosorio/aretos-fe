import type { Check } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { EmptyArt } from '@/components/common/empty-art';
import type { Illustration } from '@/components/common/illustrations';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';

type IconComponent = typeof Check;

export function EmptyLog({
  Icon,
  illustration,
  title,
  body,
  action,
  actionIcon,
  onAction,
}: {
  Icon: IconComponent;
  illustration?: Illustration;
  title: string;
  body: string;
  action?: string;
  actionIcon?: IconComponent;
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
          <Button
            size={BUTTON.primary}
            theme="accent"
            icon={actionIcon}
            onPress={onAction}
          >
            {action}
          </Button>
        ) : null}
      </YStack>
    </YStack>
  );
}
