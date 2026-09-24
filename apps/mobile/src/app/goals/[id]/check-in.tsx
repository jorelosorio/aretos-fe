import { useLocalSearchParams } from 'expo-router';

import { CheckInScreen } from '@/components/logs/check-in-screen';

export default function GoalCheckIn() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();

  return <CheckInScreen goalId={id} date={date} />;
}
