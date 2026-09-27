import { SizableText, Slider, XStack, YStack } from 'tamagui';

import { SPACING, TEXT } from '@/constants/layout';

import { Card } from './card';

const THUMB = 28;
const THUMB_RING = 3;
const THUMB_SHADOW = '0px 1px 4px rgba(0, 0, 0, 0.24)';

export function SliderCard({
  format,
  value,
  min,
  max,
  step,
  onChange,
  label,
}: {
  format: (value: number) => string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <Card>
      <SizableText
        size={TEXT.display}
        fontWeight="700"
        color="$primary"
        text="center"
      >
        {format(value)}
      </SizableText>

      <YStack gap={SPACING.group}>
        <Slider
          size="$4"
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([next]) => onChange(next)}
          accessibilityLabel={label}
        >
          <Slider.Track bg="$muted">
            <Slider.TrackActive bg="$primary" />
          </Slider.Track>
          <Slider.Thumb
            index={0}
            circular
            size={THUMB}
            bg="$card"
            borderWidth={THUMB_RING}
            borderColor="$primary"
            boxShadow={THUMB_SHADOW}
            pressStyle={{ bg: '$card', borderColor: '$primary', scale: 1.15 }}
          />
        </Slider>

        <XStack justify="space-between">
          <SizableText size={TEXT.micro} color="$mutedForeground">
            {format(min)}
          </SizableText>
          <SizableText size={TEXT.micro} color="$mutedForeground">
            {format(max)}
          </SizableText>
        </XStack>
      </YStack>
    </Card>
  );
}
