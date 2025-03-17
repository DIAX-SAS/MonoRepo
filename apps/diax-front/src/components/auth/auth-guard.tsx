"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current route
  const { status } = useSession();

  useEffect(() => {
    if ( !status || status === "loading" ) return; // ✅ Avoid unnecessary execution

    if (status === "unauthenticated") {
      console.log("[AuthGuard]: User is not logged in, redirecting to /sign-in");
      router.replace("/sign-in");
      return;
    }

    if (status === "authenticated" && (pathname === "/" || pathname === "/sign-in")) {
      console.log("[AuthGuard]: User is authenticated, redirecting to /dashboard");
      router.replace("/dashboard");
    }
  }, [status, pathname, router]);

  if (status === "loading") return <div>Loading...</div>; // ✅ Prevent flickering

  return <>{children}</>;
}
