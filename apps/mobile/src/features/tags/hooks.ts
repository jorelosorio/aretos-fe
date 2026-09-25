import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchTags, tagKeys } from './api';

/** The server's own default. The API accepts 1–50. */
const DEFAULT_LIMIT = 10;

/**
 * Autocomplete, and the diary's filter chips when `q` is empty.
 *
 * `keepPreviousData` keeps the last suggestions on screen while the next
 * keystroke's arrive, so the list under the input does not blink empty on
 * every character.
 */
export function useTags(
  q: string,
  { limit = DEFAULT_LIMIT }: { limit?: number } = {},
) {
  return useQuery({
    queryKey: tagKeys.search(q, limit),
    queryFn: () => searchTags(q, limit),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
