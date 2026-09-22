import { KeyboardAvoidingView, Platform } from 'react-native';
import { Minimize2 } from '@tamagui/lucide-icons-2';
import { TextArea } from 'tamagui';

import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import { SPACING } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export function NoteEditor({
  open,
  value,
  maxLength,
  onChange,
  onCollapse,
}: {
  open: boolean;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  onCollapse: () => void;
}) {
  const { t } = useTranslations();

  return (
    <FullScreenSheet
      open={open}
      title={t('logs.note')}
      meta={`${value.length} / ${maxLength}`}
      Icon={Minimize2}
      iconLabel={t('logs.noteEditor.collapse')}
      onDismiss={onCollapse}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TextArea
          flex={1}
          size="$5"
          value={value}
          onChangeText={onChange}
          placeholder={t('logs.notePlaceholder')}
          placeholderTextColor="$mutedForeground"
          maxLength={maxLength}
          multiline
          autoFocus
          verticalAlign="top"
          p={SPACING.screen}
          bg="$background"
          borderWidth={0}
          focusStyle={{ borderWidth: 0 }}
        />
      </KeyboardAvoidingView>
    </FullScreenSheet>
  );
}
