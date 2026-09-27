import type { ReactNode } from 'react';
import { SizableText, styled, XStack, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';

import { SectionTitle } from './section-title';

export const FormHint = styled(SizableText, {
  size: TEXT.caption,
  color: '$mutedForeground',
  px: '$2',
});

export function FormSection({
  title,
  action,
  hint,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <YStack gap={SPACING.group}>
      {action === undefined ? (
        <SectionTitle>{title}</SectionTitle>
      ) : (
        <XStack items="center" justify="space-between" gap={SPACING.items}>
          <SectionTitle>{title}</SectionTitle>
          {action}
        </XStack>
      )}

      {children}

      {typeof hint === 'string' ? <FormHint>{hint}</FormHint> : hint}
    </YStack>
  );
}
