import { Paragraph, SizableText, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';

export function StepIntro({ title, body }: { title: string; body: string }) {
  return (
    <YStack gap={SPACING.group}>
      <SizableText
        size={TEXT.title}
        fontWeight="700"
        color="$color"
        accessibilityRole="header"
      >
        {title}
      </SizableText>
      <Paragraph size={TEXT.body} color="$mutedForeground">
        {body}
      </Paragraph>
    </YStack>
  );
}
