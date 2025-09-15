"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useGlobalLoader } from "@/context/loader-context";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showLoader } = useGlobalLoader();

  useEffect(() => {
    if (loading) {
      showLoader();
      return;
    }
    const token = Cookies.get("id_token");
    // console.log('token');
    // console.log(token);
    if (user && token) {
      const tenant = Cookies.get("tenant");
      if (tenant) {
        router.replace("/dashboard");
      } else {
        router.replace("/tenants");
      }
      return;
    }
    // 🔴 If not authenticated, redirect to Cognito login
    // console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
  }, [user, loading, router, showLoader]); // <-- added router and showLoader

  return null;
}
