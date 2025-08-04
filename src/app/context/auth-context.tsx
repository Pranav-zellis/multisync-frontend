"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useGlobalLoader } from "@/context/loader-context";

// Define the AuthUser type
export interface AuthUser {
  username: string;
  userPoolId: string;
  customAttributes?: {
    email?: string;
    [key: string]: unknown;
  };
  groups?: string[];
}

// AuthContext type
type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
};

// Create AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    const token = Cookies.get("id_token");

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      showLoader();
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          { credentials: "include" }
        );

        if (res.ok) {
          const data = await res.json();
          setUser(data as AuthUser); // Ensure data matches AuthUser shape
        }
      } catch (err) {
        console.error("Auth fetch failed", err);
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    fetchUser();
  }, [showLoader, hideLoader]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
