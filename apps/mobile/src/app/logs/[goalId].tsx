import { useLocalSearchParams } from 'expo-router';

import { CheckInScreen } from '@/components/logs/check-in-screen';

export default function LogGoal() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  return <CheckInScreen goalId={goalId} />;
}
