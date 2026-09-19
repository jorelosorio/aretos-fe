/** Public surface of the auth feature — nothing outside it should reach deeper. */
export {
  useAuthErrorMessage,
  useSession,
  useSessionAutoRefresh,
  useSignIn,
  useSignInStatus,
  useSignOut,
} from './hooks';
export type { Session, Tier } from './types';
