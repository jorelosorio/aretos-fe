import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AArrowDown } from '@tamagui/lucide-icons-2/icons/AArrowDown';
import { AArrowUp } from '@tamagui/lucide-icons-2/icons/AArrowUp';
import { ALargeSmall } from '@tamagui/lucide-icons-2/icons/ALargeSmall';
import { Button, Circle, XStack } from 'tamagui';

import { BUTTON, HIT_SLOP, ICON, SPACING } from '@/constants/layout';

import { HeaderIconButton } from './header-actions';
import { useHeaderMetrics } from './header-metrics';

const PANEL_INSET = 12;
const STEP_DOT = 8;

export function TextSizeControl({
  label,
  decreaseLabel,
  increaseLabel,
  step,
  steps,
  onChange,
  disabled = false,
}: {
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  step: number;
  steps: number;
  onChange: (step: number) => void;
  disabled?: boolean;
}) {
  const header = useHeaderMetrics();
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(header.height);
  const anchor = useRef<View>(null);

  const atMin = step <= 0;
  const atMax = step >= steps - 1;

  const show = () => {
    const trigger = anchor.current;
    if (trigger === null) {
      setOpen(true);
      return;
    }
    trigger.measureInWindow((_x, y, _width, height) => {
      if (height > 0) setTop(y + height);
      setOpen(true);
    });
  };

  return (
    <>
      <View ref={anchor} collapsable={false}>
        <HeaderIconButton
          Icon={ALargeSmall}
          label={label}
          onPress={show}
          disabled={disabled}
        />
      </View>

      <Modal
        visible={open}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
          accessibilityLabel={label}
        />

        <XStack
          position="absolute"
          t={top}
          r={PANEL_INSET}
          items="center"
          gap={SPACING.items}
          p="$2"
          bg="$card"
          rounded={999}
          borderWidth={1}
          borderColor="$border"
          shadowColor="#000"
          shadowOpacity={0.16}
          shadowRadius={16}
          shadowOffset={{ width: 0, height: 6 }}
          elevation={8}
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: 1, max: steps, now: step + 1 }}
          accessibilityActions={[
            { name: 'increment', label: increaseLabel },
            { name: 'decrement', label: decreaseLabel },
          ]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment' && !atMax) {
              onChange(step + 1);
            }
            if (event.nativeEvent.actionName === 'decrement' && !atMin) {
              onChange(step - 1);
            }
          }}
        >
          <Button
            size={BUTTON.icon}
            circular
            chromeless
            disabled={atMin}
            opacity={atMin ? 0.4 : 1}
            hitSlop={HIT_SLOP}
            onPress={() => onChange(step - 1)}
            icon={<AArrowDown size={ICON.row} color="$color" />}
            accessibilityLabel={decreaseLabel}
          />

          <XStack
            items="center"
            gap="$1.5"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {Array.from({ length: steps }, (_, index) => (
              <Circle
                key={index}
                size={STEP_DOT}
                bg={index === step ? '$primary' : '$mutedForeground'}
                opacity={index === step ? 1 : 0.35}
              />
            ))}
          </XStack>

          <Button
            size={BUTTON.icon}
            circular
            chromeless
            disabled={atMax}
            opacity={atMax ? 0.4 : 1}
            hitSlop={HIT_SLOP}
            onPress={() => onChange(step + 1)}
            icon={<AArrowUp size={ICON.row} color="$color" />}
            accessibilityLabel={increaseLabel}
          />
        </XStack>
      </Modal>
    </>
  );
}
