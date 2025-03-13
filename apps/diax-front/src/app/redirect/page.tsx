"use client";

import { useEffect, Suspense } from "react";
import { redirect, useSearchParams } from "next/navigation";

const RedirectPage = () => {
  const searchParams = useSearchParams(); 

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      redirect("/dashboard");
    } else {
      redirect("/");
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
