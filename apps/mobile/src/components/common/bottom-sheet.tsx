import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeName } from '@tamagui/core';
import { X } from '@tamagui/lucide-icons-2';
import { ScrollView, SizableText, XStack, YStack } from 'tamagui';

import { HeaderIconButton } from '@/components/common/header-actions';
import { SectionTitle } from '@/components/common/section-title';
import { SHEET, SPACING, TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

export type SheetDetent = keyof typeof SHEET.detents;

const ENTER = { duration: 420, easing: Easing.bezier(0.32, 0.72, 0, 1) };
const EXIT = { duration: 260, easing: Easing.bezier(0.32, 0, 0.67, 0) };
const SNAP = { damping: 32, stiffness: 320, mass: 1 };
const FLING = 0.12;
const RESISTANCE = 4;

export function BottomSheet({
  open,
  title,
  subtitle,
  leading,
  detent = 'half',
  onDismiss,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  detent?: SheetDetent;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslations();
  const theme = useTheme();
  const shadow =
    SHEET.shadow[useThemeName().startsWith('dark') ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { height: screen } = useWindowDimensions();

  const full = screen - insets.top - SHEET.topGap;
  const resting = Math.max(0, full - screen * SHEET.detents[detent]);

  const offset = useSharedValue(full);
  const start = useSharedValue(0);
  const [mounted, setMounted] = useState(open);
  const [settled, setSettled] = useState(resting);

  if (open && !mounted) setMounted(true);

  const snap = useCallback(
    (to: number, velocity = 0) => {
      'worklet';
      offset.set(
        withSpring(to, { ...SNAP, velocity }, (finished) => {
          if (finished) scheduleOnRN(setSettled, to);
        }),
      );
    },
    [offset],
  );

  const enter = useCallback(() => {
    offset.set(
      withTiming(resting, ENTER, (finished) => {
        if (finished) scheduleOnRN(setSettled, resting);
      }),
    );
  }, [offset, resting]);

  const toggle = () => {
    'worklet';
    snap(offset.get() > 0 ? 0 : resting);
  };

  useEffect(() => {
    if (open) {
      if (offset.get() < full) enter();
      return;
    }
    offset.set(
      withTiming(full, EXIT, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      }),
    );
  }, [open, full, offset, enter]);

  const drag = () =>
    Gesture.Race(
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .onStart(() => {
          start.set(offset.get());
        })
        .onUpdate((event) => {
          const next = start.get() + event.translationY;
          offset.set(
            next < 0 ? Math.max(next / RESISTANCE, -SHEET.overdrag) : next,
          );
        })
        .onEnd((event) => {
          const projected = offset.get() + event.velocityY * FLING;
          const target = [0, resting, full].reduce((best, point) =>
            Math.abs(point - projected) < Math.abs(best - projected)
              ? point
              : best,
          );

          if (target === full) scheduleOnRN(onDismiss);
          else snap(target, event.velocityY);
        }),
      Gesture.Tap().onEnd(toggle),
    );

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.get() }],
  }));

  const expanded = settled === 0;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onShow={enter}
      onRequestClose={onDismiss}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <GestureHandlerRootView style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('sheet.close')}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              height: full + SHEET.overdrag,
              bottom: -SHEET.overdrag,
              backgroundColor: theme.background.val,
              boxShadow: shadow,
            },
            slide,
          ]}
          onAccessibilityEscape={onDismiss}
        >
          <YStack
            flex={1}
            bg="$background"
            borderTopLeftRadius={SHEET.radius}
            borderTopRightRadius={SHEET.radius}
            overflow="hidden"
          >
            <GestureDetector gesture={drag()}>
              <View>
                <YStack items="center" pt={SPACING.group} pb={SPACING.items}>
                  <YStack
                    width={SHEET.handle.width}
                    height={SHEET.handle.height}
                    rounded={SHEET.handle.height}
                    bg="$mutedForeground"
                    opacity={0.35}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={
                      expanded ? t('sheet.collapse') : t('sheet.expand')
                    }
                    accessibilityActions={[{ name: 'activate' }]}
                    onAccessibilityAction={toggle}
                  />
                </YStack>
              </View>
            </GestureDetector>

            <XStack
              items="center"
              gap={SPACING.items}
              px={SHEET.padding}
              pt={SPACING.text}
              pb={SPACING.section}
            >
              <GestureDetector gesture={drag()}>
                <View style={styles.heading}>
                  <YStack gap={SPACING.text}>
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

                    {subtitle !== undefined && subtitle !== '' && (
                      <SizableText size={TEXT.caption} color="$mutedForeground">
                        {subtitle}
                      </SizableText>
                    )}
                  </YStack>
                </View>
              </GestureDetector>

              <HeaderIconButton
                Icon={X}
                label={t('sheet.close')}
                onPress={onDismiss}
              />
            </XStack>

            <ScrollView
              flex={1}
              contentContainerStyle={{
                pb: settled + SHEET.overdrag + insets.bottom,
              }}
            >
              <YStack px={SHEET.padding}>{children}</YStack>
            </ScrollView>
          </YStack>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heading: { flex: 1, minWidth: 0 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: SHEET.radius,
    borderTopRightRadius: SHEET.radius,
  },
});
