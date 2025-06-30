'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

type User = {
  email?: string;
  username?: string;
  userPoolId?: string;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:4000/auth/me', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(userData => {
        setUser(userData);
        setLoading(false);

        if (userData) {
          router.push('/dashboard');
        }
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid"></div>
      </div>
    );
  }

  // If not logged in, show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm />
    </div>
  );
}
