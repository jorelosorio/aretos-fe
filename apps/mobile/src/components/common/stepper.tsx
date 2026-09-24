import { Minus, Plus } from '@tamagui/lucide-icons-2';
import { Button, SizableText, XStack } from 'tamagui';
import { BUTTON, TEXT } from '@/constants/layout';

export function Stepper({
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
  label: string;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <XStack
      items="center"
      justify="space-between"
      p="$2"
      bg="$card"
      rounded="$xl2"
      borderWidth={1}
      borderColor="$border"
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
    >
      <Button
        size={BUTTON.icon}
        circular
        chromeless
        disabled={value <= min}
        opacity={value <= min ? 0.4 : 1}
        onPress={() => onChange(clamp(value - step))}
        icon={<Minus size={20} color="$color" />}
        accessibilityLabel={`${label} −`}
      />

      <SizableText size={TEXT.display} fontWeight="700" color="$cardForeground">
        {suffix ? `${value} ${suffix}` : String(value)}
      </SizableText>

      <Button
        size={BUTTON.icon}
        circular
        chromeless
        disabled={value >= max}
        opacity={value >= max ? 0.4 : 1}
        onPress={() => onChange(clamp(value + step))}
        icon={<Plus size={20} color="$color" />}
        accessibilityLabel={`${label} +`}
      />
    </XStack>
  );
}
