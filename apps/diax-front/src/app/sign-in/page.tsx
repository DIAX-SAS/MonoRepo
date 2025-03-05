import * as React from 'react';

import { Layout } from '@/components/auth/layout';
import { GuestGuard } from '@/components/auth/guest-guard';
import { SignInForm } from '@/components/auth/sign-in-form';


export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <SignInForm />
      </GuestGuard>
    </Layout>
  );
}
