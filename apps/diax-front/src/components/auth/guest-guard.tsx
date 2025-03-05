'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import { useAuth } from 'react-oidc-context';
export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
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

    if (auth.isAuthenticated) {
      console.log('[GuestGuard]: User is logged in, redirecting to dashboard');
      router.replace("/redirect");
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
