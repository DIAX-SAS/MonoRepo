"use client"; // ✅ Mark as a Client Component since it uses `SessionProvider`

import "../styles/global.css";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>

      <html lang="en">
        <body>
          {children}
        </body>
      </html>

    </SessionProvider>
  );
}
