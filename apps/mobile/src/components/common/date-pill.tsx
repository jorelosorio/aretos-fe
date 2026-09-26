import { useState } from 'react';
import { CalendarDays, ChevronDown } from '@tamagui/lucide-icons-2';
import { SizableText, XStack, YStack } from 'tamagui';

import { BottomSheet } from '@/components/common/bottom-sheet';
import { longDateLabel, mediumDateLabel } from '@/components/common/date-label';
import { ICON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { MonthCalendar } from './month-calendar';

export function DatePill({
  value,
  today,
  active = false,
  onPress,
}: {
  value: string;
  today: string;
  active?: boolean;
  onPress: () => void;
}) {
  const { t, locale } = useTranslations();
  const isToday = value === today;

  const label = isToday
    ? `${t('logs.period.today')} · ${mediumDateLabel(value, locale)}`
    : mediumDateLabel(value, locale);
  const spoken = isToday
    ? `${t('logs.period.today')} · ${longDateLabel(value, locale)}`
    : longDateLabel(value, locale);

  return (
    <XStack
      self="flex-start"
      items="center"
      gap="$2"
      px="$3"
      py="$2"
      rounded={999}
      borderWidth={1}
      borderColor={active ? '$primary' : '$border'}
      onPress={onPress}
      pressStyle={{ bg: '$cardPress' }}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint={t('calendar.choose')}
      accessibilityState={{ expanded: active }}
    >
      <CalendarDays size={ICON.row} color="$mutedForeground" />
      <SizableText shrink={1} size={TEXT.body} color="$color" numberOfLines={1}>
        {label}
      </SizableText>
      <ChevronDown size={ICON.row} color="$mutedForeground" />
    </XStack>
  );
}

export function DateSheet({
  open,
  value,
  today,
  min,
  max,
  onPick,
  onDismiss,
}: {
  open: boolean;
  value: string;
  today: string;
  min?: string;
  max?: string;
  onPick: (day: string) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslations();
  const [shown, setShown] = useState(open);
  const [session, setSession] = useState(0);

  if (open !== shown) {
    setShown(open);
    if (open) setSession((current) => current + 1);
  }

  return (
    <BottomSheet
      open={open}
      title={t('calendar.choose')}
      detent="fit"
      allowExpand={false}
      onDismiss={onDismiss}
    >
      <YStack pb={SPACING.screen}>
        <MonthCalendar
          key={session}
          value={value}
          today={today}
          min={min}
          max={max}
          onPick={onPick}
        />
      </YStack>
    </BottomSheet>
  );
}
