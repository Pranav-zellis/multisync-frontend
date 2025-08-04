"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useGlobalLoader } from "@/context/loader-context";
import { useAuth } from "@/context/auth-context";

export default function Dashboard() {
  const router = useRouter();
  const [tenant, setTenant] = useState<string | null>(null);
  const { showLoader } = useGlobalLoader();
  const { user } = useAuth();

  useEffect(() => {
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
                <strong>Email:</strong> {user.customAttributes?.email || "N/A"}
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
                  onClick={() => {
                    showLoader();
                    fetch(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
                      {
                        method: "GET",
                        credentials: "include",
                      }
                    ).then(() => {
                      Cookies.remove("tenant");
                      router.push("/");
                    });
                  }}
                >
                  Logout
                </Button>
              </Box>
            </>
          ) : (
            <Box mt={2}>
              <Button variant="contained" color="primary" href="/api/auth/login">
                Login
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
