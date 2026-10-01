import { Button, Spinner } from 'tamagui';

import { BUTTON } from '@/constants/layout';

export function SubmitButton({
  label,
  onPress,
  pending = false,
  disabled = false,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  pending?: boolean;
  disabled?: boolean;
  destructive?: boolean;
}) {
  const inactive = pending || disabled;

  return (
    <Button
      size={BUTTON.primary}
      theme={destructive ? undefined : 'accent'}
      bg={destructive ? '$destructive' : undefined}
      color={destructive ? '$destructiveForeground' : undefined}
      onPress={onPress}
      disabled={inactive}
      opacity={inactive ? 0.5 : 1}
      icon={
        pending ? (
          <Spinner color={destructive ? '$destructiveForeground' : undefined} />
        ) : undefined
      }
      accessibilityState={{ disabled: inactive, busy: pending }}
    >
      {label}
    </Button>
  );
}
