import { Button, H1, Paragraph, XStack, YStack } from 'tamagui';
import { ChartNoAxesColumn, Plus } from '@tamagui/lucide-icons-2';

export default function Inicio() {
  return (
    <YStack flex={1} p="$4" gap="$2">
      <Paragraph color="$mutedForeground">Viernes, 11 de septiembre</Paragraph>
      <H1>Buenos días</H1>

      <XStack gap="$3" mt="$3">
        <Button theme="accent" icon={Plus}>
          Registrar
        </Button>
        <Button icon={ChartNoAxesColumn}>Ver mi progreso</Button>
      </XStack>
    </YStack>
  );
}
