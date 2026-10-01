import { CircleAlert } from '@tamagui/lucide-icons-2/icons/CircleAlert';
import { CloudUpload } from '@tamagui/lucide-icons-2/icons/CloudUpload';
import { SizableText, XStack } from 'tamagui';

import { Notice } from '@/components/common/notice';
import { ICON, TEXT } from '@/constants/layout';
import { useNoteSyncMessage } from '@/features/diary/hooks';
import type { DiaryNote } from '@/features/diary/types';
import { useTranslations } from '@/lib/i18n';

export function NoteSyncStatus({
  note,
  explain = false,
}: {
  note: DiaryNote;
  explain?: boolean;
}) {
  const { t } = useTranslations();
  const syncMessage = useNoteSyncMessage();
  const { state } = note.sync;

  if (state === 'synced') return null;

  if (state === 'rejected' && explain) {
    return (
      <Notice
        Icon={CircleAlert}
        title={t('diary.sync.rejectedTitle')}
        body={syncMessage(note) ?? ''}
      />
    );
  }

  const Icon = state === 'rejected' ? CircleAlert : CloudUpload;

  return (
    <XStack items="center" gap="$1.5">
      <Icon size={ICON.inline} color="$mutedForeground" />
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {t(state === 'rejected' ? 'diary.sync.rejected' : 'diary.sync.pending')}
      </SizableText>
    </XStack>
  );
}
