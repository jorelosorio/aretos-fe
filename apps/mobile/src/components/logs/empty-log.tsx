import type { Check } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { SPACING } from '@/constants/layout';

type IconComponent = typeof Check;

export function EmptyLog({
  Icon,
  title,
  body,
  action,
  onAction,
}: {
  Icon: IconComponent;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      gap={SPACING.items}
      p={SPACING.screen}
      bg="$background"
    >
      <YStack
        width={56}
        height={56}
        items="center"
        justify="center"
        rounded="$xl2"
        bg="$muted"
      >
        <Icon size={24} color="$primary" />
      </YStack>

      <SizableText size="$6" fontFamily="$heading" color="$color" text="center">
        {title}
      </SizableText>

      <Paragraph size="$3" color="$mutedForeground" text="center">
        {body}
      </Paragraph>

      <Button size="$5" theme="accent" onPress={onAction} mt={SPACING.group}>
        {action}
      </Button>
    </YStack>
  );
}
