'use client';

import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

const CognitoCallback = () => {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {      
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
