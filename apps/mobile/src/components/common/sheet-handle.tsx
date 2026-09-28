import { YStack } from 'tamagui';

import { SHEET, SPACING } from '@/constants/layout';

export function SheetHandle({
  label,
  onActivate,
}: {
  label?: string;
  onActivate?: () => void;
}) {
  const actionable = onActivate !== undefined;

  return (
    <YStack items="center" pt={SPACING.group} pb={SPACING.items}>
      <YStack
        width={SHEET.handle.width}
        height={SHEET.handle.height}
        rounded={SHEET.handle.height}
        bg="$mutedForeground"
        opacity={0.35}
        accessible={actionable}
        accessibilityRole={actionable ? 'button' : undefined}
        accessibilityLabel={label}
        accessibilityActions={actionable ? [{ name: 'activate' }] : undefined}
        onAccessibilityAction={onActivate}
      />
    </YStack>
  );
}
