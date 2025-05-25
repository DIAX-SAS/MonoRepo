'use client';

import { Button, Stack } from '../core';
import { signIn } from 'next-auth/react';

export function SignInForm(): React.JSX.Element | null {
  return (
    <Stack spacing={4}>
      <Button onClick={() => signIn()} type="button" variant="contained">
        Sign in
      </Button>
    </Stack>
  );
}
