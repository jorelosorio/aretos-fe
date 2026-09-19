import { Spinner, YStack } from 'tamagui';

/** Fills the screen while something blocking resolves. */
export function ScreenLoader() {
  return (
    <YStack flex={1} items="center" justify="center" bg="$background">
      <Spinner size="large" color="$primary" />
    </YStack>
  );
}
