import type { ReactNode } from 'react';
import { Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { X } from '@tamagui/lucide-icons-2';
import { Button, SizableText, XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';

type IconComponent = typeof X;

export function FullScreenSheet({
  open,
  title,
  meta,
  Icon,
  iconLabel,
  onDismiss,
  children,
}: {
  open: boolean;
  title: string;
  meta: string;
  Icon: IconComponent;
  iconLabel: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <YStack flex={1} bg="$background" pt={insets.top} pb={insets.bottom}>
        <XStack
          items="flex-start"
          justify="space-between"
          gap={SPACING.items}
          px={SPACING.screen}
          py={SPACING.group}
        >
          <YStack flex={1} minW={0} gap={SPACING.text}>
            <SectionTitle>{title}</SectionTitle>

            {meta !== '' && (
              <SizableText size={TEXT.caption} color="$mutedForeground">
                {meta}
              </SizableText>
            )}
          </YStack>

          <Button
            size={BUTTON.icon}
            circular
            chromeless
            onPress={onDismiss}
            icon={<Icon size={ICON.row} color="$color" />}
            accessibilityLabel={iconLabel}
          />
        </XStack>

        {children}
      </YStack>
    </Modal>
  );
}
