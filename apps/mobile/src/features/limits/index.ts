/** Public surface of the limits feature — nothing outside it should reach deeper. */
export { limitKeys } from './api';
export { useAllowance, useLimits } from './hooks';
export type { Allowance, LimitedResource, Limits } from './types';
