"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  DataGrid,
  GridPaginationModel,
  GridCellModesModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import TenantToolbar from "./TenantToolbar";
import TenantDialog from "./TenantDialog";
import GlobalSnackbar from "@/components/GlobalSnackbar";
import { Tenant } from "../ts/TenantTypes";
import {
  GET_TENANTS_QUERY,
  CREATE_TENANT_MUTATION,
  UPDATE_TENANT_MUTATION,
} from "../ts/schema";
import { useGlobalLoader } from "@/context/loader-context";

export default function TenantGrid() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  const [totalCount, setTotalCount] = useState(0);
  const [gridLoading, setGridLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchema, setEditingSchema] = useState<string | null>(null);

  const [tenantName, setTenantName] = useState("");
  const [tenantStatus, setTenantStatus] = useState<"active" | "inactive">("inactive");

  const [errors, setErrors] = useState({ tenantName: "", tenantStatus: "" });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const { showLoader, hideLoader } = useGlobalLoader();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [paginationModel, search]);

  const columns = [
    {
      field: "tenant_name",
      headerName: "Tenant Name",
      flex: 1,
      editable: true,
    },
    {
      field: "tenant_status",
      headerName: "Status",
      flex: 1,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    { field: "schema", headerName: "Schema", flex: 1 },
    { field: "created_at", headerName: "Created At", flex: 1 },
    { field: "last_modified", headerName: "Last Modified", flex: 1 },
  ];

  const fetchTenants = async () => {
    setGridLoading(true);
    try {
      const variables = {
        skip: paginationModel.page * paginationModel.pageSize,
        take: paginationModel.pageSize,
        search,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: GET_TENANTS_QUERY, variables }),
      });

      const json = await res.json();

      if (!res.ok || json.errors) {
        throw new Error(json.errors?.[0]?.message || "Failed to fetch tenants");
      }

      if (isMounted.current) {
        setTenants(json.data.tenants.tenants);
        setTotalCount(json.data.tenants.totalCount);
      }
    } catch (error) {
      console.error("Fetch tenants error:", error);
      showSnackbar("Failed to load tenants", "error");
    } finally {
      setGridLoading(false);
    }
  };

  const updateTenant = async (input: {
    schema: string;
    tenant_name: string;
    tenant_status: "active" | "inactive";
  }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query: UPDATE_TENANT_MUTATION, variables: { input } }),
    });

    const json = await res.json();

    if (!res.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || "Failed to update tenant");
    }

    return json.data.updateTenant;
  };

  const showSnackbar = (message: string, severity: typeof snackbar.severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEdit = (schema: string) => {
    const tenant = tenants.find((t) => t.schema === schema);
    if (!tenant) return;
    setIsEditing(true);
    setEditingSchema(schema);
    setTenantName(tenant.tenant_name);
    setTenantStatus(tenant.tenant_status);
    setErrors({ tenantName: "", tenantStatus: "" });
    setDialogOpen(true);
  };

  const processRowUpdate = async (updatedRow: Tenant, oldRow: Tenant) => {
    const hasChanged =
      updatedRow.tenant_name !== oldRow.tenant_name ||
      updatedRow.tenant_status !== oldRow.tenant_status;

    if (!hasChanged) return oldRow;

    try {
      const updated = await updateTenant({
        schema: updatedRow.schema,
        tenant_name: updatedRow.tenant_name,
        tenant_status: updatedRow.tenant_status,
      });
      showSnackbar("Tenant updated successfully", "success");
      return updated;
    } catch (error: any) {
      console.error("Update error:", error);
      showSnackbar("Failed to update tenant", "error");
      throw error;
    }
  };

  return (
    <Box>
      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />

      <TenantToolbar
        search={search}
        setSearch={setSearch}
        onCreateClick={() => {
          setIsEditing(false);
          setDialogOpen(true);
          setTenantName("");
          setTenantStatus("inactive");
          setErrors({ tenantName: "", tenantStatus: "" });
          setEditingSchema(null);
        }}
      />

      <Box sx={{ overflowX: "auto" }}>
        <DataGrid
          rows={tenants}
          columns={columns}
          getRowId={(row) => row.schema}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalCount}
          pageSizeOptions={[5, 10, 20]}
          paginationMode="server"
          loading={gridLoading}
          cellModesModel={cellModesModel}
          onCellModesModelChange={setCellModesModel}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) =>
            showSnackbar(error.message || "Update failed", "error")
          }
          disableRowSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          autoHeight
        />
      </Box>

      <TenantDialog
        open={dialogOpen}
        tenantName={tenantName}
        setTenantName={setTenantName}
        tenantStatus={tenantStatus}
        setTenantStatus={setTenantStatus}
        errors={errors}
        onClose={() => setDialogOpen(false)}
        onSave={() => {
          // Add or update save logic as needed
        }}
        isEditing={isEditing}
      />
    </Box>
  );
}
