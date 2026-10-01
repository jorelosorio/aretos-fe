import { Button, Spinner } from 'tamagui';

import { BUTTON } from '@/constants/layout';

export function SubmitButton({
  label,
  onPress,
  pending = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  pending?: boolean;
  disabled?: boolean;
}) {
  const inactive = pending || disabled;

  return (
    <Button
      size={BUTTON.primary}
      theme="accent"
      onPress={onPress}
      disabled={inactive}
      opacity={inactive ? 0.5 : 1}
      icon={pending ? <Spinner /> : undefined}
      accessibilityState={{ disabled: inactive, busy: pending }}
    >
      {label}
    </Button>
  );
}
