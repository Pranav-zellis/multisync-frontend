'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useGlobalLoader } from '@/context/loader-context'; // ✅ Global loader
import LoginForm from '@/components/LoginForm';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    if (loading) {
      showLoader();
      return;
    }

    if (user) {
      showLoader();

      const tenant = Cookies.get('tenant');
      if (tenant) {
        router.replace('/dashboard');
      } else {
        router.replace('/tenants');
      }

      return;
    }

    hideLoader();
  }, [user, loading]);

  if (loading || user) return null;

  return <LoginForm />;
}
