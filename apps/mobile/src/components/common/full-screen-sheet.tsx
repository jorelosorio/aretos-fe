import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Modal, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, SizableText, XStack, YStack } from 'tamagui';

import type { IconComponent } from '@/components/common/icon-component';
import {
  HeaderButtons,
  type HeaderAction,
} from '@/components/common/header-buttons';
import { SectionTitle } from '@/components/common/section-title';
import { SHEET_ENTER, SHEET_EXIT } from '@/components/common/sheet-motion';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';

export function FullScreenSheet({
  open,
  title,
  meta,
  Icon,
  iconLabel,
  actions,
  onDismiss,
  children,
}: {
  open: boolean;
  title: string;
  meta: string;
  Icon: IconComponent;
  iconLabel: string;
  actions?: readonly HeaderAction[];
  onDismiss: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const offset = useSharedValue(width);
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) setMounted(true);

  const enter = useCallback(() => {
    offset.set(withTiming(0, SHEET_ENTER));
  }, [offset]);

  useEffect(() => {
    if (open) {
      if (offset.get() < width) enter();
      return;
    }
    offset.set(
      withTiming(width, SHEET_EXIT, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      }),
    );
  }, [open, width, offset, enter]);

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.get() }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onShow={enter}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          {
            flex: 1,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: -4, height: 0 },
            elevation: 12,
          },
          slide,
        ]}
      >
        <YStack flex={1} bg="$background" pt={insets.top} pb={insets.bottom}>
          <XStack
            items="center"
            gap={SPACING.items}
            px={SPACING.screen}
            py={SPACING.group}
          >
            <Button
              size={BUTTON.icon}
              circular
              chromeless
              onPress={onDismiss}
              icon={<Icon size={ICON.row} color="$color" />}
              accessibilityLabel={iconLabel}
            />

            <YStack flex={1} minW={0} gap={SPACING.text}>
              <SectionTitle>{title}</SectionTitle>

              {meta !== '' && (
                <SizableText size={TEXT.caption} color="$mutedForeground">
                  {meta}
                </SizableText>
              )}
            </YStack>

            {actions !== undefined && <HeaderButtons actions={actions} />}
          </XStack>

          {children}
        </YStack>
      </Animated.View>
    </Modal>
  );
}
