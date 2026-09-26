import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Modal, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChevronLeft } from '@tamagui/lucide-icons-2';
import { Button, SizableText, XStack, YStack } from 'tamagui';

import { SectionTitle } from '@/components/common/section-title';
import { BUTTON, ICON, SPACING, TEXT } from '@/constants/layout';

type IconComponent = typeof ChevronLeft;

const ENTER = { duration: 420, easing: Easing.bezier(0.32, 0.72, 0, 1) };
const EXIT = { duration: 260, easing: Easing.bezier(0.32, 0, 0.67, 0) };

export function FullScreenSheet({
  open,
  title,
  leading,
  meta,
  Icon,
  iconLabel,
  actions,
  onDismiss,
  children,
}: {
  open: boolean;
  title: string;
  leading?: ReactNode;
  meta: string;
  Icon: IconComponent;
  iconLabel: string;
  actions?: ReactNode;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const offset = useSharedValue(width);
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) setMounted(true);

  const enter = useCallback(() => {
    offset.set(withTiming(0, ENTER));
  }, [offset]);

  useEffect(() => {
    if (open) {
      if (offset.get() < width) enter();
      return;
    }
    offset.set(
      withTiming(width, EXIT, (finished) => {
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
              {leading === undefined ? (
                <SectionTitle>{title}</SectionTitle>
              ) : (
                <XStack items="center" gap="$2">
                  {leading}
                  <YStack shrink={1}>
                    <SectionTitle>{title}</SectionTitle>
                  </YStack>
                </XStack>
              )}

              {meta !== '' && (
                <SizableText size={TEXT.caption} color="$mutedForeground">
                  {meta}
                </SizableText>
              )}
            </YStack>

            <XStack items="center" gap="$1">
              {actions}
            </XStack>
          </XStack>

          {children}
        </YStack>
      </Animated.View>
    </Modal>
  );
}
