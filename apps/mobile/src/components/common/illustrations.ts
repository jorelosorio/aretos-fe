import type { ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';

import allLogged from '@/assets/illustrations/all-logged.svg';
import noArchived from '@/assets/illustrations/no-archived.svg';
import noHabits from '@/assets/illustrations/no-habits.svg';
import nothingLogged from '@/assets/illustrations/nothing-logged.svg';

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
 * This lives in `components/` rather than `constants/` because an entry can
 * be a component — the animated ones — and `constants/` sits below the
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
   *
   * Still rather than animated, like the other two states that are about
   * the day's progress rather than a blank page: `nothingLogged` and
   * `noArchived`. A finished or waiting list is not a moment to perform.
   */
  allLogged,
  /**
   * Nothing logged yet in the current period: home's Logged tab.
   *
   * A desk calendar whose days are all still empty dashed circles, today's
   * ringed in terracotta, under a sun badge — the day has started and is
   * waiting, nothing has been missed. Drawn for the app, still, beside the
   * same plant and mug as `allLogged`, which is the same list once it fills.
   */
  nothingLogged,
  /**
   * No archived goals: the goals list's Archived filter.
   *
   * An open cardboard box, empty inside, with a blank label and an archive
   * badge: the place goals go when put away, with nothing in it yet. Drawn
   * for the app, still.
   */
  noArchived,
  /**
   * A goal with no habits yet: the goal's own screen.
   *
   * A clipboard checklist whose rows are all still blank — empty boxes and
   * unwritten lines, the first box dashed in terracotta as the one to fill —
   * with a pencil leaning against it and a plus badge, which is the action
   * the empty state offers. Drawn for the app, still, beside the same plant
   * as `noArchived` and `nothingLogged`.
   */
  noHabits,
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
