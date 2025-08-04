"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";  // ✅ Correct import
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useGlobalLoader } from "@/context/loader-context";

import AccountsHeader from "./components/AccountsHeader";
import TenantCard from "./components/TenantCard";
import EmptyState from "./components/EmptyState";
import { GET_TENANTS_SCHEMA } from "./ts/schema";
import { useAuth } from "@/context/auth-context";
import { GridLegacy as Grid } from "@mui/material";

type Tenant = {
  schema: string;
  tenant_name: string;
  tenant_status: string;
};

type UserInput = {
  username: string;
  email: string;
  role: string;
};

export default function AccountsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const router = useRouter();
  const { showLoader, hideLoader } = useGlobalLoader();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const token = Cookies.get("id_token");
    const existingTenant = Cookies.get("tenant");

    if (!token) {
      showLoader();
      router.replace("/");
      hideLoader();
      return;
    }

    if (existingTenant) {
      showLoader();
      router.replace("/dashboard");
      hideLoader();
      return;
    }

    if (!user || hasFetched) return;

    async function fetchTenants() {
      try {
        showLoader();

        const userInput: UserInput = {
          username: user?.username ?? "",
          email: user?.customAttributes?.email ?? "",
          role: String(user?.customAttributes?.["custom:users_role"] ?? ""),
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: GET_TENANTS_SCHEMA, variables: { user: userInput } }),
        });

        const json = await res.json();

        if (!res.ok || json.errors) {
          console.error("Error fetching tenants:", json.errors || res.statusText);
          setTenants([]);
        } else {
          setTenants(json.data.tenantsBySchemas || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setTenants([]);
      } finally {
        hideLoader();
        setHasFetched(true);
      }
    }

    fetchTenants();
  }, [user, loading, hasFetched, router, showLoader, hideLoader]);

  const handleAccountClick = (schema: string, status: string) => {
    if (status === "inactive" || status === "flagged_to_delete") return;

    showLoader();
    Cookies.set("tenant", schema, { path: "/", sameSite: "Lax" });
    router.push("/dashboard");

    setTimeout(() => {
      hideLoader();
    }, 800);
  };

  return (
    <Box>
      <AccountsHeader
        showAdmin={user?.customAttributes?.["custom:users_role"] === "Super Admin"}
      />

      {tenants.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid container spacing={2}>
          {tenants.map((tenant) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tenant.schema}>
              <Box sx={{ height: "100%" }}>
                <TenantCard
                  group={tenant.tenant_name}
                  status={tenant.tenant_status}
                  onClick={() => handleAccountClick(tenant.schema, tenant.tenant_status)}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
