'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import GlobalLoader from '@/components/GlobalLoader';

let externalShowLoader: () => void = () => {};
let externalHideLoader: () => void = () => {};

export const setExternalLoaderControl = (show: () => void, hide: () => void) => {
  externalShowLoader = show;
  externalHideLoader = hide;
};

export const showGlobalLoader = () => externalShowLoader();
export const hideGlobalLoader = () => externalHideLoader();

const LoaderContext = createContext<{
  showLoader: () => void;
  hideLoader: () => void;
  loading: boolean;
} | undefined>(undefined);

export const useGlobalLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error('useGlobalLoader must be used within LoaderProvider');
  return context;
};

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showLoader = () => {
    if (!loading) setLoading(true);
  };

  const hideLoader = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setLoading(false), 150); // debounce
  };

  useEffect(() => {
    setExternalLoaderControl(showLoader, hideLoader);
  }, []);

  // ✅ Trigger loader on route change
  useEffect(() => {
    showLoader();

    // optional debounce to simulate page transition delay
    const timeout = setTimeout(() => {
      hideLoader();
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname]);

  

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, loading }}>
      {loading && <GlobalLoader />}
      {children}
    </LoaderContext.Provider>
  );
}

