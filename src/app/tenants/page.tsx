"use client";

import React, { useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useGlobalLoader } from "@/context/loader-context";

import AccountsHeader from "./components/AccountsHeader";
import TenantCard from "./components/TenantCard";
import EmptyState from "./components/EmptyState";

type User = {
  username?: string;
  groups?: string[];
};

export default function AccountsPage() {
  const [groups, setGroups] = useState<string[]>([]);
  const router = useRouter();
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    const existingTenant = Cookies.get("tenant");

    if (existingTenant) {
      showLoader();
      router.replace("/dashboard");
      return;
    }

    const fetchTenants = async () => {
      try {
        showLoader();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch tenants");

        const userData: User = await res.json();
        if (userData?.groups) {
          setGroups(userData.groups);
        } else {
          setGroups([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setGroups([]);
      } finally {
        hideLoader();
      }
    };

    fetchTenants();
  }, [router]);

  const handleAccountClick = (groupName: string) => {
    showLoader();
    Cookies.set("tenant", groupName, { path: "/", sameSite: "Lax" });
    router.push("/dashboard");
  };

  return (
    <Box className="p-8">
      <AccountsHeader />

      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={group}>
              <TenantCard group={group} onClick={handleAccountClick} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
