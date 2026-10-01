import { XStack, YStack } from 'tamagui';

import { SPACING } from '@/constants/layout';
import { INPUT_STEPS, type InputStep } from '@/features/guide/steps';
import { useTranslations } from '@/lib/i18n';

const LINE = { width: 44, height: 4 };

export function GuideProgress({ step }: { step: InputStep }) {
  const { t } = useTranslations();
  const current = INPUT_STEPS.indexOf(step);
  const label = t('guide.progress', {
    current: current + 1,
    total: INPUT_STEPS.length,
  });

  return (
    <XStack
      gap={SPACING.items}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: INPUT_STEPS.length, now: current + 1 }}
    >
      {INPUT_STEPS.map((item, index) => (
        <YStack
          key={item}
          width={LINE.width}
          height={LINE.height}
          rounded={LINE.height / 2}
          bg={index <= current ? '$primary' : '$mutedForeground'}
        />
      ))}
    </XStack>
  );
}
