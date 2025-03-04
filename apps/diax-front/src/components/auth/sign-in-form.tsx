"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useAuth } from "react-oidc-context";

export function SignInForm(): React.JSX.Element {
  const auth = useAuth();
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
      </Stack>
      <Button
        onClick={() => auth.signinRedirect()}
        type="button"
        variant="contained"
      >
        Sign in with COGNITO
      </Button>
    </Stack>
  );
}
