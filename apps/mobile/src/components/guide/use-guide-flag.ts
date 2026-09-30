import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useSession } from '@/features/auth/hooks';
import { setFlag, useFlag } from '@/lib/flags';

/**
 * Accounts the guide was opened for since launch. Guards against opening it
 * twice for one account: development mounts every effect twice, and the home
 * screen can remount while the guide is still on top of it.
 */
const openedFor = new Set<string>();

/**
 * Opens the guide over the home screen for an account that has not been
 * through it yet — a new account's first sign-in, in practice.
 */
export function useGuideAutoOpen() {
  const router = useRouter();
  const { session } = useSession();
  const [pending] = useFlag('guidePending');
  const userId = session?.userId ?? null;

  useEffect(() => {
    if (!pending || userId === null || openedFor.has(userId)) return;
    openedFor.add(userId);
    router.push('/guide');
  }, [pending, userId, router]);
}

/**
 * Settles the flag when the guide goes away, however it goes: backed out of,
 * finished, or left for the analysis. On unmount rather than on open, so a
 * guide cut short by a crash is offered again on the next launch.
 */
export function useMarkGuideSeen() {
  useEffect(() => () => setFlag('guidePending', false), []);
}
