import { useState } from 'react';
import { Platform } from 'react-native';
import { ArrowDown } from '@tamagui/lucide-icons-2/icons/ArrowDown';
import { ArrowLeft } from '@tamagui/lucide-icons-2/icons/ArrowLeft';
import { ArrowUp } from '@tamagui/lucide-icons-2/icons/ArrowUp';
import { ChevronLeft } from '@tamagui/lucide-icons-2/icons/ChevronLeft';
import { Trash2 } from '@tamagui/lucide-icons-2/icons/Trash2';
import { YStack } from 'tamagui';

import type { MenuAction } from '@/components/common/actions-menu';
import { FormScrollView } from '@/components/common/form-scroll-view';
import { FullScreenSheet } from '@/components/common/full-screen-sheet';
import type { HeaderAction } from '@/components/common/header-buttons';
import { HabitFields } from '@/components/habits/habit-fields';
import { SPACING } from '@/constants/layout';
import { EMPTY_DRAFT } from '@/features/habits/types';
import type { TemplateHabit } from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

const BackIcon = Platform.OS === 'ios' ? ChevronLeft : ArrowLeft;

export function TemplateHabitEditor({
  open,
  initial,
  canMoveUp = false,
  canMoveDown = false,
  onSave,
  onMove,
  onRemove,
  onDismiss,
}: {
  open: boolean;
  initial: TemplateHabit | null;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onSave: (habit: TemplateHabit) => void;
  onMove?: (direction: -1 | 1) => void;
  onRemove?: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslations();
  const [draft, setDraft] = useState<TemplateHabit>(initial ?? EMPTY_DRAFT);

  const name = draft.name.trim();

  const menu: MenuAction[] = [
    ...(onMove !== undefined && canMoveUp
      ? [
          {
            key: 'up',
            label: t('templates.habitEditor.moveUp'),
            Icon: ArrowUp,
            onPress: () => onMove(-1),
          },
        ]
      : []),
    ...(onMove !== undefined && canMoveDown
      ? [
          {
            key: 'down',
            label: t('templates.habitEditor.moveDown'),
            Icon: ArrowDown,
            onPress: () => onMove(1),
          },
        ]
      : []),
    ...(onRemove === undefined
      ? []
      : [
          {
            key: 'remove',
            label: t('templates.habitEditor.remove'),
            Icon: Trash2,
            destructive: true,
            onPress: onRemove,
          },
        ]),
  ];

  const actions: HeaderAction[] = [
    {
      kind: 'text',
      label: t('templates.habitEditor.done'),
      onPress: () => onSave({ ...draft, name }),
      disabled: name === '',
    },
    ...(menu.length === 0
      ? []
      : [
          {
            kind: 'menu' as const,
            label: t('templates.habitEditor.actions'),
            actions: menu,
          },
        ]),
  ];

  return (
    <FullScreenSheet
      open={open}
      title={t(
        initial === null
          ? 'templates.habitEditor.newTitle'
          : 'templates.habitEditor.editTitle',
      )}
      meta=""
      Icon={BackIcon}
      iconLabel={t('templates.habitEditor.back')}
      actions={actions}
      onDismiss={onDismiss}
    >
      <FormScrollView padBottom={false}>
        <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
          <HabitFields
            value={draft}
            onChange={(change) =>
              setDraft((current) => ({ ...current, ...change }))
            }
            autoFocus={initial === null}
          />
        </YStack>
      </FormScrollView>
    </FullScreenSheet>
  );
}
