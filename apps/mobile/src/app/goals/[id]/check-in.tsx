import { useLocalSearchParams } from 'expo-router';

import { CheckInScreen } from '@/components/logs/check-in-screen';

export default function GoalCheckIn() {
  const { id, date, locked } = useLocalSearchParams<{
    id: string;
    date?: string;
    locked?: string;
  }>();

  return <CheckInScreen goalId={id} date={date} locked={locked === '1'} />;
}
