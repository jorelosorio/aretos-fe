import { Paragraph, SizableText, YStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';

import { Card } from './card';
import type { IconComponent } from './icon-component';

const BADGE = 36;

export function Notice({
  Icon,
  title,
  body,
}: {
  Icon: IconComponent;
  title: string;
  body: string;
}) {
  return (
    <Card row>
      <YStack
        width={BADGE}
        height={BADGE}
        items="center"
        justify="center"
        rounded="$xl"
        bg="$muted"
      >
        <Icon size={ICON.row} color="$primary" />
      </YStack>

      <YStack flex={1} gap={SPACING.text}>
        <SizableText
          size={TEXT.heading}
          fontWeight="700"
          color="$cardForeground"
        >
          {title}
        </SizableText>
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {body}
        </Paragraph>
      </YStack>
    </Card>
  );
}
