'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useGlobalLoader } from '@/context/loader-context';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    if (loading) {
      // showLoader();
      return;
    }

    console.log(user);
    const token = Cookies.get("id_token");
    if (user && token) {
      const tenant = Cookies.get('tenant');
      if (tenant) {
        router.replace('/dashboard');
      } else {
        router.replace('/tenants');
      }
      return;
    }
    // 🔴 If not authenticated, redirect to Cognito login
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
  }, [user, loading]);

  return null; 
}
