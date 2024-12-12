'use client';

import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

import { authClient } from '@/lib/auth/client';

const CognitoCallback = () => {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {      
      authClient.signInWithOAuth({ provider: 'cognito', accessToken: auth.user?.access_token, idToken:auth.user?.id_token });
      window.location.href = '/dashboard';
    }
  }, [auth.isAuthenticated, auth.user?.access_token, auth.user?.id_token]);

  if (auth.activeNavigator === 'signinRedirect') {
    return <div>Authentication in progress..</div>;
  }

  if (auth.error) {
    return <div>Error to sign in: {auth.error.message}</div>;
  }

  return <div>Loading...</div>;
};

export default CognitoCallback;
