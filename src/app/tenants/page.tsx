"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useGlobalLoader } from "@/context/loader-context"; // ✅ global loader

type User = {
  username?: string;
  groups?: string[];
};

export default function AccountsPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useGlobalLoader(); // ✅ hook
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    const existingTenant = Cookies.get("tenant");

    if (existingTenant) {
      showLoader();
      router.replace("/dashboard");
      return;
    }

    showLoader();
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData: User | null) => {
        if (userData?.groups) {
          setGroups(userData.groups);
        }
      })
      .catch(() => {
        setGroups([]);
      })
      .finally(() => {
        hideLoader();
      });
  }, [router]);

  const handleAccountClick = (groupName: string) => {
    showLoader();
    Cookies.set("tenant", groupName, {
      path: "/",
      sameSite: "Lax",
    });
    router.push("/dashboard");
  };

  return (
    <Box className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-semibold text-gray-800">
          Tenants
        </Typography>

        <Button
          variant="outlined"
          sx={{
            borderColor: "#FFA726",
            color: "#FFA726",
            textTransform: "none",
            borderRadius: 2,
            px: 2,
          }}
          onClick={() => {
            showLoader();
            router.push("/super_admin_portal/dashboard");
          }}
        >
          <span className="material-symbols-outlined text-base mr-1">
            admin_panel_settings
          </span>
          Admin Portal
        </Button>
      </div>

      {groups.length === 0 ? (
        <Typography variant="body1" className="text-gray-600 mt-4">
          No tenants found for your account.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={group}>
              <Card
                variant="outlined"
                onClick={() => handleAccountClick(group)}
                className="transition duration-200 border hover:shadow-md rounded-xl cursor-pointer"
                sx={{
                  height: "100%",
                  borderColor: "#E0E0E0",
                  "&:hover": {
                    borderColor: "#FF9800",
                  },
                  width: "250px",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    className="font-semibold text-gray-800"
                  >
                    {group}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    (Supplier)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
