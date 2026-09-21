import { ScrollView, YStack } from 'tamagui';

import { SPACING } from '@/constants/layout';

import { Attributions } from './attributions';

export function LicensesScreen() {
  return (
    <ScrollView flex={1} bg="$background" contentContainerStyle={{ grow: 1 }}>
      <YStack flex={1} p={SPACING.screen} gap={SPACING.section}>
        <Attributions />
      </YStack>
    </ScrollView>
  );
}
