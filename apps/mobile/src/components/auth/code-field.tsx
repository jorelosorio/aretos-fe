import { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SizableText, XStack, YStack, useTheme } from 'tamagui';

import { FIELD } from '@/components/common/form-field';
import { FormSection } from '@/components/common/form-section';
import { SPACING, TEXT } from '@/constants/layout';
import { CODE_LENGTH, codeError, toCode } from '@/features/auth/credentials';
import { useTranslations } from '@/lib/i18n';

const SLOT_HEIGHT = 56;
const SLOT_BORDER = 1;
const SLOT_BORDER_ACTIVE = 2;
const GROUP_SIZE = CODE_LENGTH / 2;

const CARET_WIDTH = 2;
const CARET_HEIGHT = 26;
const CARET_BLINK_MS = 530;

const SHAKE_OFFSET = 8;
const SHAKE_STEP_MS = 50;

type SlotState = 'idle' | 'active' | 'invalid';

export function CodeField({
  value,
  onChange,
  onComplete,
  invalid = false,
}: {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  invalid?: boolean;
}) {
  const { t } = useTranslations();
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const reduced = useReducedMotion();
  const shake = useSharedValue(0);

  const error = touched && !focused ? codeError(value) : null;
  const showInvalid = invalid || error !== null;
  const activeIndex = focused ? Math.min(value.length, CODE_LENGTH - 1) : -1;

  useEffect(() => {
    if (!invalid || reduced) return;
    shake.value = withSequence(
      withTiming(-SHAKE_OFFSET, { duration: SHAKE_STEP_MS }),
      withTiming(SHAKE_OFFSET, { duration: SHAKE_STEP_MS }),
      withTiming(-SHAKE_OFFSET / 2, { duration: SHAKE_STEP_MS }),
      withTiming(SHAKE_OFFSET / 2, { duration: SHAKE_STEP_MS }),
      withTiming(0, { duration: SHAKE_STEP_MS }),
    );
  }, [invalid, reduced, shake]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const handleChange = (text: string) => {
    const next = toCode(text);
    if (next === value) return;
    onChange(next);
    if (next.length === CODE_LENGTH) onComplete?.(next);
  };

  const slotState = (index: number): SlotState => {
    if (showInvalid) return 'invalid';
    return index === activeIndex ? 'active' : 'idle';
  };

  const group = (start: number) => (
    <XStack flex={1} gap={SPACING.group}>
      {Array.from({ length: GROUP_SIZE }, (_, offset) => {
        const index = start + offset;
        return (
          <Slot
            key={index}
            digit={value[index] ?? ''}
            state={slotState(index)}
            caret={index === activeIndex && value.length < CODE_LENGTH}
          />
        );
      })}
    </XStack>
  );

  return (
    <FormSection
      title={t('auth.fields.code')}
      error={error === null ? undefined : t(`auth.fieldErrors.${error}`)}
    >
      <Animated.View style={shakeStyle}>
        <XStack
          gap={SPACING.items}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {group(0)}
          {group(GROUP_SIZE)}
        </XStack>
        <TextInput
          accessibilityLabel={t('auth.fields.code')}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTouched(true);
          }}
          autoFocus
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          caretHidden
          selectionColor="transparent"
          style={styles.input}
        />
      </Animated.View>
    </FormSection>
  );
}

function Slot({
  digit,
  state,
  caret,
}: {
  digit: string;
  state: SlotState;
  caret: boolean;
}) {
  const borderColor =
    state === 'invalid'
      ? '$destructive'
      : state === 'active'
        ? '$primary'
        : FIELD.borderColor;

  return (
    <YStack
      flex={1}
      height={SLOT_HEIGHT}
      items="center"
      justify="center"
      bg={FIELD.bg}
      rounded={FIELD.rounded}
      borderWidth={state === 'idle' ? SLOT_BORDER : SLOT_BORDER_ACTIVE}
      borderColor={borderColor}
    >
      {digit !== '' ? (
        <SizableText size={TEXT.display} fontWeight="700" color="$color">
          {digit}
        </SizableText>
      ) : (
        caret && <Caret />
      )}
    </YStack>
  );
}

function Caret() {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(
      withTiming(0, { duration: CARET_BLINK_MS }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity, reduced]);

  const blink = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.caret, { backgroundColor: theme.primary.val }, blink]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...StyleSheet.absoluteFill,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 1,
  },
  caret: {
    width: CARET_WIDTH,
    height: CARET_HEIGHT,
    borderRadius: CARET_WIDTH / 2,
  },
});
