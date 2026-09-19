import { TriangleAlert } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack } from 'tamagui';

/** Inline, non-blocking failure message. Renders nothing when there is none. */
export function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <XStack
      items="flex-start"
      gap="$2"
      p="$3"
      rounded="$lg"
      bg="$card"
      borderWidth={1}
      borderColor="$destructive"
    >
      <TriangleAlert size={16} color="$destructive" mt={2} />
      <Paragraph flex={1} size="$3" color="$destructive">
        {message}
      </Paragraph>
    </XStack>
  );
}
