"use client";

import { LoaderProvider, useGlobalLoader } from "@/context/loader-context";
import { AuthProvider } from "@/context/auth-context";
import Shell from "@/components/Shell";
import GlobalLoader from "@/components/GlobalLoader";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoaderProvider>
      <GlobalLoader />
      <RouteChangeHandler />
      <AuthProvider>
        <Shell>{children}</Shell>
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
