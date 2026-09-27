import { Input, TextArea, type InputProps, type TextAreaProps } from 'tamagui';

const TEXT_AREA_MIN_HEIGHT = 112;
const TEXT_AREA_LINES = 4;

export const FIELD = {
  bg: '$field',
  borderColor: '$fieldBorder',
  rounded: '$xl2',
} as const;

export function FormInput(props: InputProps) {
  return (
    <Input
      size="$5"
      placeholderTextColor="$fieldPlaceholder"
      {...FIELD}
      {...props}
    />
  );
}

export function FormTextArea(props: TextAreaProps) {
  return (
    <TextArea
      size="$5"
      placeholderTextColor="$fieldPlaceholder"
      multiline
      numberOfLines={TEXT_AREA_LINES}
      minH={TEXT_AREA_MIN_HEIGHT}
      verticalAlign="top"
      {...FIELD}
      {...props}
    />
  );
}
