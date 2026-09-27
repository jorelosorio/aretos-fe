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

import { fitResting, resistDrag, snapPoints } from './sheet-fit';
import { SHEET_ENTER, SHEET_EXIT } from './sheet-motion';

export type SheetDetent = keyof typeof SHEET.detents;
const SNAP = { damping: 32, stiffness: 320, mass: 1 };
const FLING = 0.12;

export function BottomSheet({
  open,
  title,
  subtitle,
  detent = 'half',
  allowExpand = true,
  onDismiss,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  detent?: SheetDetent | 'fit';
  allowExpand?: boolean;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslations();
  const theme = useTheme();
  const shadow =
    SHEET.shadow[useThemeName().startsWith('dark') ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { height: screen } = useWindowDimensions();

  const [chrome, setChrome] = useState(0);
  const [content, setContent] = useState(0);

  const full = screen - insets.top - SHEET.topGap;
  const preset = (share: number) => Math.max(0, full - screen * share);
  const resting =
    detent === 'fit'
      ? (fitResting({ full, chrome, content, bottom: insets.bottom }) ??
        preset(SHEET.detents.half))
      : preset(SHEET.detents[detent]);
  const fits = detent === 'fit';

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
      withTiming(resting, SHEET_ENTER, (finished) => {
        if (finished) scheduleOnRN(setSettled, resting);
      }),
    );
  }, [offset, resting]);

  const toggle = () => {
    'worklet';
    if (!allowExpand) return;
    snap(offset.get() > 0 ? 0 : resting);
  };

  useEffect(() => {
    if (open) {
      if (offset.get() < full) enter();
      return;
    }
    if (!mounted) return;

    offset.set(
      withTiming(full, SHEET_EXIT, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      }),
    );
  }, [open, mounted, full, offset, enter]);

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
            resistDrag(next, allowExpand ? 0 : resting, SHEET.overdrag),
          );
        })
        .onEnd((event) => {
          const projected = offset.get() + event.velocityY * FLING;
          const target = snapPoints(resting, full, allowExpand).reduce(
            (best, point) =>
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
              backgroundColor: theme.popover.val,
              borderColor: theme.border.val,
              boxShadow: shadow,
            },
            slide,
          ]}
          onAccessibilityEscape={onDismiss}
        >
          <YStack
            flex={1}
            bg="$popover"
            borderTopLeftRadius={SHEET.radius}
            borderTopRightRadius={SHEET.radius}
            overflow="hidden"
          >
            <View
              onLayout={
                fits
                  ? (event) => setChrome(event.nativeEvent.layout.height)
                  : undefined
              }
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
                      accessible={allowExpand}
                      accessibilityRole="button"
                      accessibilityLabel={
                        expanded ? t('sheet.collapse') : t('sheet.expand')
                      }
                      accessibilityActions={
                        allowExpand ? [{ name: 'activate' }] : undefined
                      }
                      onAccessibilityAction={allowExpand ? toggle : undefined}
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
                      <SectionTitle>{title}</SectionTitle>

                      {subtitle !== undefined && subtitle !== '' && (
                        <SizableText
                          size={TEXT.caption}
                          color="$mutedForeground"
                        >
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
            </View>

            <ScrollView
              flex={1}
              contentContainerStyle={{
                pb: settled + SHEET.overdrag + insets.bottom,
              }}
            >
              <YStack
                px={SHEET.padding}
                onLayout={
                  fits
                    ? (event) => setContent(event.nativeEvent.layout.height)
                    : undefined
                }
              >
                {children}
              </YStack>
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
    borderWidth: StyleSheet.hairlineWidth,
  },
});
