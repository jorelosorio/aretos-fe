import { PartyPopper } from '@tamagui/lucide-icons-2/icons/PartyPopper';
import { Button, Paragraph, SizableText, YStack } from 'tamagui';

import { EmptyArt } from '@/components/common/empty-art';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function DoneStep({
  marked,
  onSeeAnalysis,
}: {
  marked: boolean;
  onSeeAnalysis: () => void;
}) {
  const { t } = useTranslations();
  const lines = [t('guide.done.summary'), t('guide.done.encouragement')];

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
          textBreakStrategy="balanced"
          lineBreakStrategyIOS="push-out"
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
            textBreakStrategy="balanced"
            lineBreakStrategyIOS="push-out"
          >
            {line}
          </Paragraph>
        ))}
      </YStack>

      <Button
        size={BUTTON.primary}
        theme="accent"
        self="stretch"
        onPress={onSeeAnalysis}
      >
        {t('guide.done.results')}
      </Button>
    </YStack>
  );
}
