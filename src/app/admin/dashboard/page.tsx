"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";

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
          router.push("/api/admin/login");
        } else {
          alert("Logout failed");
        }
      })
      .catch(() => alert("Logout failed"));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              <strong>ID:</strong> {user.id}
            </Typography>
            <Typography variant="body1">
              <strong>Username:</strong> {user.username}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>User Pool ID:</strong> {user.userPoolId}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography color="error" align="center">
          User not found or not logged in.
        </Typography>
      )}
    </Container>
  );
}
