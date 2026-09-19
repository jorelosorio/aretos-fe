import { Redirect } from 'expo-router';

import { ScreenLoader } from '@/components/common/screen-loader';
import { useSession, useSignInStatus } from '@/features/auth';

export default function AuthCallbackScreen() {
  const { isAuthenticated } = useSession();
  const { isSigningIn } = useSignInStatus();

  if (isSigningIn) return <ScreenLoader />;

  return <Redirect href={isAuthenticated ? '/' : '/login'} />;
}
