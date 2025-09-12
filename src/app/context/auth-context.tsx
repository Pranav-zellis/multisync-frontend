"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useGlobalLoader } from "@/context/loader-context";

interface AuthUser {
  username: string;
  first_name: string;
  groups: string[];
  userPoolId: string;
  customAttributes: {
    email: string;
    email_verified: string;
    phone_number: string;
    phone_number_verified: string;
    name: string;
    family_name: string;
    "custom:inviter_name": string;
    "custom:users_role": string;
    sub: string;
  };
}

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
          {
            credentials: "include",
          }
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
  }, [showLoader, hideLoader]); // <-- added here

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
