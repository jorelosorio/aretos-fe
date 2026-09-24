import { useState } from 'react';
import { Alert, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Archive,
  ArchiveRestore,
  EllipsisVertical,
  Trash2,
} from '@tamagui/lucide-icons-2';
import { Button, Separator, SizableText, XStack, YStack } from 'tamagui';

import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import {
  useDeleteHabit,
  useHabitErrorMessage,
  useUpdateHabit,
} from '@/features/habits';
import { useTranslations } from '@/lib/i18n';

type IconComponent = typeof Archive;
type Tone = '$cardForeground' | '$destructive';

const HEADER_HEIGHT = 52;
const MENU_WIDTH = 220;
const MENU_INSET = 12;

function MenuItem({
  label,
  Icon,
  tone = '$cardForeground',
  onPress,
}: {
  label: string;
  Icon: IconComponent;
  tone?: Tone;
  onPress: () => void;
}) {
  return (
    <XStack
      onPress={onPress}
      pressStyle={{ bg: '$muted' }}
      items="center"
      gap={SPACING.items}
      px={SPACING.card}
      py={SPACING.items}
      accessibilityRole="menuitem"
      accessibilityLabel={label}
    >
      <Icon size={18} color={tone} />
      <SizableText flex={1} size={TEXT.subheading} color={tone}>
        {label}
      </SizableText>
    </XStack>
  );
}

export function HabitActionsMenu({
  habitId,
  archived,
}: {
  habitId: string;
  archived: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toMessage = useHabitErrorMessage();

  const [open, setOpen] = useState(false);

  const { updateHabit, isUpdating } = useUpdateHabit();
  const { deleteHabit, isDeleting } = useDeleteHabit();

  const report = (error: unknown) =>
    Alert.alert(t('habits.errors.title'), toMessage(error) ?? '');

  const toggleArchived = () => {
    setOpen(false);
    void updateHabit({ id: habitId, patch: { archived: !archived } })
      .then(() => router.back())
      .catch(report);
  };

  const remove = () => {
    setOpen(false);
    Alert.alert(t('habits.deleteConfirmTitle'), t('habits.deleteConfirmBody'), [
      { text: t('auth.cancel'), style: 'cancel' },
      {
        text: t('habits.delete'),
        style: 'destructive',
        onPress: () =>
          void deleteHabit(habitId)
            .then(() => router.back())
            .catch(report),
      },
    ]);
  };

  return (
    <>
      <Button
        size={BUTTON.icon}
        chromeless
        onPress={() => setOpen(true)}
        disabled={isUpdating || isDeleting}
        icon={<EllipsisVertical size={20} color="$color" />}
        accessibilityLabel={t('habits.actions')}
      />

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          onPress={() => setOpen(false)}
        >
          <YStack
            position="absolute"
            t={insets.top + HEADER_HEIGHT}
            r={MENU_INSET}
            width={MENU_WIDTH}
            bg="$card"
            rounded="$xl2"
            borderWidth={1}
            borderColor="$border"
            overflow="hidden"
          >
            <MenuItem
              label={t(archived ? 'habits.restore' : 'habits.archive')}
              Icon={archived ? ArchiveRestore : Archive}
              onPress={toggleArchived}
            />
            <Separator borderColor="$border" />
            <MenuItem
              label={t('habits.delete')}
              Icon={Trash2}
              tone="$destructive"
              onPress={remove}
            />
          </YStack>
        </Pressable>
      </Modal>
    </>
  );
}
