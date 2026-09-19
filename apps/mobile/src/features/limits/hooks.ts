import { useQuery } from '@tanstack/react-query';

import { getLimits, limitKeys } from './api';
import {
  UNKNOWN_ALLOWANCE,
  type Allowance,
  type LimitedResource,
} from './types';

/**
 * The plan's limits. Refreshed by the mutations that move a usage count, so
 * the interval only covers a plan that changed elsewhere.
 */
export function useLimits() {
  return useQuery({
    queryKey: limitKeys.mine(),
    queryFn: getLimits,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** One resource's allowance. Permissive until the server has answered. */
export function useAllowance(resource: LimitedResource): Allowance {
  const { data: limits } = useLimits();
  const entry = limits?.resources[resource];

  return entry ? { ...entry, known: true } : UNKNOWN_ALLOWANCE;
}
