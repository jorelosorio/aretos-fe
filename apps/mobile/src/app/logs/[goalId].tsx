import { useLocalSearchParams } from 'expo-router';

import { CheckInScreen } from '@/components/logs/check-in-screen';

export default function LogGoal() {
  const { goalId, date } = useLocalSearchParams<{
    goalId: string;
    date?: string;
  }>();

  return <CheckInScreen goalId={goalId} date={date} />;
}
