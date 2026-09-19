import { SizableText } from 'tamagui';

export function SectionTitle({ children }: { children: string }) {
  return (
    <SizableText
      size="$2"
      color="$mutedForeground"
      fontFamily="$body"
      fontWeight="600"
      letterSpacing={0.8}
      px="$2"
    >
      {children.toUpperCase()}
    </SizableText>
  );
}
