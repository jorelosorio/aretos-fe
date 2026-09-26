import allLogged from '@/assets/illustrations/all-logged.svg';
import mindMap from '@/assets/illustrations/Mind map-cuate.svg';

/**
 * The app's illustrations, named by the state they stand for.
 *
 * Screens ask for a situation rather than a filename, so swapping the drawing
 * for an empty state is one line here instead of a grep across four screens —
 * and the licence these carry (see `components/settings/credits.ts`) stays
 * attached to one import rather than scattered through the UI.
 *
 * Changing a drawing here can change what has to be credited: Storyset asks
 * for the collection the drawing came from, so a swap across collections means
 * `credits.ts` moves with it.
 */
export const ILLUSTRATIONS = {
  /** No goals yet: home and the goals list. */
  noGoals: mindMap,
  /**
   * Every goal logged for the current period: home's Today tab.
   *
   * Drawn for the app rather than taken from Storyset, in the same flat
   * style and palette as `noGoals` so the two read as one set. Being our
   * own, it adds nothing to `credits.ts`.
   */
  allLogged,
} as const;
