'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // loading state

  useEffect(() => {
    const token = Cookies.get('id_token_admin');
    console.log('Token:', token);

    if (token) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login'); // no token, stop loading to show form
    }
  }, [router]);

  return (
    <>
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid"></div>
        </div>
      )}
    </>
  );
}
