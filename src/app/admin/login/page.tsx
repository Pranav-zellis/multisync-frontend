'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import LoginForm from '@/admin/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('id_token_admin');
    if (token) {
      router.push('/admin'); // redirect to dashboard if logged in
    } else {
      setLoading(false); // show login form
    }
  }, [router]);

  return (
    <>
      {loading ? (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid"></div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <LoginForm />
        </div>
      )}
    </>
  );
}
