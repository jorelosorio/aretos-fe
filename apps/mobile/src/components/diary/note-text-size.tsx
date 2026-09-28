import { NOTE_TEXT_STEPS } from '@/components/common/note-text';
import { TextSizeControl } from '@/components/common/text-size-control';
import { useTranslations } from '@/lib/i18n';
import { setPreferences, usePreferences } from '@/lib/preferences';

export function NoteTextSizeControl() {
  const { t } = useTranslations();
  const { noteTextSize } = usePreferences();

  return (
    <TextSizeControl
      label={t('diary.textSize.label')}
      decreaseLabel={t('diary.textSize.smaller')}
      increaseLabel={t('diary.textSize.larger')}
      step={NOTE_TEXT_STEPS.indexOf(noteTextSize)}
      steps={NOTE_TEXT_STEPS.length}
      onChange={(step) =>
        setPreferences({ noteTextSize: NOTE_TEXT_STEPS[step] })
      }
    />
  );
}
