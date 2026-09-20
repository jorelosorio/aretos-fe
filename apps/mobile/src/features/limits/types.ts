import type { Tier } from '@/features/auth';

/**
 * What the user's plan allows, mirroring `GET /v1/limits`
 * (`internal/api/v1/limits_service.go`).
 *
 * The server reports this from the same `resourceLimit` the create guard
 * uses, so what the app is told and what a POST enforces cannot drift.
 */

/** Resources the endpoint answers for — its `reportedResources`. */
export type LimitedResource = 'goal' | 'habit';

export type WireResourceLimit = {
  used: number;
  /** `null` when the plan sets no limit, which means unlimited, not zero. */
  limit: number | null;
  remaining: number | null;
  can_create: boolean;
};

export type WireLimits = {
  tier: string;
  resources: Partial<Record<LimitedResource, WireResourceLimit>>;
};

export type ResourceLimit = {
  used: number;
  limit: number | null;
  remaining: number | null;
  canCreate: boolean;
};

export type Limits = {
  tier: Tier;
  resources: Partial<Record<LimitedResource, ResourceLimit>>;
};

/**
 * One resource's allowance, in the shape a screen needs.
 *
 * `known` separates "the plan says no" from "the plan has not answered yet",
 * and `canCreate` defaults to true while unknown. A screen that hid its create
 * button on a failed or slow request would lock the user out of the app over a
 * number it only wanted for a label.
 */
export type Allowance = ResourceLimit & { known: boolean };

export const UNKNOWN_ALLOWANCE: Allowance = {
  known: false,
  canCreate: true,
  used: 0,
  limit: null,
  remaining: null,
};
