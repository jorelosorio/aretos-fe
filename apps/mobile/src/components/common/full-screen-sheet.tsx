import type { ReactNode } from 'react';
import { Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { X } from '@tamagui/lucide-icons-2';
import { Button, SizableText, XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { ICON, SPACING } from '@/constants/layout';

const TOOLBAR_MIN_HEIGHT = 44;

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
          items="center"
          justify="space-between"
          gap={SPACING.items}
          px={SPACING.screen}
          py={SPACING.group}
        >
          <YStack flex={1} minW={0}>
            <SectionTitle>{title}</SectionTitle>
          </YStack>

          <Button
            size="$3"
            circular
            chromeless
            onPress={onDismiss}
            icon={<Icon size={ICON.row} color="$color" />}
            accessibilityLabel={iconLabel}
          />
        </XStack>

        <XStack
          items="center"
          justify="flex-end"
          gap={SPACING.items}
          minH={TOOLBAR_MIN_HEIGHT}
          px={SPACING.screen}
          borderTopWidth={1}
          borderBottomWidth={1}
          borderColor="$border"
        >
          <SizableText size="$2" color="$mutedForeground">
            {meta}
          </SizableText>
        </XStack>

        {children}
      </YStack>
    </Modal>
  );
}
