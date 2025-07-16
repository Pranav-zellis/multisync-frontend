"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Stack,
  Box,
  Chip,
} from "@mui/material";

type User = {
  email?: string;
  sub?: string;
  username?: string;
  userPoolId?: string;
  id?: string;
};

type SuperAdmin = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
};

type TenantStatus = {
  active: number;
  inactive: number;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [tenantStatus, setTenantStatus] = useState<TenantStatus>({
    active: 0,
    inactive: 0,
  });

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
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
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          query {
            getAllActiveUsers {
              id
              username
              email
              first_name
              last_name
              phone_number
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result?.data?.getAllActiveUsers) {
          setSuperAdmins(result.data.getAllActiveUsers);
        }
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          query {
            tenantStatus {
              active
              inactive
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result?.data?.tenantStatus) {
          setTenantStatus(result.data.tenantStatus);
        }
      });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {/* Tenant Stats */}
        <Grid item xs={12} md={5} sx={{ minWidth: 340 }}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backgroundColor: "#f7f9ff",
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              align="center"
              fontWeight={600}
              gutterBottom
            >
              Tenant Stats
            </Typography>

            <Grid container spacing={10} justifyContent="center">
              <Grid item xs={6}>
                <Typography
                  align="left"
                  variant="h4"
                  color="#5071a5"
                  fontWeight={700}
                >
                  {tenantStatus.active}
                </Typography>
                <Typography align="center" variant="body2">
                  Active tenants
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  align="right"
                  variant="h4"
                  color="#5071a5"
                  fontWeight={700}
                >
                  {tenantStatus.inactive}
                </Typography>
                <Typography align="center" variant="body2">
                  Inactive tenants
                </Typography>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#FFA726",
                  color: "#FFA726",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                }}
                onClick={() => router.push("/super_admin_portal/tenants")}
              >
                Tenants Info
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#FFA726",
                  color: "#FFA726",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Create New Tenant
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Super Admins */}
        <Grid item xs={12} md={5} sx={{ minWidth: 340 }}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backgroundColor: "#f7f9ff",
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              align="center"
              fontWeight={600}
              gutterBottom
            >
              Super Admins
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1.2,
                minHeight: 64,
                mt: 2,
              }}
            >
              {superAdmins.length > 0 ? (
                superAdmins.map((admin) => (
                  <Chip
                    key={admin.id}
                    label={admin.username}
                    variant="outlined"
                    sx={{
                      borderColor: "#5071a5",
                      color: "#5071a5",
                      textTransform: "capitalize",
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      px: 2,
                      height: 32,
                    }}
                  />
                ))
              ) : (
                <Typography align="center" color="text.secondary">
                  No admins yet
                </Typography>
              )}
            </Box>

            <Box textAlign="center" mt={3}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#FFA726",
                  color: "#FFA726",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Create New Admin
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
