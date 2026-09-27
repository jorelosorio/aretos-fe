import { GoalForm } from '@/components/goals/goal-form';
import { EMPTY_DRAFT } from '@/features/goals/types';

export default function NewGoal() {
  return <GoalForm initial={EMPTY_DRAFT} />;
}
