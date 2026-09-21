import type { ReactNode } from 'react';
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
  disabled = false,
  notice,
}: {
  Icon: IconComponent;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
  disabled?: boolean;
  notice?: ReactNode;
}) {
  return (
    <YStack flex={1} p={SPACING.screen} bg="$background">
      {notice ? <YStack pb={SPACING.section}>{notice}</YStack> : null}

      <YStack
        flex={1}
        items="center"
        justify="center"
        gap={SPACING.section}
        p={SPACING.section}
        bg="$card"
        rounded="$xl2"
        borderWidth={1}
        borderColor="$border"
      >
        <Icon size={32} color="$primary" />

        <YStack gap={SPACING.group} items="center">
          <SizableText
            size="$6"
            fontFamily="$heading"
            color="$cardForeground"
            text="center"
          >
            {title}
          </SizableText>
          <Paragraph size="$3" color="$mutedForeground" text="center">
            {body}
          </Paragraph>
        </YStack>

        <Button
          size="$4"
          theme="accent"
          disabled={disabled}
          opacity={disabled ? 0.5 : 1}
          onPress={onAction}
        >
          {action}
        </Button>
      </YStack>
    </YStack>
  );
}
