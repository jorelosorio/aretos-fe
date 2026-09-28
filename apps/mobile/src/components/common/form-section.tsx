import type { ReactNode } from 'react';
import { Button, SizableText, styled, XStack, YStack } from 'tamagui';

import { BUTTON, HIT_SLOP, ICON, SPACING, TEXT } from '@/constants/layout';

import type { IconComponent } from './icon-component';
import { SectionTitle } from './section-title';

export type SectionAction = {
  label: string;
  Icon?: IconComponent;
  onPress: () => void;
  disabled?: boolean;
};

export type SectionCounter = {
  count: number;
  max: number;
  label?: string;
};

export const FormHint = styled(SizableText, {
  size: TEXT.caption,
  color: '$mutedForeground',
  px: '$2',
});

export function FormCounter({ count, max, label }: SectionCounter) {
  return (
    <FormHint
      text="right"
      color={count >= max ? '$destructive' : '$mutedForeground'}
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
    >
      {`${count} / ${max}`}
    </FormHint>
  );
}

function ActionButton({
  label,
  Icon,
  onPress,
  disabled = false,
}: SectionAction) {
  return (
    <Button
      size={BUTTON.compact}
      chromeless
      px={0}
      hitSlop={HIT_SLOP}
      disabled={disabled}
      opacity={disabled ? 0.4 : 1}
      onPress={onPress}
      icon={Icon && <Icon size={ICON.row} color="$primary" />}
    >
      <SizableText size={TEXT.body} fontWeight="700" color="$primary">
        {label}
      </SizableText>
    </Button>
  );
}

export function FormSection({
  title,
  note,
  action,
  hint,
  error,
  counter,
  children,
}: {
  title: string;
  note?: string;
  action?: SectionAction;
  hint?: string;
  error?: string;
  counter?: SectionCounter;
  children: ReactNode;
}) {
  return (
    <YStack gap={SPACING.group}>
      <XStack items="center" justify="space-between" gap={SPACING.items}>
        <SectionTitle>
          {title}
          {note !== undefined && (
            <SizableText
              size={TEXT.body}
              fontFamily="$body"
              color="$mutedForeground"
            >
              {` ${note}`}
            </SizableText>
          )}
        </SectionTitle>

        {action !== undefined && <ActionButton {...action} />}
      </XStack>

      {children}

      {hint !== undefined && <FormHint>{hint}</FormHint>}
      {error !== undefined && <FormHint color="$destructive">{error}</FormHint>}
      {counter !== undefined && <FormCounter {...counter} />}
    </YStack>
  );
}
