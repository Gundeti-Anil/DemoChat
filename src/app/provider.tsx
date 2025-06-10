'use client';

import { SessionProvider } from 'next-auth/react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// const queryClient = new QueryClient();

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (

    <SessionProvider session={session}>{children}</SessionProvider>

  );
}

