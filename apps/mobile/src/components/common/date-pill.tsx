import { useState } from 'react';
import { CalendarDays } from '@tamagui/lucide-icons-2/icons/CalendarDays';
import { ChevronDown } from '@tamagui/lucide-icons-2/icons/ChevronDown';
import { SizableText, XStack, YStack } from 'tamagui';

import { BottomSheet } from '@/components/common/bottom-sheet';
import { longDateLabel, mediumDateLabel } from '@/components/common/date-label';
import { HIT_SLOP, ICON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { MonthCalendar } from './month-calendar';

const TOUCH_MIN = 44;

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
  const tone = active ? '$primary' : '$mutedForeground';

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
      gap="$1.5"
      minH={TOUCH_MIN}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      pressStyle={{ opacity: 0.6 }}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint={t('calendar.choose')}
      accessibilityState={{ expanded: active }}
    >
      <CalendarDays size={ICON.inline} color={tone} />
      <SizableText
        shrink={1}
        size={TEXT.caption}
        color={tone}
        numberOfLines={1}
      >
        {label}
      </SizableText>
      <ChevronDown size={ICON.inline} color={tone} />
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
