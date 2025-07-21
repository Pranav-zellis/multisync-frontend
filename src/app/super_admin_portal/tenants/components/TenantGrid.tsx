"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  DataGrid,
  GridPaginationModel,
  GridCellModesModel,
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
import TenantActionsMenu from "./TenantActions";
import SuperUserDialog from "../../admin_users/components/SuperUserDialog";
import { useAuth } from "@/context/auth-context";

export interface SuperUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export default function TenantGrid() {
  const { user, loading: authLoading } = useAuth();
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
  const [superUserDialogOpen, setSuperUserDialogOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingSchema, setEditingSchema] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [statusActive, setStatusActive] = useState(false);
  const [statusInactive, setStatusInactive] = useState(true);
  const [selectedUser, setSelectedUser] = useState<SuperUser | null>(null);
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
    {
      field: "actions",
      headerName: "",
      flex: 0.3,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <TenantActionsMenu
          schema={params.row.schema}
          tenantName={params.row.tenant_name} // ✅ pass this
          onCreateAdmin={handleCreateAdminClick}
        />
      ),

    },
  ];

  const fetchTenants = async () => {
    if (!isMounted.current) return;
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
    } catch (error: any) {
      console.error("Fetch tenants error:", error);
      showSnackbar(error.message || "Failed to load tenants", "error");
    } finally {
      if (isMounted.current) {
        setGridLoading(false);
      }
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

  const createTenant = async (input: {
    tenant_name: string;
    tenant_status: "active" | "inactive";
  }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ query: CREATE_TENANT_MUTATION, variables: { input } }),
    });

    const json = await res.json();

    if (!res.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || "Failed to create tenant");
    }

    return json.data.createTenant;
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
    setStatusActive(tenant.tenant_status === "active");
    setStatusInactive(tenant.tenant_status === "inactive");
    setErrors({ tenantName: "", tenantStatus: "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    let hasError = false;

    if (!tenantName.trim()) {
      setErrors((prev) => ({ ...prev, tenantName: "Tenant name is required" }));
      hasError = true;
    }

    if (!statusActive && !statusInactive) {
      setErrors((prev) => ({ ...prev, tenantStatus: "Select tenant status" }));
      hasError = true;
    }

    if (hasError) return;

    try {
      showLoader();

      if (isEditing && editingSchema) {
        await updateTenant({
          schema: editingSchema,
          tenant_name: tenantName,
          tenant_status: statusActive ? "active" : "inactive",
        });
        showSnackbar("Tenant updated successfully", "success");
      } else {
        await createTenant({
          tenant_name: tenantName,
          tenant_status: statusActive ? "active" : "inactive",
        });
        showSnackbar("Tenant created successfully", "success");
      }

      fetchTenants();
      setDialogOpen(false);
      setTenantName("");
      setStatusActive(false);
      setStatusInactive(true);
      setErrors({ tenantName: "", tenantStatus: "" });
      setIsEditing(false);
      setEditingSchema(null);
    } catch (error: any) {
      console.error("Save error:", error);
      showSnackbar(error.message || "Failed to save tenant", "error");
    } finally {
      hideLoader();
    }
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

  const handleCreateAdminClick = (schema: string, tenantName: string) => {
    setSelectedUser({
      id: "",
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
    });
    setEditingSchema(schema); // optional if needed later
    setTenantName(tenantName); // for dialog title if needed
    setSuperUserDialogOpen(true);
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
          setStatusActive(false);
          setStatusInactive(true);
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
        statusActive={statusActive}
        setStatusActive={setStatusActive}
        statusInactive={statusInactive}
        setStatusInactive={setStatusInactive}
        errors={errors}
        setErrors={setErrors}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        isEditing={isEditing}
      />

      <SuperUserDialog
        open={superUserDialogOpen}
        user={selectedUser}
        inviterName={user?.username || ""}
        title={isEditing ? "Edit Admin User" : `Create Admin for "${tenantName}"`}
        isEditing={false}
        usersRole="Admin"
        button_title="Admin"
        groups={[tenantName]} // ✅ set dynamic group based on tenant name
        onClose={() => {
          setSuperUserDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setSuperUserDialogOpen(false);
          setSelectedUser(null);
        }}
        setSnackbar={setSnackbar}
      />

    </Box>
  );
}
