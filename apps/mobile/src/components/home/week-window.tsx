import { CalendarRange } from '@tamagui/lucide-icons-2';
import { SizableText, XStack } from 'tamagui';

import { shortDateLabel } from '@/components/common/date-label';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import { weekEnd, weekdayIndex } from '@/features/logs';
import { useTranslations } from '@/lib/i18n';

const DAYS_IN_WEEK = 7;

export function WeekWindow({
  entryDate,
  today,
}: {
  entryDate: string;
  today: string;
}) {
  const { t, locale } = useTranslations();

  const range = `${shortDateLabel(entryDate, locale)} – ${shortDateLabel(
    weekEnd(entryDate),
    locale,
  )}`;

  const daysLeft = DAYS_IN_WEEK - weekdayIndex(today);
  const lastDay = daysLeft === 1;

  return (
    <XStack
      items="center"
      justify="space-between"
      gap={SPACING.items}
      px="$3"
      py="$2.5"
      rounded="$lg"
      bg="$muted"
    >
      <XStack items="center" gap="$2" shrink={1}>
        <CalendarRange size={ICON.inline} color="$mutedForeground" />
        <SizableText
          size={TEXT.caption}
          color="$mutedForeground"
          numberOfLines={1}
        >
          {range}
        </SizableText>
      </XStack>

      <SizableText
        size={TEXT.caption}
        fontWeight="700"
        color={lastDay ? '$primary' : '$cardForeground'}
      >
        {lastDay
          ? t('home.daysLeftOne')
          : t('home.daysLeftMany', { count: daysLeft })}
      </SizableText>
    </XStack>
  );
}
