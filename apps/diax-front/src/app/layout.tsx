'use client';
import * as React from 'react';
import '../styles/global.css';
import { AuthProvider } from 'react-oidc-context';
import { config } from '../config';

interface LayoutProps {
  children: React.ReactNode;
}
const cognitoAuthConfig = {
  authority: config.auth.authority,
  client_id: config.auth.clientId,
  redirect_uri: config.auth.redirectUri,
  response_type: config.auth.response_type,
  scope: config.auth.scope,
  automaticSilentRenew: true,
  loadUserInfo: true,
};

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <React.StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Application of DIAX SAS"></meta>
            <title>Diax</title>
          </head>
          <body>
           {children}
          </body>
        </html>
      </AuthProvider>
    </React.StrictMode>
  );
}
