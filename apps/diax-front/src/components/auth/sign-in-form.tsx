"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { signIn } from "next-auth/react";


export function SignInForm(): React.JSX.Element | null { 

  return (
    <Stack spacing={4}>
      <Button onClick={() => signIn()} type="button" variant="contained">
        Sign in
      </Button>
    </Stack>
  );
}
