import { History } from '@tamagui/lucide-icons-2';
import { Paragraph, SizableText, XStack, YStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

function toDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function HistoryCutoffNotice({ cutoff }: { cutoff: string }) {
  const { t, locale } = useTranslations();

  const date = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toDate(cutoff));

  return (
    <XStack
      gap={SPACING.items}
      p={SPACING.card}
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
    >
      <YStack
        width={36}
        height={36}
        items="center"
        justify="center"
        rounded="$xl"
        bg="$muted"
      >
        <History size={ICON.row} color="$primary" />
      </YStack>

      <YStack flex={1} gap={SPACING.text}>
        <SizableText
          size={TEXT.heading}
          fontWeight="700"
          color="$cardForeground"
        >
          {t('diary.cutoff.title')}
        </SizableText>
        <Paragraph size={TEXT.body} color="$mutedForeground">
          {t('diary.cutoff.body', { date })}
        </Paragraph>
      </YStack>
    </XStack>
  );
}
