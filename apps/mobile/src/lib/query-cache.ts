/**
 * Seeding a detail query from a list already in the cache.
 *
 * `initialData` on its own is not enough. React Query dates undated initial
 * data to the moment the query mounts, so a row lifted from a list fetched
 * ten minutes ago looks brand new, is considered fresh for `staleTime`, and
 * then — because the mount itself is what started the clock — refetches on
 * every later mount anyway. Three screens opening the same goal produced
 * three identical requests that way.
 *
 * Handing back the list's own `dataUpdatedAt` fixes both halves: the seeded
 * row inherits the list's age, so it goes stale when the list would have and
 * a second screen opening the same row inside the window asks for nothing.
 */

import type { QueryClient, QueryKey } from '@tanstack/react-query';

export type CachedRow<T> = {
  row: T;
  /** When the list this came from was fetched, for `initialDataUpdatedAt`. */
  updatedAt: number;
};

/**
 * The freshest cached copy of one row, looked up across every list under
 * `listsKey`.
 *
 * Lists are searched newest first rather than stopping at the first hit,
 * because the same goal appears in more than one of them — the plain list and
 * the one carrying `?include=progress` are separate cache entries — and the
 * older copy is the one that would send the detail query back to the network.
 */
export function seedFromLists<T extends { id: string }>(
  queryClient: QueryClient,
  listsKey: QueryKey,
  id: string,
): CachedRow<T> | undefined {
  let best: CachedRow<T> | undefined;

  for (const query of queryClient.getQueryCache().findAll({
    queryKey: listsKey,
  })) {
    const rows = query.state.data as readonly T[] | undefined;
    const row = rows?.find((candidate) => candidate.id === id);

    if (row === undefined) continue;
    if (best !== undefined && query.state.dataUpdatedAt <= best.updatedAt) {
      continue;
    }

    best = { row, updatedAt: query.state.dataUpdatedAt };
  }

  return best;
}
