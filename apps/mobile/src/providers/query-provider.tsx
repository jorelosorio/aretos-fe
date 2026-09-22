import { useEffect, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { ApiError } from '@/lib/api';
import { refreshTimezone } from '@/lib/timezone';

// Side effect: hands the axios client its session bridge before any component
// can fire a request. See `features/auth/refresh.ts`.
import '@/features/auth/refresh';

// React Query has no `window` to listen to on native, so connectivity comes
// from NetInfo. Process-wide state, so registered at module scope.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mobile screens remount constantly; without this every tab switch refetches.
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // 4xx will fail the same way again. A 401 is already handled by the
        // interceptor, which retries once with a fresh token.
        const status = error instanceof ApiError ? (error.status ?? 0) : 0;
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    // Nothing here is safely repeatable: a one-time auth code is spent on first
    // use, and a replayed refresh token revokes its whole family.
    mutations: { retry: false },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  // Mirrors app foreground state into React Query's focus tracking, and picks
  // up a change of timezone while it was away.
  //
  // Foreground is when a zone moves: you change zones by flying, and the app
  // is backgrounded while you do. Nothing observes `Intl`, so this is the one
  // moment the change is noticed — a DST rollover is caught the next time the
  // app comes back.
  //
  // Everything is invalidated rather than the three key prefixes that
  // actually depend on the zone. A zone change is rare enough that the few
  // wasted refetches cost nothing, and a predicate listing the affected
  // features is a list a future one has to remember to join — where
  // forgetting shows up as stale-zone data and no warning.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');

      if (status === 'active' && refreshTimezone()) {
        void queryClient.invalidateQueries();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
