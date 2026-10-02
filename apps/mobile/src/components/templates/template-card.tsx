import { memo } from 'react';
import { CircleCheck } from '@tamagui/lucide-icons-2/icons/CircleCheck';
import { Languages } from '@tamagui/lucide-icons-2/icons/Languages';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { Chip } from '@/components/common/chip';
import { FREQUENCY_LABELS } from '@/components/goals/frequency-labels';
import { SPACING, TEXT } from '@/constants/layout';
import type { Template } from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

import {
  LANGUAGE_NAMES,
  STATUS_LABELS,
  templateStatus,
} from './template-labels';
import { TemplatePublisher } from './template-publisher';

export const TemplateCard = memo(function TemplateCard({
  template,
  inUse,
  onOpen,
}: {
  template: Template;
  inUse: boolean;
  onOpen: (template: Template) => void;
}) {
  const { t } = useTranslations();
  const status = templateStatus(template);

  const habits = t(
    template.habits.length === 1 ? 'habits.countOne' : 'habits.countMany',
    { count: template.habits.length },
  );

  return (
    <Card
      pressable
      gap={SPACING.group}
      onPress={() => onOpen(template)}
      accessibilityRole="button"
      accessibilityLabel={[
        template.name,
        template.publisher.name,
        habits,
        ...(inUse ? [t('templates.inUse')] : []),
      ].join('. ')}
    >
      <YStack gap={SPACING.text}>
        <XStack items="flex-start" gap={SPACING.items}>
          <SizableText
            flex={1}
            size={TEXT.heading}
            fontWeight="700"
            color="$cardForeground"
            numberOfLines={2}
          >
            {template.name}
          </SizableText>
          <XStack maxW="40%" pt="$1" justify="flex-end">
            <TemplatePublisher publisher={template.publisher} />
          </XStack>
        </XStack>

        {template.description !== '' && (
          <Paragraph
            size={TEXT.body}
            color="$mutedForeground"
            numberOfLines={2}
          >
            {template.description}
          </Paragraph>
        )}
      </YStack>

      <XStack items="center" gap="$2" flexWrap="wrap">
        <Chip label={LANGUAGE_NAMES[template.language]} Icon={Languages} />
        {inUse && (
          <Chip label={t('templates.inUse')} Icon={CircleCheck} highlighted />
        )}
        {status !== null && <Chip label={t(STATUS_LABELS[status])} />}
        <SizableText size={TEXT.caption} color="$primary" fontWeight="600">
          {habits}
        </SizableText>
        <SizableText size={TEXT.caption} color="$mutedForeground">
          ·
        </SizableText>
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t(FREQUENCY_LABELS[template.trackingFrequency])}
        </SizableText>
      </XStack>
    </Card>
  );
});
