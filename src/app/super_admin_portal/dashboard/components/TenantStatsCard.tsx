"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, Stack, Button } from "@mui/material"; // Stable MUI Grid
import TenantDialog from "../../tenants/components/TenantDialog";
import GlobalSnackbar from "@/components/GlobalSnackbar";
import { useGlobalLoader } from "@/context/loader-context";
import { CREATE_TENANT_MUTATION } from "../../tenants/ts/schema";
import { GridLegacy as Grid } from "@mui/material";

type TenantStatus = {
  active: number;
  inactive: number;
};

type ErrorsType = {
  tenantName: string;
  tenantStatus: string;
};

export default function TenantStatsCard() {
  const [tenantStatus, setTenantStatus] = useState<TenantStatus>({
    active: 0,
    inactive: 0,
  });

  const { showLoader, hideLoader } = useGlobalLoader();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [tenantName, setTenantName] = useState<string>("");
  const [statusActive, setStatusActive] = useState<boolean>(false);
  const [statusInactive, setStatusInactive] = useState<boolean>(false);
  const [statusFlaggedToDelete, setStatusFlaggedToDelete] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsType>({
    tenantName: "",
    tenantStatus: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const router = useRouter();

  // Fetch tenant stats
  const fetchTenantStats = useCallback(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
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
      })
      .catch((err) => {
        console.error("Failed to fetch tenant stats:", err);
      });
  }, []);

  useEffect(() => {
    fetchTenantStats();
  }, [fetchTenantStats]);

  // Create tenant
  const createTenant = async (input: {
    tenant_name: string;
    tenant_status: "active" | "inactive";
  }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: CREATE_TENANT_MUTATION,
        variables: { input },
      }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || "Failed to create tenant");
    }
    return json.data.createTenant;
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async () => {
    try {
      showLoader();
      await createTenant({
        tenant_name: tenantName,
        tenant_status: statusActive ? "active" : "inactive",
      });
      showSnackbar("Tenant created successfully", "success");

      fetchTenantStats(); // Refresh stats after creating tenant

      // Reset and close dialog
      setDialogOpen(false);
      setTenantName("");
      setStatusActive(false);
      setStatusInactive(false);
      setStatusFlaggedToDelete(false);
      setErrors({ tenantName: "", tenantStatus: "" });
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Failed to save tenant:", error);
      const errMsg =
        error instanceof Error ? error.message : "Failed to save tenant";
      showSnackbar(errMsg, "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />

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
        <Typography variant="h6" align="center" fontWeight={600} gutterBottom>
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
          <Grid  item xs={6}>
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
            onClick={() => setDialogOpen(true)}
          >
            Create New Tenant
          </Button>
        </Stack>
      </Card>

      <TenantDialog
        open={dialogOpen}
        tenantName={tenantName}
        setTenantName={setTenantName}
        statusActive={statusActive}
        setStatusActive={setStatusActive}
        statusInactive={statusInactive}
        setStatusInactive={setStatusInactive}
        statusFlaggedToDelete={statusFlaggedToDelete}
        setStatusFlaggedToDelete={setStatusFlaggedToDelete}
        errors={errors}
        setErrors={setErrors}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        isEditing={isEditing}
      />
    </>
  );
}
