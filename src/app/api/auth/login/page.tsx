'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to backend login
    window.location.href = 'http://localhost:4000/auth/login';
  }, []);

  return <p>Redirecting to login...</p>;
}
