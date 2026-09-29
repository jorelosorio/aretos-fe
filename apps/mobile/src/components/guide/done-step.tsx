import { PartyPopper } from '@tamagui/lucide-icons-2/icons/PartyPopper';
import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { EmptyArt } from '@/components/common/empty-art';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function DoneStep({
  marked,
  onFinish,
  onSeeGoal,
}: {
  marked: boolean;
  onFinish: () => void;
  onSeeGoal: () => void;
}) {
  const { t } = useTranslations();
  const lines = [
    t('guide.done.goal'),
    t('guide.done.edit'),
    t('guide.done.daily'),
  ];

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      gap={SPACING.section}
      p={SPACING.section}
      accessibilityLiveRegion="polite"
    >
      <EmptyArt
        Icon={PartyPopper}
        illustration={marked ? ILLUSTRATIONS.allLogged : ILLUSTRATIONS.noHabits}
      />

      <YStack gap={SPACING.group} items="center">
        <SizableText
          size={TEXT.title}
          fontWeight="700"
          color="$color"
          text="center"
          accessibilityRole="header"
        >
          {t('guide.done.title')}
        </SizableText>
        {lines.map((line) => (
          <Paragraph
            key={line}
            size={TEXT.body}
            color="$mutedForeground"
            text="center"
          >
            {line}
          </Paragraph>
        ))}
      </YStack>

      <YStack gap={SPACING.items} self="stretch">
        <Button size={BUTTON.primary} theme="accent" onPress={onFinish}>
          {t('guide.done.finish')}
        </Button>
        <Button size={BUTTON.primary} chromeless onPress={onSeeGoal}>
          {t('guide.done.seeGoal')}
        </Button>
      </YStack>
    </YStack>
  );
}
