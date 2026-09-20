import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { ScreenLoader } from '@/components/common/screen-loader';
import { CheckInScreen } from '@/components/logs/check-in-screen';
import { SPACING } from '@/constants/layout';
import { useGoal, useGoalErrorMessage } from '@/features/goals';
import { YStack } from 'tamagui';

export default function LogGoal() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { data: goal, isPending, error } = useGoal(goalId);
  const toMessage = useGoalErrorMessage();

  if (error) {
    return (
      <YStack flex={1} p={SPACING.screen} bg="$background">
        <ErrorNotice message={toMessage(error)} />
      </YStack>
    );
  }

  if (isPending || !goal) return <ScreenLoader />;

  return (
    <>
      <Stack.Screen options={{ title: goal.name }} />
      <CheckInScreen goal={goal} />
    </>
  );
}
