import type { ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';

import allLogged from '@/assets/illustrations/all-logged.svg';

import { EmptyDiaryArt } from './empty-diary-art';
import { NoDataArt } from './no-data-art';
import { NoGoalsArt } from './no-goals-art';

/**
 * A drawing an empty state can show: a still image, or a component that draws
 * itself at the size it is given — the form an animated one takes.
 */
export type Illustration =
  ImageSourcePropType | ComponentType<{ size: number }>;

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
 *
 * This lives in `components/` rather than `constants/` since `noGoals` became
 * animated: an entry can now be a component, and `constants/` sits below the
 * components in the import order.
 */
export const ILLUSTRATIONS = {
  /**
   * No goals yet: home and the goals list.
   *
   * Animated: the girl taps her pencil against her cheek, the three goal
   * ideas float, the sparkles twinkle and the thought dots pulse in turn.
   * Still under Reduce Motion. The drawing and its credit are described in
   * `no-goals-art-layers.ts`.
   */
  noGoals: NoGoalsArt,
  /**
   * Every goal logged for the current period: home's Today tab.
   *
   * Drawn for the app rather than taken from Storyset, in the same flat
   * style and palette as `noGoals` so the two read as one set. Being our
   * own, it adds nothing to `credits.ts`.
   */
  allLogged,
  /**
   * No notes yet: the diary with no tag filter applied.
   *
   * Animated: Storyset's left-handed girl writes along a line of her notebook
   * — the pencil moves in small strokes while the line fills in behind it,
   * then lifts back to the start — as the pencil badge floats and the
   * sparkles twinkle. Still under Reduce Motion, on the finished line.
   * Credited in `credits.ts`, described in `empty-diary-art-layers.ts`.
   *
   * A filtered diary that matches nothing keeps its plain tag icon — the
   * diary is not empty there, the filter is.
   */
  emptyDiary: EmptyDiaryArt,
  /**
   * The analysis tab with nothing to read: no goals yet, or goals with
   * nothing logged in the window. The tab keeps one drawing for being empty
   * rather than borrowing `noGoals`, so an empty chart reads as its own state.
   *
   * Animated like `noGoals`, and with a person of its own rather than the
   * same girl: Storyset's man from "Server status", recoloured to the set,
   * points up at an empty chart with his arm waving gently from the
   * shoulder, while the dashed bars rise and settle as if data were on its
   * way, the hourglass badge floats and the sparkles twinkle. Still under
   * Reduce Motion. Credited in `credits.ts`, described in
   * `no-data-art-layers.ts`.
   */
  noData: NoDataArt,
} as const satisfies Record<string, Illustration>;
