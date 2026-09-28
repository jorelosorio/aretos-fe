import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { callbackRoutes } from '@/components/auth/callback-routes';
import { BrandSplash } from '@/components/brand/brand-splash';
import { useSession, useSignInStatus } from '@/features/auth/hooks';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const { isSigningIn, error } = useSignInStatus();
  const failed = error !== null;

  useEffect(() => {
    if (isSigningIn) return;
    for (const step of callbackRoutes({ isAuthenticated, failed })) {
      if (step.kind === 'replace') router.replace(step.href);
      else if (step.kind === 'dismissTo') router.dismissTo(step.href);
      else router.push(step.href);
    }
  }, [isSigningIn, isAuthenticated, failed, router]);

  return <BrandSplash />;
}
