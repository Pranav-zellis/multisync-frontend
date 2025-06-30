'use client';

import { useEffect, useState } from 'react';

type User = {
  email?: string;
  sub?: string;
  username?: string;
  userPoolId?: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/auth/me', {
      credentials: 'include',
    })
      .then(res => (res.ok ? res.json() : null))
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ padding: 20, position: 'relative' }}>
      <h1>Welcome to the App</h1>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid"></div>
        </div>
      )}

      {!loading && (
        <>
          {user ? (
            <>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User Pool ID:</strong> {user.userPoolId}</p>
              <a href="/api/auth/logout">Logout</a>
            </>
          ) : (
            <a href="/api/auth/login">Login</a>
          )}
        </>
      )}
    </main>
  );
}
