'use client';

import { LoaderProvider } from "@/context/loader-context";
import { AuthProvider } from "@/context/auth-context";
import Shell from "@/components/Shell";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LoaderProvider>
        <AuthProvider>
          <Shell>
            {children}
          </Shell>
        </AuthProvider>
      </LoaderProvider>
    </QueryClientProvider>
  );
}
