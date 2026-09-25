import { api } from '@/lib/api';

import type { Tag, WireTag, WireTags } from './types';

/** Requests for the tags feature, mirroring `aretos-be/bruno/Tags/`. */
const paths = {
  tags: '/v1/tags',
};

/**
 * `q` is keyed trimmed and lower-cased because the server matches it that
 * way: "Wo" and "wo " are one answer, and caching them twice would only
 * make the suggestions flicker between identical lists.
 */
export const tagKeys = {
  all: ['tags'] as const,
  search: (q: string, limit: number) =>
    [...tagKeys.all, 'search', q.trim().toLowerCase(), limit] as const,
};

const toTag = (wire: WireTag): Tag => ({
  id: wire.id,
  name: wire.name,
  uses: wire.uses,
});

/**
 * The user's tags starting with `q`, ignoring case, most used first. An
 * empty `q` is left off the request, which the server reads as "every tag" —
 * the most used ones, which is what a picker offers before anything is typed.
 */
export async function searchTags(q: string, limit: number): Promise<Tag[]> {
  const prefix = q.trim();

  const { data } = await api.get<WireTags>(paths.tags, {
    params: { limit, ...(prefix === '' ? {} : { q: prefix }) },
  });

  return data.tags.map(toTag);
}
