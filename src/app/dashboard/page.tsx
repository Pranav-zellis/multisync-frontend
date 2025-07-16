"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

type User = {
  email?: string;
  sub?: string;
  username?: string;
  userPoolId?: string;
  customAttributes?: {
    email?: string;
  };
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
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

    const tenantCookie = Cookies.get("tenant");
    if (tenantCookie) {
      setTenant(tenantCookie);
    }
  }, []);

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <CircularProgress size={60} />
      ) : (
        <Card sx={{ maxWidth: 500, width: "100%", p: 3, bgcolor: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Welcome to the App
            </Typography>

            {user ? (
              <>
                <Typography variant="subtitle1">
                  <strong>Username:</strong> {user.username}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Email:</strong> {user.customAttributes?.email}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>User Pool ID:</strong> {user.userPoolId}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Tenant:</strong> {tenant ?? "Not selected"}
                </Typography>

                <Box mt={3}>
                  <Button
                    variant="outlined"
                    color="error"
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  href="/api/auth/login"
                >
                  Login
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
