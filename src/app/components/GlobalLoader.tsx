'use client';

import { useGlobalLoader } from '@/context/loader-context';

export default function GlobalLoader() {
  const { loading } = useGlobalLoader();

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80"
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div className="animate-spin h-16 w-16 rounded-full border-4 border-t-transparent border-gray-800" />
    </div>
  );
}
