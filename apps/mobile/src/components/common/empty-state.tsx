import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { BUTTON, SPACING, TEXT } from '@/constants/layout';

import { EmptyArt } from './empty-art';
import type { IconComponent } from './icon-component';
import type { Illustration } from './illustrations';

export type EmptyAction = {
  label: string;
  Icon?: IconComponent;
  onPress: () => void;
};

export function EmptyState({
  Icon,
  illustration,
  title,
  body,
  action,
  compact = false,
}: {
  Icon: IconComponent;
  illustration?: Illustration;
  title: string;
  body: string;
  action?: EmptyAction;
  compact?: boolean;
}) {
  const content = (
    <YStack
      flex={compact ? undefined : 1}
      items="center"
      justify="center"
      gap={compact ? SPACING.group : SPACING.section}
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

      {action !== undefined && (
        <YStack pt={compact ? SPACING.group : 0}>
          <Button
            size={BUTTON.primary}
            theme="accent"
            icon={action.Icon}
            onPress={action.onPress}
          >
            {action.label}
          </Button>
        </YStack>
      )}
    </YStack>
  );

  if (compact) return content;

  return (
    <YStack flex={1} p={SPACING.screen} bg="$background">
      {content}
    </YStack>
  );
}
