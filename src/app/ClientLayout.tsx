"use client";

import { LoaderProvider, useGlobalLoader } from "@/context/loader-context";
import { AuthProvider } from "@/context/auth-context";
import Shell from "@/components/Shell";
import GlobalLoader from "@/components/GlobalLoader";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


export default function ClientLayout({ children }: { children: React.ReactNode }) {

  const [queryClient] = useState(() => new QueryClient());
  return (
    <LoaderProvider>
      <GlobalLoader />
      <RouteChangeHandler />
      <AuthProvider>
        <Shell><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></Shell>
      </AuthProvider>
    </LoaderProvider>
  );
}

function RouteChangeHandler() {
  const { showLoader, hideLoader } = useGlobalLoader();
  const pathname = usePathname();

  useEffect(() => {
    showLoader();
    const timeout = setTimeout(() => hideLoader(), 300);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
