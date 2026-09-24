import type { ReactNode } from 'react';
import type { Plus } from '@tamagui/lucide-icons-2';
import { Button, SizableText, Spinner, XStack } from 'tamagui';

import { BUTTON, ICON, TEXT } from '@/constants/layout';

type IconComponent = typeof Plus;

const HIT_SLOP = 8;

export function HeaderActions({ children }: { children: ReactNode }) {
  return (
    <XStack items="center" gap="$1">
      {children}
    </XStack>
  );
}

export function HeaderIconButton({
  Icon,
  label,
  onPress,
  disabled = false,
  tone = '$color',
}: {
  Icon: IconComponent;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: '$color' | '$primary';
}) {
  return (
    <Button
      size={BUTTON.icon}
      circular
      chromeless
      onPress={onPress}
      disabled={disabled}
      opacity={disabled ? 0.4 : 1}
      hitSlop={HIT_SLOP}
      icon={<Icon size={ICON.row} color={tone} />}
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    />
  );
}

export function HeaderTextButton({
  label,
  onPress,
  disabled = false,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  const inactive = disabled || busy;

  return (
    <Button
      size={BUTTON.icon}
      chromeless
      px="$2"
      onPress={onPress}
      disabled={inactive}
      opacity={disabled ? 0.4 : 1}
      hitSlop={HIT_SLOP}
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}
    >
      {busy ? (
        <Spinner color="$primary" />
      ) : (
        <SizableText size={TEXT.subheading} fontWeight="700" color="$primary">
          {label}
        </SizableText>
      )}
    </Button>
  );
}
