import { Target } from '@tamagui/lucide-icons-2/icons/Target';
import { Button, SizableText, Spinner, YStack } from 'tamagui';

import { EmptyArt } from '@/components/common/empty-art';
import { ErrorNotice } from '@/components/common/error-notice';
import { ILLUSTRATIONS } from '@/components/common/illustrations';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function SavingStep({
  error,
  onRetry,
  onLeave,
}: {
  error: string | null;
  onRetry: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslations();

  return (
    <YStack
      flex={1}
      items="center"
      justify="center"
      gap={SPACING.section}
      p={SPACING.section}
      accessibilityLiveRegion="polite"
    >
      <EmptyArt Icon={Target} illustration={ILLUSTRATIONS.noGoals} />

      <SizableText
        size={TEXT.title}
        fontWeight="700"
        color="$color"
        text="center"
        accessibilityRole="header"
      >
        {t('guide.saving.title')}
      </SizableText>

      {error === null ? (
        <Spinner size="large" color="$primary" />
      ) : (
        <YStack gap={SPACING.items} self="stretch">
          <ErrorNotice message={error} />
          <Button size={BUTTON.primary} theme="accent" onPress={onRetry}>
            {t('guide.saving.retry')}
          </Button>
          <Button size={BUTTON.primary} chromeless onPress={onLeave}>
            {t('guide.saving.leave')}
          </Button>
        </YStack>
      )}
    </YStack>
  );
}
