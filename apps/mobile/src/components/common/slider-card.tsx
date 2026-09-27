import { SizableText, Slider, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';

export function SliderCard({
  display,
  value,
  min,
  max,
  step,
  onChange,
  label,
}: {
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <YStack gap={SPACING.items} p={SPACING.card} bg="$card" rounded="$xl2">
      <SizableText
        size={TEXT.display}
        fontWeight="700"
        color="$primary"
        text="center"
      >
        {display}
      </SizableText>

      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        accessibilityLabel={label}
      >
        <Slider.Track bg="$muted" size="$1">
          <Slider.TrackActive bg="$primary" />
        </Slider.Track>
        <Slider.Thumb
          index={0}
          circular
          size="$2"
          bg="$primary"
          borderColor="$background"
        />
      </Slider>
    </YStack>
  );
}
