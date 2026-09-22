import { KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@tamagui/core';
import { Minimize2 } from '@tamagui/lucide-icons-2';
import { TextArea, type ColorTokens } from 'tamagui';

import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import { NOTE_TEXT } from '@/components/common/note-text';
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
  const theme = useTheme();

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
          size={NOTE_TEXT.size}
          lineHeight={NOTE_TEXT.lineHeight}
          color={theme.color.val as ColorTokens}
          value={value}
          onChangeText={onChange}
          placeholder={t('logs.notePlaceholder')}
          placeholderTextColor={theme.mutedForeground.val as ColorTokens}
          maxLength={maxLength}
          multiline
          autoFocus
          verticalAlign="top"
          p={NOTE_TEXT.padding}
          bg={theme.background.val as ColorTokens}
          borderWidth={0}
          focusStyle={{
            borderWidth: 0,
            bg: theme.background.val as ColorTokens,
          }}
        />
      </KeyboardAvoidingView>
    </FullScreenSheet>
  );
}
