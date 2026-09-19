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
  // Mirrors app foreground state into React Query's focus tracking.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (status) =>
      focusManager.setFocused(status === 'active'),
    );
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
