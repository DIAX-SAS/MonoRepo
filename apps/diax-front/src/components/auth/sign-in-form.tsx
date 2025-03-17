"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignInForm(): React.JSX.Element | null {
  const router = useRouter();
  const { status } = useSession(); // ✅ Get session status & errors

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") return null; // ✅ Prevent flickering

  return (
    <Stack spacing={4}>
      <Button onClick={() => signIn()} type="button" variant="contained">
        Sign in
      </Button>
    </Stack>
  );
}
