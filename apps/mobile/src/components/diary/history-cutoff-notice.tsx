import { History } from '@tamagui/lucide-icons-2/icons/History';

import { Notice } from '@/components/common/notice';
import { useTranslations } from '@/lib/i18n';
import { dateFormat } from '@/utils/date-format';
import { fromDateKey } from '@/utils/date-key';

export function HistoryCutoffNotice({ cutoff }: { cutoff: string }) {
  const { t, locale } = useTranslations();

  const date = dateFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fromDateKey(cutoff));

  return (
    <Notice
      Icon={History}
      title={t('diary.cutoff.title')}
      body={t('diary.cutoff.body', { date })}
    />
  );
}
