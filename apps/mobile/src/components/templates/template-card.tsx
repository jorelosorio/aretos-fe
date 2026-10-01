import { memo } from 'react';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { Chip } from '@/components/common/chip';
import { FREQUENCY_LABELS } from '@/components/goals/frequency-labels';
import { TagChips } from '@/components/tags/tag-chips';
import { SPACING, TEXT } from '@/constants/layout';
import type { Template } from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

import { STATUS_LABELS, templateStatus } from './template-labels';
import { TemplatePublisher } from './template-publisher';

const CARD_TAGS = 3;

export const TemplateCard = memo(function TemplateCard({
  template,
  onOpen,
  onTag,
}: {
  template: Template;
  onOpen: (template: Template) => void;
  onTag: (tag: string) => void;
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
      accessibilityLabel={`${template.name}. ${template.publisher.name}. ${habits}`}
    >
      <XStack items="center" justify="space-between" gap={SPACING.items}>
        <TemplatePublisher publisher={template.publisher} />
        {status !== null && <Chip label={t(STATUS_LABELS[status])} />}
      </XStack>

      <YStack gap={SPACING.text}>
        <SizableText
          size={TEXT.heading}
          fontWeight="700"
          color="$cardForeground"
          numberOfLines={2}
        >
          {template.name}
        </SizableText>

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
        <SizableText size={TEXT.caption} color="$primary" fontWeight="600">
          {habits}
        </SizableText>
        <SizableText size={TEXT.caption} color="$mutedForeground">
          ·
        </SizableText>
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t(FREQUENCY_LABELS[template.trackingFrequency])}
        </SizableText>
        {template.uses > 0 && (
          <>
            <SizableText size={TEXT.caption} color="$mutedForeground">
              ·
            </SizableText>
            <SizableText size={TEXT.caption} color="$mutedForeground">
              {t(
                template.uses === 1
                  ? 'templates.usesOne'
                  : 'templates.usesMany',
                { count: template.uses },
              )}
            </SizableText>
          </>
        )}
      </XStack>

      <TagChips
        tags={template.tags}
        max={CARD_TAGS}
        onPress={onTag}
        filters="templates"
      />
    </Card>
  );
});
