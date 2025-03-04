'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useAuth } from 'react-oidc-context';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const auth = useAuth(); 
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    if (auth.error) {
      setIsChecking(false);
      return;
    }

    if (!auth.isAuthenticated) {
      logger.debug('[AuthGuard]: User is not logged in, redirecting to sign in');
      router.replace(paths.auth.signIn);
      return;
    }

    setIsChecking(false);
  }, [router, auth.isLoading, auth.error, auth.isAuthenticated]);

  if (isChecking) {
    return null;
  }

  if (auth.error) {
    return <Alert color="error">{auth.error.message}</Alert>;
  }

  return <React.Fragment>{children}</React.Fragment>;
}
