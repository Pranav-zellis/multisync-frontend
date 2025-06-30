"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ App Router redirect hook

type User = {
  email?: string;
  sub?: string;
  username?: string;
  userPoolId?: string;
  id?: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    fetch("http://localhost:4000/admin/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  // Redirect to login page if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [loading, user, router]);

  const handleLogout = () => {
    fetch("http://localhost:4000/admin/logout", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setUser(null);
          router.push("/api/admin/login"); // redirect after logout
        } else {
          alert("Logout failed");
        }
      })
      .catch(() => alert("Logout failed"));
  };

  return (
    <main style={{ padding: 20, position: "relative" }}>
      <h1>Welcome to the App</h1>

      {user && (
        <>
          <p>
            <strong>Id:</strong> {user.id}
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>User Pool ID:</strong> {user.userPoolId}
          </p>
          <button
            onClick={handleLogout}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            Logout
          </button>
        </>
      )}
    </main>
  );
}
