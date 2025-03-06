'use client';
import * as React from 'react';
import '@/styles/global.css';
import { getSiteURL } from '@/components/utils/get-site-url';
import { AuthProvider } from 'react-oidc-context';

interface LayoutProps {
  children: React.ReactNode;
}
const cognitoAuthConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_bHo9GIUJg',
  client_id: '1dgddk7rc0bir0mt3g403kojcc',
  redirect_uri: getSiteURL().concat('redirect'),
  response_type: 'code',
  scope: 'email openid phone',
  automaticSilentRenew: true,
  loadUserInfo: true,
};

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <React.StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
        <html lang="en">
          <body>
           {children}
          </body>
        </html>
      </AuthProvider>
    </React.StrictMode>
  );
}
