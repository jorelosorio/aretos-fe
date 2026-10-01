import { BookOpen } from '@tamagui/lucide-icons-2/icons/BookOpen';
import { Paragraph, SizableText, YStack } from 'tamagui';

import { EmptyArt } from '@/components/common/empty-art';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function WelcomeStep() {
  const { t } = useTranslations();
  const lines = [
    t('guide.welcome.thanks'),
    t('guide.welcome.plan'),
    t('guide.welcome.next'),
  ];

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      gap={SPACING.section}
      p={SPACING.section}
    >
      <EmptyArt Icon={BookOpen} illustration={ILLUSTRATIONS.guideStart} />

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
          {t('guide.welcome.title')}
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
    </YStack>
  );
}
