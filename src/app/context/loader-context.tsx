"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import GlobalLoader from "@/components/GlobalLoader";

let externalShowLoader: () => void = () => {};
let externalHideLoader: () => void = () => {};

export const setExternalLoaderControl = (
  show: () => void,
  hide: () => void
) => {
  externalShowLoader = show;
  externalHideLoader = hide;
};

export const showGlobalLoader = () => externalShowLoader();
export const hideGlobalLoader = () => externalHideLoader();

interface LoaderContextType {
  showLoader: () => void;
  hideLoader: () => void;
  loading: boolean;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const useGlobalLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (!context)
    throw new Error("useGlobalLoader must be used within LoaderProvider");
  return context;
};

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const countRef = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showLoader = useCallback(() => {
    countRef.current += 1;
    // console.log("Loader shown, count:", countRef.current);
    if (countRef.current === 1) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setLoading(true);
    }
  }, []);

  const hideLoader = useCallback(() => {
    if (countRef.current === 0) return;
    countRef.current -= 1;
    // console.log("Loader hide called, count:", countRef.current);

    if (countRef.current === 0) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        // console.log("Loader hidden");
        setLoading(false);
        hideTimeoutRef.current = null;
      }, 150);
    }
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    setExternalLoaderControl(showLoader, hideLoader);
  }, [showLoader, hideLoader]);

  useEffect(() => {
    // console.log("Route changed:", pathname);
    showLoader();

    const timeout = setTimeout(() => {
      // console.log("Timeout fired - hiding loader");
      hideLoader();
    }, 700);

    return () => {
      // console.log("Cleanup: clearing timeout");
      clearTimeout(timeout);
    };
  }, [pathname, showLoader, hideLoader]);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, loading }}>
      {loading && <GlobalLoader />}
      {children}
    </LoaderContext.Provider>
  );
}
