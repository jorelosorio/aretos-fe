import { useRouter } from 'expo-router';
import { ChevronRight } from '@tamagui/lucide-icons-2/icons/ChevronRight';
import { LayoutTemplate } from '@tamagui/lucide-icons-2/icons/LayoutTemplate';
import { SizableText, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import { useTemplate } from '@/features/templates/hooks';
import { useTranslations } from '@/lib/i18n';

export function GoalTemplateLink({ templateId }: { templateId: string }) {
  const { t } = useTranslations();
  const router = useRouter();
  const { data: template } = useTemplate(templateId);

  if (template === undefined) return null;

  return (
    <Card
      row
      pressable
      items="center"
      onPress={() =>
        router.push({
          pathname: '/templates/[id]',
          params: { id: template.id },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={`${t('goals.fromTemplate')}: ${template.name}`}
    >
      <LayoutTemplate size={ICON.row} color="$mutedForeground" />

      <YStack flex={1} gap={SPACING.text}>
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {t('goals.fromTemplate')}
        </SizableText>
        <SizableText
          size={TEXT.body}
          fontWeight="600"
          color="$cardForeground"
          numberOfLines={2}
        >
          {template.name}
        </SizableText>
      </YStack>

      <ChevronRight size={ICON.row} color="$mutedForeground" />
    </Card>
  );
}
