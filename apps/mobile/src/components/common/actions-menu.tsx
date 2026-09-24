import { Fragment, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import { Ellipsis, EllipsisVertical, type Plus } from '@tamagui/lucide-icons-2';
import { Separator, SizableText, XStack, YStack } from 'tamagui';

import { ICON, SPACING, TEXT } from '@/constants/layout';

import { HeaderIconButton } from './header-actions';
import { useHeaderMetrics } from './header-metrics';

type IconComponent = typeof Plus;

export type MenuAction = {
  key: string;
  label: string;
  Icon: IconComponent;
  destructive?: boolean;
  onPress: () => void;
};

const MENU_WIDTH = 220;
const MENU_INSET = 12;

const OverflowIcon = Platform.OS === 'ios' ? Ellipsis : EllipsisVertical;

function MenuItem({
  action,
  onSelect,
}: {
  action: MenuAction;
  onSelect: () => void;
}) {
  const tone = action.destructive ? '$destructive' : '$cardForeground';

  return (
    <XStack
      onPress={onSelect}
      pressStyle={{ bg: '$muted' }}
      items="center"
      gap={SPACING.items}
      px={SPACING.card}
      py={SPACING.items}
      accessibilityRole="menuitem"
      accessibilityLabel={action.label}
    >
      <action.Icon size={ICON.row} color={tone} />
      <SizableText flex={1} size={TEXT.subheading} color={tone}>
        {action.label}
      </SizableText>
    </XStack>
  );
}

export function ActionsMenu({
  label,
  actions,
  disabled = false,
}: {
  label: string;
  actions: readonly MenuAction[];
  disabled?: boolean;
}) {
  const header = useHeaderMetrics();
  const [open, setOpen] = useState(false);

  const select = (action: MenuAction) => {
    setOpen(false);
    action.onPress();
  };

  return (
    <>
      <HeaderIconButton
        Icon={OverflowIcon}
        label={label}
        onPress={() => setOpen(true)}
        disabled={disabled}
      />

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
          accessibilityLabel={label}
        />

        <YStack
          position="absolute"
          t={header.height}
          r={MENU_INSET}
          width={MENU_WIDTH}
          bg="$card"
          rounded="$xl2"
          borderWidth={1}
          borderColor="$border"
          shadowColor="#000"
          shadowOpacity={0.16}
          shadowRadius={16}
          shadowOffset={{ width: 0, height: 6 }}
          elevation={8}
          accessibilityRole="menu"
        >
          <YStack rounded="$xl2" overflow="hidden">
            {actions.map((action, index) => (
              <Fragment key={action.key}>
                {index > 0 && <Separator borderColor="$border" />}
                <MenuItem action={action} onSelect={() => select(action)} />
              </Fragment>
            ))}
          </YStack>
        </YStack>
      </Modal>
    </>
  );
}
