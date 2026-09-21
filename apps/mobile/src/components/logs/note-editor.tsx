import { KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Minimize2 } from '@tamagui/lucide-icons-2';
import { Button, SizableText, TextArea, XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { ICON, SPACING } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

const TOOLBAR_MIN_HEIGHT = 44;

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
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={onCollapse}
      statusBarTranslucent
    >
      <YStack flex={1} bg="$background" pt={insets.top} pb={insets.bottom}>
        <XStack
          items="center"
          justify="space-between"
          gap={SPACING.items}
          px={SPACING.screen}
          py={SPACING.group}
        >
          <SectionTitle>{t('logs.note')}</SectionTitle>

          <Button
            size="$3"
            circular
            chromeless
            onPress={onCollapse}
            icon={<Minimize2 size={ICON.row} color="$color" />}
            accessibilityLabel={t('logs.noteEditor.collapse')}
          />
        </XStack>

        <XStack
          items="center"
          justify="flex-end"
          minH={TOOLBAR_MIN_HEIGHT}
          px={SPACING.screen}
          borderTopWidth={1}
          borderBottomWidth={1}
          borderColor="$border"
        >
          <SizableText size="$2" color="$mutedForeground">
            {`${value.length} / ${maxLength}`}
          </SizableText>
        </XStack>

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
      </YStack>
    </Modal>
  );
}
