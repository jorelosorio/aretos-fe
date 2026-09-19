import { ApiError, api } from '@/lib/api';

import type { Limits, WireLimits, WireResourceLimit } from './types';

const paths = {
  limits: '/v1/limits',
};

export const limitKeys = {
  all: ['limits'] as const,
  mine: () => [...limitKeys.all, 'mine'] as const,
};

const toResourceLimit = (wire: WireResourceLimit) => ({
  used: wire.used,
  limit: wire.limit,
  remaining: wire.remaining,
  canCreate: wire.can_create,
});

/**
 * The caller's plan and their usage of it.
 *
 * A 404 resolves to `null` rather than throwing, which keeps the app working
 * against a server older than this endpoint: no limits reported reads as no
 * limits known, and nothing is blocked. Every other status still throws.
 */
export async function getLimits(): Promise<Limits | null> {
  try {
    const { data } = await api.get<WireLimits>(paths.limits);

    return {
      tier: data.tier,
      resources: Object.fromEntries(
        Object.entries(data.resources).map(([resource, limit]) => [
          resource,
          toResourceLimit(limit),
        ]),
      ),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
