/**
 * The props a custom `tabBar` is handed, read off the navigator itself.
 *
 * React Navigation's own `BottomTabBarProps` is only reachable through
 * `expo-router/build/react-navigation/bottom-tabs`, and a deep import into a
 * package's build output is the kind of path a minor version moves without
 * it counting as a breaking change.
 *
 * Taking the parameter of the `tabBar` prop we actually pass cannot go stale
 * the same way: if the signature changes, the bar stops compiling instead of
 * quietly taking the wrong shape.
 */

import type { ComponentProps } from 'react';
import type { Tabs } from 'expo-router';

export type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];
