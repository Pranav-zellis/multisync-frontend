"use client";

import {
  DataGrid,
  GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGlobalLoader } from "@/context/loader-context";

interface Tenant {
  tenant_name: string;
  tenant_status: string;
  schema: string; // primary key
}

export default function TenantGridTable() {
  const { showLoader, hideLoader } = useGlobalLoader();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [errors, setErrors] = useState({
    tenantName: "",
    tenantStatus: "",
  });
  const [tenantName, setTenantName] = useState("");
  const [statusActive, setStatusActive] = useState(false);
  const [statusInactive, setStatusInactive] = useState(true);
  const [editingSchema, setEditingSchema] = useState<string | null>(null);
  const [gridLoading, setGridLoading] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchTenants = async () => {
    setGridLoading(true);

    try {
      const query = `
        query GetTenants($skip: Int, $take: Int, $search: String) {
          tenants(skip: $skip, take: $take, search: $search) {
            tenants {
              tenant_name
              tenant_status
              schema
            }
            totalCount
          }
        }
      `;
      const variables = {
        skip: paginationModel.page * paginationModel.pageSize,
        take: paginationModel.pageSize,
        search,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query, variables }),
      });

      const data = await res.json();

      setTenants(data.data?.tenants.tenants || []);
      setTotalCount(data.data?.tenants.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setGridLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [paginationModel, search]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { tenantName: "", tenantStatus: "" };
    const hasWhitespace = (value: string) => /\s/.test(value);

    if (!tenantName.trim()) {
      newErrors.tenantName = "Tenant name is required.";
      valid = false;
    } else if (tenantName.length > 100) {
      newErrors.tenantName = "Tenant name must not exceed 100 characters.";
      valid = false;
    } else if (hasWhitespace(tenantName)) {
      newErrors.tenantName = "Spaces are not allowed in tenant name.";
      valid = false;
    }

    if (!statusActive && !statusInactive) {
      newErrors.tenantStatus = "Please select tenant status.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const createTenantMutation = async (input: {
    tenant_name: string;
    tenant_status: "active" | "inactive";
  }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation CreateTenant($input: CreateTenantInput!) {
            createTenant(createTenantInput: $input) {
              tenant_name
              tenant_status
              schema
            }
          }
        `,
        variables: { input },
      }),
    });

    const json = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || "Failed to create tenant");
    }
    return json.data.createTenant;
  };

  // You can add updateTenantMutation & handleUpdate if needed (not included here)

  const handleSubmit = async () => {
    if (!validateForm()) return;
    showLoader();

    const status = statusActive ? "active" : "inactive";

    try {
      await createTenantMutation({
        tenant_name: tenantName,
        tenant_status: status,
      });

      setSnackbar({
        open: true,
        message: "Tenant created successfully",
        severity: "success",
      });

      fetchTenants();
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Error creating tenant:", err);
      setErrors((prev) => ({
        ...prev,
        tenantName: err.message || "Failed to create tenant",
      }));
      setSnackbar({
        open: true,
        message: err.message || "Failed to create tenant",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const resetForm = () => {
    setTenantName("");
    setStatusActive(false);
    setStatusInactive(true);
    setErrors({ tenantName: "", tenantStatus: "" });
    setEditingSchema(null);
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

  return (
    <Box>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box mb={2} display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6">Tenant List</Typography>
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="flex-end"
          gap={1}
          sx={{ width: "100%" }}
        >
          <TextField
            placeholder="Search..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => {
              setIsEditing(false);
              setDialogOpen(true);
              resetForm();
            }}
            sx={{
              whiteSpace: "nowrap",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.75, sm: 1 },
            }}
          >
            + Create Tenant
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box sx={{ overflowX: "auto" }}>
        <Box minWidth={600}>
          <DataGrid
            rows={tenants}
            columns={[
              { field: "tenant_name", headerName: "Tenant Name", flex: 1 },
              { field: "tenant_status", headerName: "Status", flex: 1 },
              { field: "schema", headerName: "Schema", flex: 1 },
              {
                field: "actions",
                headerName: "Actions",
                type: "actions",
                getActions: (params) => [
                  <GridActionsCellItem
                    icon={<span className="material-symbols-outlined">edit</span>}
                    label="Edit"
                    onClick={() => handleEdit(params.id as string)}
                  />,
                ],
              },
            ]}
            rowCount={totalCount}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={gridLoading}
            pageSizeOptions={[5, 10, 20]}
            autoHeight
            disableRowSelectionOnClick
            getRowId={(row) => row.schema}
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
              boxShadow: 2,
              border: "1px solid #e0e0e0",
              fontSize: 14,
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f9fafb",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "#f5f5f5",
              },
              "& .MuiDataGrid-footerContainer": {
                bgcolor: "#f9fafb",
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle align="center" sx={{ fontWeight: 600 }}>
          {isEditing ? "Edit Tenant" : "Create New Tenant"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              fullWidth
              label="Tenant Name"
              value={tenantName}
              onChange={(e) => {
                setTenantName(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, tenantName: "" }));
                }
              }}
              error={Boolean(errors.tenantName)}
              helperText={errors.tenantName}
            />
            <Box>
              <Typography fontWeight={500} mb={0.5}>
                Tenant Status
              </Typography>
              <Box display="flex" gap={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusActive}
                      onChange={(e) => {
                        setStatusActive(e.target.checked);
                        if (e.target.checked) {
                          setStatusInactive(false);
                          setErrors((prev) => ({ ...prev, tenantStatus: "" }));
                        }
                      }}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusInactive}
                      onChange={(e) => {
                        setStatusInactive(e.target.checked);
                        if (e.target.checked) {
                          setStatusActive(false);
                          setErrors((prev) => ({ ...prev, tenantStatus: "" }));
                        }
                      }}
                    />
                  }
                  label="Inactive"
                />
              </Box>
              {errors.tenantStatus && (
                <Typography variant="caption" color="error">
                  {errors.tenantStatus}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            {isEditing ? "Update Tenant" : "Create Tenant"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
