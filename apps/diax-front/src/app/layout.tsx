"use client"; // ✅ Mark as a Client Component since it uses `SessionProvider`

import { AuthGuard } from '../components/auth/auth-guard';
import "../styles/global.css";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <html lang="en">
        <body>
          <AuthGuard>
            {children}
          </AuthGuard>
        </body>
      </html>
    </SessionProvider>
  );
}
