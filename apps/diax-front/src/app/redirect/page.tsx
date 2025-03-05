"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const RedirectPage = () => {
  const searchParams = useSearchParams(); // ✅ Next.js way

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      window.location.replace("/dashboard");
    } else {
      window.location.replace("/");
    }
  }, [searchParams]);

  return null;
};

// ✅ Wrap in Suspense boundary
export default function WrappedRedirectPage() {
  return (
    <Suspense fallback={null}>
      <RedirectPage />
    </Suspense>
  );
}
