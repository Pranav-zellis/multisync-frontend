"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Grid } from "@mui/material";
import TenantStatsCard from "./components/TenantStatsCard";
import SuperAdminCard from "./components/SuperAdminCard";

type User = {
  email?: string;
  sub?: string;
  username?: string;
  userPoolId?: string;
  id?: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, { credentials: "include" })
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={5} sx={{ minWidth: 340 }}>
          <TenantStatsCard />
        </Grid>
        <Grid item xs={12} md={5} sx={{ minWidth: 340 }}>
          <SuperAdminCard />
        </Grid>
      </Grid>
    </Container>
  );
}
