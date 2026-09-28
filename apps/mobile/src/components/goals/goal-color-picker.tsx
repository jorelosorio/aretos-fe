import { Check } from '@tamagui/lucide-icons-2/icons/Check';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/components/common/card';
import { FormSection } from '@/components/common/form-section';
import { ICON, SPACING } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { GOAL_COLORS } from './slot-color';

const SWATCH = 32;
const RING = 2;
const HIT_SLOP = 6;
const COLUMN = '25%';

export function GoalColorPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (slot: number) => void;
}) {
  const { t } = useTranslations();

  return (
    <FormSection title={t('goals.form.color')}>
      <Card>
        <XStack
          flexWrap="wrap"
          rowGap={SPACING.items}
          accessibilityRole="radiogroup"
          accessibilityLabel={t('goals.form.color')}
        >
          {GOAL_COLORS.map(({ token, name }, slot) => {
            const selected = slot === value;

            return (
              <YStack key={token} width={COLUMN} items="center">
                <YStack
                  width={SWATCH + RING * 4}
                  height={SWATCH + RING * 4}
                  rounded={SWATCH}
                  items="center"
                  justify="center"
                  borderWidth={RING}
                  borderColor={selected ? token : 'transparent'}
                  onPress={() => onChange(slot)}
                  pressStyle={{ opacity: 0.7 }}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={t(name)}
                >
                  <YStack
                    width={SWATCH}
                    height={SWATCH}
                    rounded={SWATCH / 2}
                    bg={token}
                    items="center"
                    justify="center"
                  >
                    {selected && <Check size={ICON.row} color="$card" />}
                  </YStack>
                </YStack>
              </YStack>
            );
          })}
        </XStack>
      </Card>
    </FormSection>
  );
}
