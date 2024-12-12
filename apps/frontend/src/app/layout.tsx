"use client";
import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';
import { AuthProvider } from 'react-oidc-context';
import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { getSiteURL } from '@/lib/get-site-url';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_bHo9GIUJg",
  client_id: "1dgddk7rc0bir0mt3g403kojcc",
  redirect_uri: getSiteURL().concat("callback"),
  response_type: "code",
  scope: "email openid phone",
};

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <React.StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
        <html lang="en">
          <body>
            <LocalizationProvider>
              <UserProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </UserProvider>
            </LocalizationProvider>
          </body>
        </html>
      </AuthProvider>
    </React.StrictMode>
  );
}
