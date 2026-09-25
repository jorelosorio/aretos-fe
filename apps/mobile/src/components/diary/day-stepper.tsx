import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons-2';
import { SizableText, XStack } from 'tamagui';

import { longDateLabel } from '@/components/common/date-label';
import { HeaderIconButton } from '@/components/common/header-actions';
import { SPACING, TEXT } from '@/constants/layout';
import { shiftPeriod, type DateKey } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

export function DayStepper({
  value,
  max,
  onChange,
}: {
  value: DateKey;
  max: DateKey;
  onChange: (day: DateKey) => void;
}) {
  const { t, locale } = useTranslations();

  const label =
    value === max
      ? t('logs.period.today')
      : value === shiftPeriod(max, 'daily', -1)
        ? t('diary.editor.yesterday')
        : longDateLabel(value, locale);

  return (
    <XStack
      items="center"
      justify="space-between"
      gap={SPACING.items}
      px={SPACING.screen}
      pb={SPACING.group}
    >
      <HeaderIconButton
        Icon={ChevronLeft}
        label={t('diary.editor.previousDay')}
        onPress={() => onChange(shiftPeriod(value, 'daily', -1))}
      />

      <SizableText
        size={TEXT.subheading}
        fontWeight="700"
        color="$color"
        accessibilityLiveRegion="polite"
      >
        {label}
      </SizableText>

      <HeaderIconButton
        Icon={ChevronRight}
        label={t('diary.editor.nextDay')}
        disabled={value >= max}
        onPress={() => onChange(shiftPeriod(value, 'daily', 1))}
      />
    </XStack>
  );
}
