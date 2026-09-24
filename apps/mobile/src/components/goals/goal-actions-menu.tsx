import { useState } from 'react';
import { Alert, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Archive,
  ArchiveRestore,
  EllipsisVertical,
  Pencil,
  Trash2,
} from '@tamagui/lucide-icons-2';
import { Button, Separator, SizableText, XStack, YStack } from 'tamagui';

import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import {
  useDeleteGoal,
  useGoalErrorMessage,
  useUpdateGoal,
} from '@/features/goals';
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

export function GoalActionsMenu({
  goalId,
  archived,
}: {
  goalId: string;
  archived: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toMessage = useGoalErrorMessage();

  const [open, setOpen] = useState(false);

  const { updateGoal, isUpdating } = useUpdateGoal();
  const { deleteGoal, isDeleting } = useDeleteGoal();

  const report = (error: unknown) =>
    Alert.alert(t('goals.errors.title'), toMessage(error) ?? '');

  const edit = () => {
    setOpen(false);
    router.push({ pathname: '/goals/[id]/edit', params: { id: goalId } });
  };

  const toggleArchived = () => {
    setOpen(false);
    void updateGoal({ id: goalId, patch: { archived: !archived } })
      .then(() => router.back())
      .catch(report);
  };

  const remove = () => {
    setOpen(false);
    Alert.alert(t('goals.deleteConfirmTitle'), t('goals.deleteConfirmBody'), [
      { text: t('auth.cancel'), style: 'cancel' },
      {
        text: t('goals.delete'),
        style: 'destructive',
        onPress: () =>
          void deleteGoal(goalId)
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
        accessibilityLabel={t('goals.actions')}
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
            {!archived && (
              <>
                <MenuItem
                  label={t('goals.edit')}
                  Icon={Pencil}
                  onPress={edit}
                />
                <Separator borderColor="$border" />
              </>
            )}
            <MenuItem
              label={t(archived ? 'goals.restore' : 'goals.archive')}
              Icon={archived ? ArchiveRestore : Archive}
              onPress={toggleArchived}
            />
            <Separator borderColor="$border" />
            <MenuItem
              label={t('goals.delete')}
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
